export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const client = await getSupabaseClient(event);
  const query = getQuery(event);

  const months = Math.min(
    Math.max(parseInt(String(query.months ?? "3"), 10) || 3, 1),
    12,
  );
  const skillId = typeof query.skillId === "string" ? query.skillId : undefined;

  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - months);
  const fromKey = fromDate.toISOString().slice(0, 10);
  const toKey = today.toISOString().slice(0, 10);

  let builder = client
    .from("sessions")
    .select("date, duration_minutes, skill_id")
    .eq("user_id", user.id)
    .gte("date", fromKey)
    .lte("date", toKey);

  if (skillId) {
    builder = builder.eq("skill_id", skillId);
  }

  const { data, error } = await builder;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  // Aggregate by date
  const aggregates = new Map<
    string,
    { totalMinutes: number; sessionCount: number; skillIds: Set<string> }
  >();

  for (const row of data) {
    const existing = aggregates.get(row.date) ?? {
      totalMinutes: 0,
      sessionCount: 0,
      skillIds: new Set(),
    };
    existing.totalMinutes += row.duration_minutes;
    existing.sessionCount += 1;
    existing.skillIds.add(row.skill_id);
    aggregates.set(row.date, existing);
  }

  const days = Array.from(aggregates.entries()).map(([date, agg]) => ({
    date,
    totalMinutes: agg.totalMinutes,
    sessionCount: agg.sessionCount,
    skillCount: agg.skillIds.size,
  }));

  return { days, fromDate: fromKey, toDate: toKey };
});
