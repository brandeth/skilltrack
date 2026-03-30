export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);

  const { data, error } = await client
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    goal: row.goal_type
      ? { type: row.goal_type, targetHours: Number(row.goal_target_hours) }
      : null,
    createdAt: row.created_at,
  }));
});
