<script setup lang="ts">
import { ref, onMounted } from 'vue';

type Theme = 'dark' | 'light';

const theme = ref<Theme>('dark');
const mounted = ref(false);

function apply(next: Theme) {
  theme.value = next;
  document.documentElement.classList.toggle('light', next === 'light');
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage unavailable — fall back to session-only preference */
  }
}

function toggle() {
  apply(theme.value === 'dark' ? 'light' : 'dark');
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  mounted.value = true;
});
</script>

<template>
  <button
    type="button"
    class="grid size-9 place-items-center rounded-lg border border-(--surface-border) text-(--text-secondary) transition-colors hover:border-(--tone-accent) hover:text-(--tone-accent)"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
    :aria-pressed="theme === 'light'"
    @click="toggle"
  >
    <svg
      v-if="!mounted || theme === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M21.03 12.98a9.25 9.25 0 1 1-10-10 .75.75 0 0 1 .8 1.06 7.25 7.25 0 0 0 9.2 9.2.75.75 0 0 1 1 .74z"
      />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M12 1.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V2.5a.75.75 0 0 1 .75-.75m0 5.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5M2.5 11.25h1.5a.75.75 0 0 1 0 1.5H2.5a.75.75 0 0 1 0-1.5m17.5 0h1.5a.75.75 0 0 1 0 1.5H20a.75.75 0 0 1 0-1.5M4.87 4.87a.75.75 0 0 1 1.06 0l1.06 1.06A.75.75 0 0 1 5.93 6.99L4.87 5.93a.75.75 0 0 1 0-1.06m12.14 12.14a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06m2.12-12.14a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0M6.99 17.01a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0M12 19.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V20a.75.75 0 0 1 .75-.75"
      />
    </svg>
  </button>
</template>
