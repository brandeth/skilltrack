export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Skill ID is required.",
    });
  }

  const { error } = await client
    .from("skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
