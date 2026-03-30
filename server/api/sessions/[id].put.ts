import type { Database } from "~~/app/types/database.types";

type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Session ID is required.",
    });
  }

  const updates: SessionUpdate = {};

  if (typeof body.durationMinutes === "number") {
    const mins = Math.round(body.durationMinutes);
    if (mins < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Duration must be at least 1 minute.",
      });
    }
    updates.duration_minutes = mins;
  }

  if (typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    updates.date = body.date;
  }

  if (body.notes !== undefined) {
    updates.notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null;
  }

  if (typeof body.skillId === "string" && body.skillId) {
    // Verify the new skill belongs to this user
    const { data: skill, error: skillError } = await client
      .from("skills")
      .select("id")
      .eq("id", body.skillId)
      .eq("user_id", user.id)
      .single();

    if (skillError || !skill) {
      throw createError({ statusCode: 404, statusMessage: "Skill not found." });
    }
    updates.skill_id = body.skillId;
  }

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields to update.",
    });
  }

  const { data, error } = await client
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw createError({
        statusCode: 404,
        statusMessage: "Session not found.",
      });
    }
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
