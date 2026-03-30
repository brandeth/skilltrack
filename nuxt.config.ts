// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase"],
  css: ["~/assets/css/main.css"],
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: [
        "/",
        "/dashboard",
        "/login",
        "/signup",
        "/reset-password",
        "/confirm",
      ],
      saveRedirectToCookie: true,
    },
  },
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
            "SkillTrack is a learning dashboard for tracking practice sessions, streaks, and momentum across multiple skills.",
        },
      ],
    },
  },
});
