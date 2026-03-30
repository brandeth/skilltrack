<template>
  <div>
    <h1 class="auth-title">Sign in</h1>
    <p class="helper-text">
      Welcome back. Sign in to continue tracking your practice.
    </p>

    <form class="form" @submit.prevent="handleLogin">
      <div
        v-if="errorMessage"
        class="status-message status-message--error"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <div class="field">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          aria-required="true"
        />
      </div>

      <div class="field">
        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Your password"
          required
          aria-required="true"
        />
      </div>

      <button class="btn btn--primary" type="submit" :disabled="loading">
        {{ loading ? "Signing in…" : "Sign in" }}
      </button>
    </form>

    <div class="auth-links">
      <NuxtLink to="/reset-password" class="auth-link"
        >Forgot password?</NuxtLink
      >
      <span class="auth-link-divider" aria-hidden="true">·</span>
      <NuxtLink to="/signup" class="auth-link">Create an account</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({ title: "Sign in — SkillTrack" });

const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  loading.value = true;

  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    await navigateTo("/dashboard");
  } catch {
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
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

.auth-links {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
  font-size: var(--text-sm);
}

.auth-link {
  color: var(--color-accent);
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-link-divider {
  color: var(--color-text-tertiary);
}

.form .btn {
  width: 100%;
}
</style>
