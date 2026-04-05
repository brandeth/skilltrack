<template>
  <div>
    <h1 class="auth-title">Confirming…</h1>
    <p class="helper-text">{{ statusMessage }}</p>
    <div
      v-if="errorMessage"
      class="status-message status-message--error"
      role="alert"
    >
      {{ errorMessage }}
      <div class="confirm-error-actions">
        <NuxtLink to="/login" class="auth-link">Back to sign in</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({ title: "Confirming — SkillTrack" });

const statusMessage = ref("Verifying your link…");
const errorMessage = ref("");

onMounted(async () => {
  // Supabase handles the hash fragment automatically via the JS client
  // The @nuxtjs/supabase module listens for auth state changes
  // We just need to wait briefly then redirect
  const user = useSupabaseUser();

  // Wait for auth state to resolve
  const timeout = setTimeout(() => {
    if (!user.value) {
      errorMessage.value =
        "The confirmation link may have expired. Please try again.";
      statusMessage.value = "Verification failed.";
    }
  }, 5000);

  watch(
    user,
    (newUser) => {
      if (newUser) {
        clearTimeout(timeout);
        statusMessage.value = "Verified! Redirecting to your dashboard…";
        navigateTo("/dashboard");
      }
    },
    { immediate: true },
  );
});
</script>

<style scoped>
.auth-title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

.auth-title + .helper-text {
  margin-bottom: var(--space-5);
}

.auth-link {
  color: var(--color-accent);
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.confirm-error-actions {
  margin-top: var(--space-4);
}
</style>
