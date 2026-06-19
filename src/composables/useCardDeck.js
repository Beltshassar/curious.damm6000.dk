import { ref, computed } from 'vue'

export function useCardDeck(projects) {
  // Slugs stay in this fixed order forever - cycling the deck only moves
  // frontIndex, never reorders this array. Reordering it (and therefore the
  // v-for/DOM order) used to relocate DOM nodes via insertBefore on every
  // swipe, which - combined with the pointer capture a swipe gesture had
  // just released - left Chromium's synthetic pointer-event pipeline stuck
  // on the *next* interaction. Stack position is now purely derived (modulo
  // arithmetic), so the DOM nodes themselves never move, only their props.
  const slugs = projects.map((p) => p.slug)
  const frontIndex = ref(0)
  const expandedSlug = ref(null)

  const deck = computed(() =>
    slugs.map((slug, i) => ({
      project: projects.find((p) => p.slug === slug),
      stackPosition: (i - frontIndex.value + slugs.length) % slugs.length,
    })),
  )

  function cycleToBack() {
    frontIndex.value = (frontIndex.value + 1) % slugs.length
  }

  function expand(slug) {
    expandedSlug.value = slug
  }

  function collapse() {
    expandedSlug.value = null
  }

  return { deck, expandedSlug, cycleToBack, expand, collapse }
}
