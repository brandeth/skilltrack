<template>
  <div>
    <h1 class="auth-title">Create an account</h1>
    <p class="helper-text">
      Start tracking your skills and build streaks that stick.
    </p>

    <form class="form" @submit.prevent="handleSignup">
      <div
        v-if="errorMessage"
        class="status-message status-message--error"
        role="alert"
      >
        {{ errorMessage }}
      </div>
      <div
        v-if="successMessage"
        class="status-message status-message--success"
        role="status"
      >
        {{ successMessage }}
      </div>

      <div class="field">
        <label for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          aria-required="true"
        />
      </div>

      <div class="field">
        <label for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="At least 8 characters"
          minlength="8"
          required
          aria-required="true"
        />
      </div>

      <button
        class="btn btn--primary"
        type="submit"
        :disabled="loading || !!successMessage"
      >
        {{ loading ? "Creating account…" : "Sign up" }}
      </button>
    </form>

    <div class="auth-links">
      <span class="helper-text">Already have an account?</span>
      <NuxtLink to="/login" class="auth-link">Sign in</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({ title: "Sign up — SkillTrack" });

const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function handleSignup() {
  errorMessage.value = "";
  successMessage.value = "";
  loading.value = true;

  try {
    const { data, error } = await client.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    if (data.session) {
      return navigateTo("/dashboard");
    }

    successMessage.value =
      "Check your email for a confirmation link to complete sign-up.";
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

.form .btn {
  width: 100%;
}
</style>
