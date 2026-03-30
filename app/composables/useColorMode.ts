export function useColorMode() {
  const mode = useState<"light" | "dark" | "system">(
    "color-mode",
    () => "system",
  );

  const resolved = computed(() => {
    if (mode.value !== "system") return mode.value;
    if (import.meta.server) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  function apply() {
    if (import.meta.server) return;
    const html = document.documentElement;
    if (mode.value === "system") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", mode.value);
    }
  }

  function toggle() {
    const order: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const current = order.indexOf(mode.value);
    mode.value = order[(current + 1) % order.length]!;
    if (import.meta.client) {
      localStorage.setItem("skilltrack-theme", mode.value);
    }
    apply();
  }

  // Initialize on client
  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem("skilltrack-theme") as
        | "light"
        | "dark"
        | "system"
        | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        mode.value = stored;
      }
      apply();

      // Listen for OS preference changes when in system mode
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", () => {
        if (mode.value === "system") apply();
      });
    });

    watch(mode, () => apply());
  }

  return { mode, resolved, toggle };
}
