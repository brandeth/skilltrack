export function useSessionForm() {
  const { skills, todayKey, recentSessions, addSession, hydrated } =
    useSkillTracker();

  const form = reactive({
    skillId: "",
    durationInput: "",
    date: todayKey.value,
    notes: "",
  });

  const status = reactive({
    error: "",
    success: "",
    warning: "",
  });

  const durationPresets = [
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "45m", value: "45" },
    { label: "1h", value: "1h" },
  ];

  function syncDefaultSkill() {
    if (!skills.value.length) {
      form.skillId = "";
      return;
    }

    const currentExists = skills.value.some(
      (skill) => skill.id === form.skillId,
    );

    if (currentExists) {
      return;
    }

    form.skillId =
      recentSessions.value[0]?.skillId ?? skills.value[0]?.id ?? "";
  }

  watch(
    [hydrated, skills, recentSessions],
    () => {
      form.date = todayKey.value;
      syncDefaultSkill();
    },
    { immediate: true },
  );

  function submit() {
    status.error = "";
    status.success = "";
    status.warning = "";

    const result = addSession({
      skillId: form.skillId,
      durationInput: form.durationInput,
      date: form.date,
      notes: form.notes,
    });

    if (!result.ok) {
      status.error = result.error;
      return {
        ok: false as const,
        message: result.error!,
        liveAnnouncement: result.error!,
      };
    }

    const savedSkill = skills.value.find(
      (skill) => skill.id === result.session.skillId,
    );
    status.success = `Saved ${formatMinutes(result.session.durationMinutes)} for ${savedSkill?.name ?? "your skill"}.`;
    status.warning = result.warning;

    const announcement = `Session saved: ${formatMinutes(result.session.durationMinutes)} of ${savedSkill?.name ?? "practice"} on ${formatDateLong(result.session.date)}.`;

    const savedSkillId = result.session.skillId;
    form.durationInput = "";
    form.notes = "";
    form.date = todayKey.value;
    form.skillId = savedSkillId;

    return {
      ok: true as const,
      message: status.success,
      liveAnnouncement: announcement,
    };
  }

  function reset() {
    form.skillId = "";
    form.durationInput = "";
    form.date = todayKey.value;
    form.notes = "";
    status.error = "";
    status.success = "";
    status.warning = "";
    syncDefaultSkill();
  }

  return { form, status, durationPresets, submit, reset };
}
