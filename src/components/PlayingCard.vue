<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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

// isFocused controls position:fixed (see .card-slot--focused) - it tracks
// isFlipped but lags behind by one shrink-transition's worth of time when
// closing. Growing can switch to position:fixed immediately (the viewport
// is always a big-enough containing block, capped via growSize below), but
// closing can't snap straight back to position:absolute in the same tick:
// while still-large but now centered relative to the small 280x400 deck
// instead of the viewport, margin:auto can't go negative to center an
// oversized child, so it'd anchor to one edge for the whole shrink. Keeping
// position:fixed a little longer avoids that entirely.
const isFocused = ref(false)
let closeTimer = null

watch(
  () => props.isFlipped,
  (flipped) => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    if (flipped) {
      isFocused.value = true
    } else {
      closeTimer = setTimeout(() => {
        isFocused.value = false
        closeTimer = null
      }, 420)
    }
  },
)

const disabled = computed(() => !isTop.value || props.isFlipped || isFocused.value)

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
const isDraggable = computed(() => isTop.value && !props.isFlipped && !isFocused.value)

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

// Growing when flipped now sets literal width/height (aspect ratio locked
// to the front's 7:10), not a transform: scale(). Scaling up via transform
// stretches an already-rasterized 280x400 render - text and (especially)
// photos visibly blur/pixelate the more you enlarge them that way, since
// the browser decodes images and lays out text for the *unscaled* box,
// then the compositor just stretches that bitmap. Literal width/height
// makes the browser actually re-render at the bigger size: images get
// decoded at (or downsampled to) the real display size, and text - being
// in rem, relative to the root font-size rather than this box - reads at
// essentially the same size as it does on the front, not artificially
// blown up.
//
// This reintroduces the centering problem literal sizing had before
// (margin:auto can't go negative to center a child larger than its
// container) - handled by switching this card itself to position:fixed
// while grown (see isFocused/.card-slot--focused), so it centers on the
// viewport directly instead of the small 280x400 deck. Making .card-deck
// itself fullscreen instead (an earlier attempt) pulled it out of .app's
// normal flex flow, which shifted the header/hint text every time a card
// flipped - .card-deck now never changes size or position at all.
const { width: viewportWidth, height: viewportHeight } = useWindowSize()

const growSize = computed(() => {
  const scale = Math.min((viewportWidth.value * 0.94) / 280, (viewportHeight.value * 0.88) / 400, 3.2)
  return {
    width: 280 * scale,
    height: 400 * scale,
  }
})

// Whenever a branch below sets its own inline `transition`, that overrides
// the base .card-slot rule's transition *entirely* (inline always wins over
// a stylesheet for the same longhand, regardless of which properties it
// lists) - so width/height wouldn't animate on close (going from the grown
// branch back to e.g. isTop) unless every other branch's transition value
// explicitly keeps them in the list too.
const SIZE_TRANSITION = 'width 380ms ease, height 380ms ease'

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
      width: `${growSize.value.width}px`,
      height: `${growSize.value.height}px`,
      zIndex: 1000,
    }
  }

  if (isFlyingAway.value) {
    return {
      transform: `translate(${flyDirection.value.x * 2}px, ${flyDirection.value.y * 2}px) rotate(${flyDirection.value.x / 10}deg)`,
      opacity: 0,
      transition: `${SIZE_TRANSITION}, transform 300ms ease-in, opacity 300ms ease-in`,
      zIndex: 100,
    }
  }

  if (isTop.value) {
    // The 3D tilt itself lives on .card-flip's transform (see flipStyle) -
    // this just handles plain 2D position/spin, which doesn't need
    // perspective at all.
    return {
      transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px) rotate(${dragOffset.value.x / 28}deg)`,
      transition: isEntering.value
        ? `${SIZE_TRANSITION}, ${ENTER_TRANSITION}`
        : isDragging.value
          ? SIZE_TRANSITION
          : `${SIZE_TRANSITION}, transform 220ms ease-out`,
      zIndex: 100,
    }
  }

  const depth = props.stackPosition
  const sign = depth % 2 === 0 ? 1 : -1
  return {
    transform: `translate(${depth * 6}px, ${depth * 4}px) rotate(${sign * depth * 1.5}deg) scale(${Math.max(1 - depth * 0.02, 0.85)})`,
    zIndex: 100 - depth,
    opacity: depth > 5 ? 0 : 1,
    transition: isEntering.value
      ? `${SIZE_TRANSITION}, ${ENTER_TRANSITION}, opacity 500ms ease`
      : `${SIZE_TRANSITION}, transform 300ms ease-out, opacity 300ms ease-out`,
  }
})
</script>

<template>
  <div
    class="card-slot"
    :class="{ 'card-slot--grown': isFlipped, 'card-slot--focused': isFocused }"
    :style="slotStyle"
  >
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
  transition: transform 380ms ease, width 380ms ease, height 380ms ease;
}

.card-slot--focused {
  /* Centers on the viewport instead of the small 280x400 .card-deck, which
     never changes size - see the isFocused comment above for why. */
  position: fixed;
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
  cursor: pointer;
}

.card-face--front:active {
  cursor: grabbing;
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
