import type { GoalType } from "../utils/tracker-types";

export function useSkillForm() {
  const { addSkill, availableColors } = useSkillTracker();

  const form = reactive<{
    name: string;
    color: string;
    goalType: GoalType | "";
    targetHours: string;
  }>({
    name: "",
    color: availableColors[0] ?? "#059669",
    goalType: "",
    targetHours: "",
  });

  const status = reactive({
    error: "",
    success: "",
  });

  function submit() {
    status.error = "";
    status.success = "";

    const parsedTargetHours = form.targetHours
      ? Number(form.targetHours)
      : null;

    const result = addSkill({
      name: form.name,
      color: form.color,
      goalType: form.goalType,
      targetHours: parsedTargetHours,
    });

    if (!result.ok) {
      status.error = result.error;
      return {
        ok: false as const,
        message: result.error,
        liveAnnouncement: result.error,
      };
    }

    status.success = `${result.skill.name} is ready to track.`;

    const announcement = `Skill created: ${result.skill.name}.`;

    form.name = "";
    form.goalType = "";
    form.targetHours = "";

    return {
      ok: true as const,
      message: status.success,
      liveAnnouncement: announcement,
      skill: result.skill,
    };
  }

  function reset() {
    form.name = "";
    form.color = availableColors[0] ?? "#059669";
    form.goalType = "";
    form.targetHours = "";
    status.error = "";
    status.success = "";
  }

  return { form, status, availableColors, submit, reset };
}
