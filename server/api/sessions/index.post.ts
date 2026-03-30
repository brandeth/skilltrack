export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const body = await readBody(event);

  const skillId = typeof body.skillId === "string" ? body.skillId : "";
  if (!skillId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Skill ID is required.",
    });
  }

  const durationMinutes =
    typeof body.durationMinutes === "number"
      ? Math.round(body.durationMinutes)
      : 0;
  if (durationMinutes < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Duration must be at least 1 minute.",
    });
  }

  const date =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : null;
  if (!date) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid date (YYYY-MM-DD) is required.",
    });
  }

  const notes =
    typeof body.notes === "string" && body.notes.trim()
      ? body.notes.trim()
      : null;

  // Verify the skill belongs to this user
  const { data: skill, error: skillError } = await client
    .from("skills")
    .select("id")
    .eq("id", skillId)
    .eq("user_id", user.id)
    .single();

  if (skillError || !skill) {
    throw createError({ statusCode: 404, statusMessage: "Skill not found." });
  }

  const { data, error } = await client
    .from("sessions")
    .insert({
      user_id: user.id,
      skill_id: skillId,
      duration_minutes: durationMinutes,
      date,
      notes,
    })
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return {
    id: data.id,
    skillId: data.skill_id,
    durationMinutes: data.duration_minutes,
    date: data.date,
    notes: data.notes,
    createdAt: data.created_at,
  };
});
