<script setup>
import { computed } from 'vue'
import { seedGradient } from '../utils/color'

const props = defineProps({
  seed: { type: String, required: true },
  label: { type: String, default: '' },
})

const background = computed(() => seedGradient(props.seed))
const initial = computed(() => (props.label || props.seed).trim().charAt(0).toUpperCase())
</script>

<template>
  <div class="placeholder-art" :style="{ backgroundImage: background }">
    <span class="placeholder-art__texture" aria-hidden="true"></span>
    <span class="placeholder-art__initial">{{ initial }}</span>
    <span class="placeholder-art__tag">no photo yet</span>
  </div>
</template>

<style scoped>
.placeholder-art {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  overflow: hidden;
  color: rgba(238, 240, 250, 0.85);
}

.placeholder-art__texture {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.05) 0px,
    rgba(255, 255, 255, 0.05) 2px,
    transparent 2px,
    transparent 10px
  );
}

.placeholder-art__initial {
  position: relative;
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1;
}

.placeholder-art__tag {
  position: relative;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}
</style>
