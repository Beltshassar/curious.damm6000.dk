<script setup>
import { computed, onMounted, ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

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

// One-time entrance: every card starts off-screen above the deck and "falls"
// into its resting position with a midair spin, staggered by stack depth.
// hasEntered flips true once (after a per-card delay) and reuses whichever
// resting branch below already applies (top card vs fanned-back card) - the
// entrance is just that branch's normal target transform, approached from an
// off-screen starting point on a slower, bouncier transition (isEntering).
const hasEntered = ref(false)
const isEntering = ref(false)
const ENTER_TRANSITION = 'transform 900ms cubic-bezier(.17,.84,.32,1.24)'

onMounted(() => {
  setTimeout(() => {
    hasEntered.value = true
    isEntering.value = true
    setTimeout(() => {
      isEntering.value = false
    }, 900)
  }, 120 + props.stackPosition * 90)
})

const flipRotation = computed(() => {
  if (!hasEntered.value) return 400 // mid-spin orientation, settles down to 0 on landing
  return props.isFlipped ? 180 : 0
})

// The drag tilt (rotateX/rotateY, proportional to drag distance) lives here
// rather than on .card-slot's own transform, because perspective only
// affects how an element's *children's* 3D transforms render - .card-slot
// already has its own perspective for this exact purpose (it's what gives
// the open/close flip below its depth), so reusing it here means the tilt
// gets correct 3D depth without needing perspective on .card-deck too. That
// matters because perspective on an ancestor makes it the containing block
// for any position:fixed descendant - .card-deck having it broke the
// fullscreen backdrop, shrinking it down to the deck's own 280x400 box.
const isDraggable = computed(() => isTop.value && !props.isFlipped)

const flipStyle = computed(() => {
  const tiltX = isDraggable.value ? clamp(-dragOffset.value.y / 14, -16, 16) : 0
  const tiltY = isDraggable.value ? clamp(dragOffset.value.x / 14, -16, 16) : 0
  const style = {
    transform: `rotateY(${flipRotation.value}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
  }
  if (isEntering.value) {
    style.transition = ENTER_TRANSITION
  } else if (isDraggable.value) {
    style.transition = isDragging.value ? 'none' : 'transform 220ms ease-out'
  }
  return style
})

// The slot's own box is always 280x400 - "growing" when flipped is purely a
// transform: scale() (see growScale below), which the compositor can
// animate without any layout recalculation. That sidesteps two different
// bugs from actually resizing width/height: centering broke down whenever
// the box was briefly larger than its small fixed-size deck container
// (margin:auto can't go negative, so it anchored to one edge instead), and
// animating width/height directly had a visible ~150ms startup delay before
// the browser began interpolating it, since that's a layout-triggering
// (not compositor-only) animation.
//
// The scale factors themselves are computed here in JS, reactive to the
// viewport via useWindowSize, rather than as a CSS calc()/min() expression
// inside scale(...). That CSS version measured correctly under Chromium
// (verified via getBoundingClientRect during development) but produced no
// visible change for at least one real user - calc() dividing two lengths
// to get a unitless number for scale() is in a genuinely gray area of the
// spec, and apparently not every browser/version agrees on it. Plain
// numbers computed in JS sidestep that entirely.
const { width: viewportWidth, height: viewportHeight } = useWindowSize()

const growScale = computed(() => ({
  x: Math.min(viewportWidth.value * 0.94, 760) / 280,
  y: Math.min(viewportHeight.value * 0.88, 980) / 400,
}))

const slotStyle = computed(() => {
  if (!hasEntered.value) {
    return {
      transform: `translateY(-140vh) translateX(${props.stackPosition % 2 === 0 ? 16 : -16}px) rotate(${props.stackPosition % 2 === 0 ? -8 : 8}deg)`,
      opacity: 0,
      transition: 'none',
      zIndex: 100 - props.stackPosition,
    }
  }

  if (props.isFlipped) {
    return {
      transform: `scale(${growScale.value.x}, ${growScale.value.y})`,
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
    // The 3D tilt itself lives on .card-flip's transform (see flipStyle) -
    // this just handles plain 2D position/spin, which doesn't need
    // perspective at all.
    return {
      transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px) rotate(${dragOffset.value.x / 28}deg)`,
      transition: isEntering.value ? ENTER_TRANSITION : isDragging.value ? 'none' : 'transform 220ms ease-out',
      zIndex: 100,
    }
  }

  const depth = props.stackPosition
  const sign = depth % 2 === 0 ? 1 : -1
  return {
    transform: `translate(${depth * 6}px, ${depth * 4}px) rotate(${sign * depth * 1.5}deg) scale(${Math.max(1 - depth * 0.02, 0.85)})`,
    zIndex: 100 - depth,
    opacity: depth > 5 ? 0 : 1,
    transition: isEntering.value ? `${ENTER_TRANSITION}, opacity 500ms ease` : 'transform 300ms ease-out, opacity 300ms ease-out',
  }
})
</script>

<template>
  <div class="card-slot" :class="{ 'card-slot--grown': isFlipped }" :style="slotStyle">
    <div class="card-flip" :style="flipStyle">
      <article
        class="card-face card-face--front"
        :style="{ '--accent': accent }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
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
            <span v-if="project.status === 'wip'" class="card-face__wip">WIP</span>
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

.card-flip {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 480ms ease;
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
  background: linear-gradient(115deg, transparent 46%, rgba(255, 255, 255, 0.7) 50%, transparent 54%);
  background-size: 200% 200%;
  background-position: 0% 0%;
  /* At rest this shows just a small sliver in the bottom-right corner; on
     hover it sweeps fully across to a matching small sliver in the
     top-left, settling there. */
  transition: background-position 700ms ease;
  pointer-events: none;
}

.card-slot:not(.card-slot--grown) .card-face--front:hover .card-face__shine {
  background-position: 100% 100%;
}

.card-face__wip {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  z-index: 2;
  padding: 0.2rem 0.5rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  color: var(--text);
  background: var(--yellow);
  border: 2px solid var(--text);
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  transform: rotate(8deg);
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
