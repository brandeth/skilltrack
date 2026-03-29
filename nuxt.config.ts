// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "SkillTrack",
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        {
          name: "description",
          content:
            "SkillTrack is a frontend-only learning dashboard for tracking practice sessions, streaks, and momentum across multiple skills.",
        },
      ],
    },
  },
});
