<script setup>
import { onKeyStroke } from '@vueuse/core'
import PlayingCard from './PlayingCard.vue'

const props = defineProps({
  deck: { type: Array, required: true },
  flippedSlug: { type: String, default: null },
})

const emit = defineEmits(['tap', 'cycle', 'close'])

onKeyStroke('Escape', () => {
  if (props.flippedSlug) emit('close')
})
</script>

<template>
  <div class="card-deck">
    <Transition name="backdrop-fade">
      <div v-if="flippedSlug" class="card-deck__backdrop" @click="emit('close')"></div>
    </Transition>

    <!--
      Plain keyed v-for, not <TransitionGroup>: each card already animates its
      own position/size via the transform/transition it computes in :style.
      TransitionGroup's move animation measures bounding boxes before/after
      every update and injects its own corrective transform on top of ours -
      the two fought each other and were the cause of cards occasionally
      landing stuck off-screen after a swipe or a flip/unflip.
    -->
    <PlayingCard
      v-for="entry in deck"
      :key="entry.project.slug"
      :project="entry.project"
      :stack-position="entry.stackPosition"
      :is-flipped="entry.project.slug === flippedSlug"
      @tap="emit('tap', entry.project.slug)"
      @swiped="emit('cycle')"
      @close="emit('close')"
    />
  </div>
</template>

<style scoped>
.card-deck {
  position: relative;
  width: 280px;
  height: 400px;
}

.card-deck__backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(20, 24, 28, 0.55);
  backdrop-filter: blur(2px);
}
</style>
