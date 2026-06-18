<script setup>
import CardDeck from './components/CardDeck.vue'
import { loadProjects } from './content/loadProjects'
import { useCardDeck } from './composables/useCardDeck'

const projects = loadProjects()
const { deck, expandedSlug, cycleToBack, expand, collapse } = useCardDeck(projects)
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1 class="app__title">Curious &amp; Geeky</h1>
      <p class="app__subtitle">
        A deck of side projects. Drag the top card away to see the next one, tap it to flip it over.
      </p>
    </header>

    <CardDeck :deck="deck" :flipped-slug="expandedSlug" @tap="expand" @cycle="cycleToBack" @close="collapse" />

    <p class="app__hint">{{ deck.length }} cards in the deck</p>
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.app__header {
  max-width: 32rem;
}

.app__title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  margin: 0 0 0.6rem;
  color: var(--red);
  -webkit-text-stroke: 1.5px var(--text);
}

.app__subtitle {
  margin: 0;
  color: var(--text-muted);
}

.app__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.8;
}
</style>
