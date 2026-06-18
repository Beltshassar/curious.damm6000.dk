<script setup>
import { computed, ref } from 'vue'
import ProjectImage from './ProjectImage.vue'
import CardBack from './CardBack.vue'
import { categoryColor } from '../utils/color'
import { useSwipeOrTap } from '../composables/useSwipeOrTap'

const props = defineProps({
  project: { type: Object, required: true },
  stackPosition: { type: Number, required: true },
  isFlipped: { type: Boolean, default: false },
})

const emit = defineEmits(['tap', 'swiped', 'close'])

const SIZE_TRANSITION = 'width 380ms ease, height 380ms ease'

const isTop = computed(() => props.stackPosition === 0)
const accent = computed(() => categoryColor(props.project.category))
const disabled = computed(() => !isTop.value || props.isFlipped)

const isFlyingAway = ref(false)
const flyDirection = ref({ x: 0, y: 0 })

const { dragOffset, isDragging, onPointerDown, onPointerMove, onPointerUp } = useSwipeOrTap({
  disabled,
  onTap: () => emit('tap'),
  onSwipeAway: (offset) => {
    flyDirection.value = offset
    isFlyingAway.value = true
    emit('swiped')
    setTimeout(() => {
      isFlyingAway.value = false
    }, 300)
  },
})

const slotStyle = computed(() => {
  if (props.isFlipped) {
    return {
      transform: 'translate(-50%, -50%)',
      transition: `${SIZE_TRANSITION}, transform 380ms ease`,
      zIndex: 1000,
    }
  }

  if (isFlyingAway.value) {
    return {
      transform: `translate(-50%, -50%) translate(${flyDirection.value.x * 2}px, ${flyDirection.value.y * 2}px) rotate(${flyDirection.value.x / 10}deg)`,
      opacity: 0,
      transition: `${SIZE_TRANSITION}, transform 300ms ease-in, opacity 300ms ease-in`,
      zIndex: 100,
    }
  }

  if (isTop.value) {
    return {
      transform: `translate(-50%, -50%) translate(${dragOffset.value.x}px, ${dragOffset.value.y}px) rotate(${dragOffset.value.x / 20}deg)`,
      transition: isDragging.value ? SIZE_TRANSITION : `${SIZE_TRANSITION}, transform 200ms ease-out`,
      zIndex: 100,
    }
  }

  const depth = props.stackPosition
  const sign = depth % 2 === 0 ? 1 : -1
  return {
    transform: `translate(-50%, -50%) translate(${depth * 6}px, ${depth * 4}px) rotate(${sign * depth * 1.5}deg) scale(${Math.max(1 - depth * 0.02, 0.85)})`,
    zIndex: 100 - depth,
    opacity: depth > 5 ? 0 : 1,
    transition: `${SIZE_TRANSITION}, transform 300ms ease-out, opacity 300ms ease-out`,
  }
})
</script>

<template>
  <div class="card-slot" :class="{ 'card-slot--flipped': isFlipped }" :style="slotStyle">
    <div class="card-flip" :class="{ 'card-flip--flipped': isFlipped }">
      <article
        class="card-face card-face--front"
        :style="{ '--accent': accent }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <span v-if="project.status === 'wip'" class="card-face__wip">WIP</span>
        <header class="card-face__header">
          <span class="card-face__category">{{ project.category }}</span>
          <span class="card-face__order">No.{{ String(project.order).padStart(2, '0') }}</span>
        </header>
        <h2 class="card-face__title">{{ project.title }}</h2>
        <div class="card-face__art">
          <ProjectImage :slug="project.slug" :src="project.coverImage" :alt="project.title" />
          <div class="card-face__shine" aria-hidden="true"></div>
        </div>
        <p class="card-face__tagline">{{ project.tagline }}</p>
      </article>

      <div class="card-face card-face--back">
        <CardBack v-if="isFlipped" :project="project" @close="emit('close')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 400px;
  perspective: 1400px;
  touch-action: none;
}

.card-slot--flipped {
  width: min(92vw, 380px, 60vh);
  aspect-ratio: 7 / 10;
  height: auto;
}

.card-flip {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 480ms ease;
}

.card-flip--flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 18px;
}

.card-face--front {
  display: flex;
  flex-direction: column;
  padding: 0.7rem;
  background: #ffffff;
  border: 7px solid var(--yellow);
  box-shadow: 0 10px 0 -4px rgba(0, 0, 0, 0.08), 0 14px 24px -10px rgba(20, 24, 28, 0.35);
  user-select: none;
}

.card-slot--flipped .card-face--front {
  cursor: default;
}

.card-face--back {
  transform: rotateY(180deg);
}

.card-face__wip {
  position: absolute;
  top: -0.8rem;
  right: 0.6rem;
  z-index: 2;
  padding: 0.2rem 0.55rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  color: var(--text);
  background: var(--yellow);
  border: 2px solid var(--text);
  border-radius: 999px;
  transform: rotate(8deg);
}

.card-face__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.6rem;
  margin: -0.7rem -0.7rem 0;
  border-radius: 12px 12px 0 0;
  background: var(--accent);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #ffffff;
}

.card-face__title {
  margin: 0.5rem 0 0.4rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.15;
  text-align: center;
  color: var(--text);
}

.card-face__art {
  position: relative;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  border: 2px solid var(--accent);
}

.card-face__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.55) 50%, transparent 60%);
  background-size: 250% 250%;
  background-position: -20% -20%;
  transition: background-position 700ms ease;
  pointer-events: none;
}

.card-slot:not(.card-slot--flipped) .card-face--front:hover .card-face__shine {
  background-position: 120% 120%;
}

.card-face__tagline {
  margin: 0.5rem 0 0;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: #f4ede0;
  font-size: 0.72rem;
  line-height: 1.3;
  text-align: center;
  color: var(--text-muted);
}
</style>
