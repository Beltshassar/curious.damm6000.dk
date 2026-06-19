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

// The slot's own box is always 280x400 - "growing" when flipped is purely a
// transform: scale() (see .card-slot--grown), which the compositor can
// animate without any layout recalculation. That sidesteps two different
// bugs from actually resizing width/height: centering broke down whenever
// the box was briefly larger than its small fixed-size deck container
// (margin:auto can't go negative, so it anchored to one edge instead), and
// animating width/height directly had a visible ~150ms startup delay before
// the browser began interpolating it, since that's a layout-triggering
// (not compositor-only) animation.
const slotStyle = computed(() => {
  if (props.isFlipped) {
    return {
      zIndex: 1000,
    }
  }

  if (isFlyingAway.value) {
    return {
      transform: `translate(${flyDirection.value.x * 2}px, ${flyDirection.value.y * 2}px) rotate(${flyDirection.value.x / 10}deg)`,
      opacity: 0,
      transition: 'transform 300ms ease-in, opacity 300ms ease-in',
      zIndex: 100,
    }
  }

  if (isTop.value) {
    return {
      transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px) rotate(${dragOffset.value.x / 20}deg)`,
      transition: isDragging.value ? 'none' : 'transform 200ms ease-out',
      zIndex: 100,
    }
  }

  const depth = props.stackPosition
  const sign = depth % 2 === 0 ? 1 : -1
  return {
    transform: `translate(${depth * 6}px, ${depth * 4}px) rotate(${sign * depth * 1.5}deg) scale(${Math.max(1 - depth * 0.02, 0.85)})`,
    zIndex: 100 - depth,
    opacity: depth > 5 ? 0 : 1,
    transition: 'transform 300ms ease-out, opacity 300ms ease-out',
  }
})
</script>

<template>
  <div class="card-slot" :class="{ 'card-slot--grown': isFlipped }" :style="slotStyle">
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
        <div class="card-face__inner">
          <div class="card-face__banner">
            <header class="card-face__header">
              <span class="card-face__category">{{ project.category }}</span>
              <span class="card-face__order">No.{{ String(project.order).padStart(2, '0') }}</span>
            </header>
            <h2 class="card-face__title">{{ project.title }}</h2>
          </div>
          <div class="card-face__art">
            <ProjectImage :slug="project.slug" :src="project.coverImage" :alt="project.title" />
            <div class="card-face__shine" aria-hidden="true"></div>
          </div>
          <p class="card-face__tagline">{{ project.tagline }}</p>
        </div>
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
  inset: 0;
  margin: auto;
  width: 280px;
  height: 400px;
  perspective: 1400px;
  touch-action: none;
  transition: transform 380ms ease;
}

.card-slot--grown {
  /* Same 7:10 ratio as the deck size, as a scale factor relative to the
     280px base width rather than a literal width/height change. */
  transform: scale(calc(min(92vw, 380px, 60vh) / 280px));
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
  background: #ffffff;
  border: 4px solid var(--yellow);
  box-shadow: 0 10px 0 -4px rgba(0, 0, 0, 0.08), 0 14px 24px -10px rgba(20, 24, 28, 0.35);
  user-select: none;
}

.card-face__inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  padding: 0.7rem;
}

.card-slot--grown .card-face--front {
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

.card-face__banner {
  height: 124px;
  margin: -0.7rem -0.7rem 0;
  padding: 0.5rem 0.7rem 0;
  background: var(--accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 64%);
}

.card-face__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #ffffff;
}

.card-face__title {
  margin: 0.5rem 0 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.15;
  text-align: center;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.card-face__art {
  position: relative;
  flex: 1;
  margin-top: -2.6rem;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  border: 3px solid #ffffff;
  box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.35);
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

.card-slot:not(.card-slot--grown) .card-face--front:hover .card-face__shine {
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
