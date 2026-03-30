import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { H3Event } from "h3";
import type { Database } from "~~/app/types/database.types";

export async function requireAuth(event: H3Event) {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return user;
}

export async function getSupabaseClient(event: H3Event) {
  return await serverSupabaseClient<Database>(event);
}
