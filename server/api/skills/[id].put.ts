import type { Database } from "~~/app/types/database.types";

type SkillUpdate = Database["public"]["Tables"]["skills"]["Update"];

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Skill ID is required.",
    });
  }

  const updates: SkillUpdate = {};

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.color === "string") {
    updates.color = body.color;
  }
  if (body.goalType === "weekly" || body.goalType === "total") {
    if (typeof body.targetHours !== "number" || body.targetHours <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Goal target hours must be positive.",
      });
    }
    updates.goal_type = body.goalType;
    updates.goal_target_hours = body.targetHours;
  } else if (body.goalType === null || body.goalType === "") {
    updates.goal_type = null;
    updates.goal_target_hours = null;
  }

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields to update.",
    });
  }

  const { data, error } = await client
    .from("skills")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw createError({ statusCode: 404, statusMessage: "Skill not found." });
    }
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
