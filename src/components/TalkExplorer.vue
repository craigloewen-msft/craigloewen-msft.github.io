<script setup lang="ts">
import { computed, ref } from 'vue';

type Kind = 'Talk' | 'Video' | 'Article';

interface Item {
  title: string;
  kind: Kind;
  date: string;
  year: number;
  conference?: string;
  location?: string;
  url?: string;
}

const props = defineProps<{ items: Item[] }>();

const FILTERS = ['All', 'Talk', 'Video', 'Article'] as const;
type Filter = (typeof FILTERS)[number];

const activeFilter = ref<Filter>('All');
const query = ref('');

const counts = computed(() => ({
  All: props.items.length,
  Talk: props.items.filter((i) => i.kind === 'Talk').length,
  Video: props.items.filter((i) => i.kind === 'Video').length,
  Article: props.items.filter((i) => i.kind === 'Article').length,
}));

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();

  return props.items.filter((item) => {
    if (activeFilter.value !== 'All' && item.kind !== activeFilter.value) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.conference ?? '').toLowerCase().includes(q) ||
      (item.location ?? '').toLowerCase().includes(q) ||
      String(item.year).includes(q)
    );
  });
});

const grouped = computed(() => {
  const map = new Map<number, Item[]>();
  for (const item of filtered.value) {
    const bucket = map.get(item.year) ?? [];
    bucket.push(item);
    map.set(item.year, bucket);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
});

const kindStyles: Record<Kind, string> = {
  Talk: 'border-(--tone-accent)/40 text-(--tone-accent)',
  Video: 'border-(--color-ember)/40 text-(--color-ember)',
  Article: 'border-(--surface-border) text-(--text-muted)',
};
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <button
          v-for="filter in FILTERS"
          :key="filter"
          type="button"
          :aria-pressed="activeFilter === filter"
          class="rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors"
          :class="
            activeFilter === filter
              ? 'border-(--tone-accent) text-(--tone-accent)'
              : 'border-(--surface-border) text-(--text-muted) hover:border-(--tone-accent) hover:text-(--tone-accent)'
          "
          @click="activeFilter = filter"
        >
          {{ filter }}
          <span class="ml-1.5 opacity-60">{{ counts[filter] }}</span>
        </button>
      </div>

      <label class="relative sm:w-64">
        <span class="sr-only">Search talks, videos and articles</span>
        <svg
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-muted)"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M10.5 3.75a6.75 6.75 0 1 0 4.28 11.97l4.5 4.5a.75.75 0 1 0 1.06-1.06l-4.5-4.5A6.75 6.75 0 0 0 10.5 3.75m-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0"
          />
        </svg>
        <input
          v-model="query"
          type="search"
          placeholder="Search…"
          autocomplete="off"
          class="w-full rounded-lg border border-(--surface-border) bg-transparent py-2 pr-3 pl-9 font-mono text-xs outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--tone-accent)"
        />
      </label>
    </div>

    <p class="mt-4 font-mono text-xs text-(--text-muted)" aria-live="polite">
      {{ filtered.length }} {{ filtered.length === 1 ? 'result' : 'results' }}
    </p>

    <!-- Results -->
    <div v-if="grouped.length" class="mt-8">
      <section v-for="[year, entries] in grouped" :key="year" class="mb-12">
        <h2 class="font-mono text-sm tracking-[0.14em] text-(--text-muted) uppercase">
          {{ year }}
        </h2>

        <ul class="mt-4 divide-y divide-(--surface-border) border-y border-(--surface-border)">
          <li v-for="entry in entries" :key="entry.title + entry.date">
            <component
              :is="entry.url ? 'a' : 'div'"
              :href="entry.url"
              :target="entry.url ? '_blank' : undefined"
              :rel="entry.url ? 'noopener noreferrer' : undefined"
              class="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span
                class="inline-flex h-fit shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                :class="kindStyles[entry.kind]"
              >
                {{ entry.kind }}
              </span>

              <span class="flex-1">
                <span
                  class="font-medium transition-colors"
                  :class="entry.url ? 'group-hover:text-(--tone-accent)' : ''"
                >
                  {{ entry.title }}
                </span>
                <span
                  v-if="entry.conference || entry.location"
                  class="mt-1 block text-sm text-(--text-muted)"
                >
                  {{ [entry.conference, entry.location].filter(Boolean).join(' · ') }}
                </span>
              </span>

              <time :datetime="entry.date" class="shrink-0 font-mono text-xs text-(--text-muted)">
                {{
                  new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })
                }}
              </time>
            </component>
          </li>
        </ul>
      </section>
    </div>

    <p v-else class="mt-16 text-center text-(--text-muted)">Nothing matches “{{ query }}”.</p>
  </div>
</template>
