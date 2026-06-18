<script setup>
import { computed } from 'vue'
import CardDeck from './components/CardDeck.vue'
import CardDetailOverlay from './components/CardDetailOverlay.vue'
import { loadProjects } from './content/loadProjects'
import { useCardDeck } from './composables/useCardDeck'

const projects = loadProjects()
const { deck, expandedProject, cycleToBack, expand, collapse } = useCardDeck(projects)

const gestureDisabled = computed(() => expandedProject.value !== null)
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1 class="app__title">Curious &amp; Geeky</h1>
      <p class="app__subtitle">
        A deck of side projects. Drag the top card away to see the next one, tap it to learn more.
      </p>
    </header>

    <CardDeck :deck="deck" :gesture-disabled="gestureDisabled" @tap="expand" @cycle="cycleToBack" />

    <p class="app__hint">{{ deck.length }} cards in the deck</p>

    <Transition name="overlay-fade">
      <CardDetailOverlay v-if="expandedProject" :project="expandedProject" @close="collapse" />
    </Transition>
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
  font-size: 2rem;
  margin: 0 0 0.6rem;
  color: var(--text);
  text-shadow: 0 0 20px rgba(43, 240, 255, 0.35);
}

.app__subtitle {
  margin: 0;
  color: var(--text-muted);
}

.app__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
