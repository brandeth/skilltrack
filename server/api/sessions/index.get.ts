export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const query = getQuery(event);

  const skillId = typeof query.skillId === "string" ? query.skillId : undefined;
  const from = typeof query.from === "string" ? query.from : undefined;
  const to = typeof query.to === "string" ? query.to : undefined;
  const limit =
    typeof query.limit === "string"
      ? Math.min(parseInt(query.limit, 10) || 500, 1000)
      : 500;

  let builder = client
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (skillId) {
    builder = builder.eq("skill_id", skillId);
  }
  if (from) {
    builder = builder.gte("date", from);
  }
  if (to) {
    builder = builder.lte("date", to);
  }

  const { data, error } = await builder;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data.map((row) => ({
    id: row.id,
    skillId: row.skill_id,
    durationMinutes: row.duration_minutes,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
  }));
});
