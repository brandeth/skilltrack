export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const body = await readBody(event);

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Skill name is required.",
    });
  }

  const color = typeof body.color === "string" ? body.color : "#059669";
  const goalType =
    body.goalType === "weekly" || body.goalType === "total"
      ? body.goalType
      : null;
  const goalTargetHours =
    goalType && typeof body.targetHours === "number" && body.targetHours > 0
      ? body.targetHours
      : null;

  if (goalType && !goalTargetHours) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Goal target hours must be positive when goal type is set.",
    });
  }

  const { data, error } = await client
    .from("skills")
    .insert({
      user_id: user.id,
      name,
      color,
      goal_type: goalType,
      goal_target_hours: goalTargetHours,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "A skill with that name already exists.",
      });
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    goal: data.goal_type
      ? { type: data.goal_type, targetHours: Number(data.goal_target_hours) }
      : null,
    createdAt: data.created_at,
  };
});
