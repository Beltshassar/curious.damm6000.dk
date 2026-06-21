<script setup>
import { ref, watch } from 'vue'
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

// The flipped card now grows via literal width/height (for crisp native
// text/image rendering - see PlayingCard), which needs a containing block
// big enough to center an oversized child in (margin:auto can't go
// negative). .card-deck--focused makes .card-deck itself fullscreen while
// anything is flipped, exactly for that purpose.
//
// Opening can flip this class on immediately - the container is already
// full-size before the card grows into it. Closing is the asymmetric case:
// if the container snapped back to its small 280x400 box in the same tick
// the card starts shrinking, the still-large card would spend the whole
// shrink animation oversized relative to it, hitting the same
// margin:auto-resolves-to-0 bug. So closing keeps the container fullscreen
// until the card's own shrink transition (380ms) has actually finished.
const isFocused = ref(false)
let closeTimer = null

watch(
  () => props.flippedSlug,
  (slug) => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    if (slug) {
      isFocused.value = true
    } else {
      closeTimer = setTimeout(() => {
        isFocused.value = false
        closeTimer = null
      }, 420)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="card-deck" :class="{ 'card-deck--focused': isFocused }">
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

.card-deck--focused {
  position: fixed;
  inset: 0;
  width: auto;
  height: auto;
}

.card-deck__backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(20, 24, 28, 0.55);
  backdrop-filter: blur(2px);
}
</style>
