import { ref, computed } from 'vue'

export function useCardDeck(projects) {
  const order = ref(projects.map((p) => p.slug))
  const expandedSlug = ref(null)

  const deck = computed(() =>
    order.value.map((slug, stackPosition) => ({
      project: projects.find((p) => p.slug === slug),
      stackPosition,
    })),
  )

  const expandedProject = computed(
    () => projects.find((p) => p.slug === expandedSlug.value) ?? null,
  )

  function cycleToBack() {
    const [front, ...rest] = order.value
    order.value = [...rest, front]
  }

  function expand(slug) {
    expandedSlug.value = slug
  }

  function collapse() {
    expandedSlug.value = null
  }

  return { deck, expandedSlug, expandedProject, cycleToBack, expand, collapse }
}
