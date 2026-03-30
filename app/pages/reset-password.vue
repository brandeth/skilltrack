<template>
  <div>
    <h1 class="auth-title">Reset password</h1>
    <p class="helper-text">
      Enter your email and we'll send a link to reset your password.
    </p>

    <form class="form" @submit.prevent="handleReset">
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
        <label for="reset-email">Email</label>
        <input
          id="reset-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          aria-required="true"
        />
      </div>

      <button
        class="btn btn--primary"
        type="submit"
        :disabled="loading || !!successMessage"
      >
        {{ loading ? "Sending…" : "Send reset link" }}
      </button>
    </form>

    <div class="auth-links">
      <NuxtLink to="/login" class="auth-link">Back to sign in</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({ title: "Reset password — SkillTrack" });

const client = useSupabaseClient();
const email = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function handleReset() {
  errorMessage.value = "";
  successMessage.value = "";
  loading.value = true;

  try {
    const { error } = await client.auth.resetPasswordForEmail(
      email.value.trim(),
      {
        redirectTo: `${window.location.origin}/confirm`,
      },
    );

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    successMessage.value = "Check your email for a password reset link.";
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
