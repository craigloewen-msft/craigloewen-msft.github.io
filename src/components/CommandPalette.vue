<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

interface Entry {
  title: string;
  href: string;
  kind: string;
  meta?: string;
  external?: boolean;
}

const props = defineProps<{ entries: Entry[] }>();

const open = ref(false);
const query = ref('');
const active = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLElement | null>(null);
let restoreFocusTo: HTMLElement | null = null;

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.entries.slice(0, 8);

  return props.entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const meta = (entry.meta ?? '').toLowerCase();
      let score = -1;

      if (title === q) score = 0;
      else if (title.startsWith(q)) score = 1;
      else if (title.includes(q)) score = 2;
      else if (meta.includes(q)) score = 3;
      else if (entry.kind.toLowerCase().includes(q)) score = 4;

      return { entry, score };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 12)
    .map((r) => r.entry);
});

watch(results, () => {
  active.value = 0;
});

async function show() {
  restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  open.value = true;
  query.value = '';
  active.value = 0;
  await nextTick();
  inputEl.value?.focus();
}

function hide() {
  open.value = false;
  restoreFocusTo?.focus();
  restoreFocusTo = null;
}

function go(entry: Entry | undefined) {
  if (!entry) return;
  hide();
  if (entry.external) window.open(entry.href, '_blank', 'noopener');
  else window.location.href = entry.href;
}

function scrollActiveIntoView() {
  nextTick(() => {
    listEl.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  });
}

function onKeydown(event: KeyboardEvent) {
  const isToggle = (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey);
  if (isToggle) {
    event.preventDefault();
    open.value ? hide() : show();
    return;
  }
  if (!open.value) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    hide();
  } else if (event.key === 'Tab') {
    // Keep focus inside the dialog; the input is the only tab stop.
    event.preventDefault();
    inputEl.value?.focus();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    active.value = (active.value + 1) % Math.max(1, results.value.length);
    scrollActiveIntoView();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    active.value =
      (active.value - 1 + Math.max(1, results.value.length)) % Math.max(1, results.value.length);
    scrollActiveIntoView();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    go(results.value[active.value]);
  }
}

function onTriggerClick(event: Event) {
  const target = event.target;
  if (target instanceof Element && target.closest('[data-command-trigger]')) show();
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onTriggerClick);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('click', onTriggerClick);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="hide" />

        <div
          class="relative w-full max-w-xl overflow-hidden rounded-xl border border-(--surface-border) bg-(--surface-overlay) shadow-2xl"
        >
          <div class="flex items-center gap-3 border-b border-(--surface-border) px-4">
            <span aria-hidden="true" class="font-mono text-sm" style="color: var(--tone-accent)"
              >~$</span
            >
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              placeholder="Search posts, talks, projects…"
              aria-label="Search query"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-results"
              :aria-activedescendant="results.length ? `command-option-${active}` : undefined"
              autocomplete="off"
              spellcheck="false"
              class="w-full bg-transparent py-4 text-sm outline-none placeholder:text-(--text-muted)"
            />
            <kbd class="font-mono text-[10px] text-(--text-muted)">ESC</kbd>
          </div>

          <ul
            v-if="results.length"
            id="command-palette-results"
            ref="listEl"
            role="listbox"
            aria-label="Search results"
            class="max-h-80 overflow-y-auto py-2"
          >
            <li v-for="(entry, i) in results" :key="entry.href + entry.title" role="presentation">
              <button
                :id="`command-option-${i}`"
                type="button"
                role="option"
                :aria-selected="i === active"
                :data-active="i === active"
                tabindex="-1"
                class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors"
                :class="
                  i === active
                    ? 'bg-(--surface-raised) text-(--tone-accent)'
                    : 'text-(--text-secondary)'
                "
                @click="go(entry)"
                @mouseenter="active = i"
              >
                <span class="truncate text-sm">{{ entry.title }}</span>
                <span
                  class="shrink-0 font-mono text-[10px] tracking-wider text-(--text-muted) uppercase"
                >
                  {{ entry.kind }}
                </span>
              </button>
            </li>
          </ul>

          <p v-else class="px-4 py-8 text-center text-sm text-(--text-muted)">
            No matches for “{{ query }}”
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
