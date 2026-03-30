export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // Auth pages: redirect authenticated users to dashboard
  const authPages = ["/login", "/signup", "/reset-password"];
  if (authPages.includes(to.path) && user.value) {
    return navigateTo("/dashboard");
  }

  // Dashboard: allow authenticated users and guests
  if (to.path === "/dashboard") {
    const isGuest =
      to.query.guest === "true" ||
      useCookie("skilltrack-guest").value === "true";
    if (!user.value && !isGuest) {
      return navigateTo("/login");
    }
    // Set guest cookie if entering via query param
    if (!user.value && to.query.guest === "true") {
      const guestCookie = useCookie("skilltrack-guest", {
        maxAge: 60 * 60 * 24,
      });
      guestCookie.value = "true";
    }
  }
});
