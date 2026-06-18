<script setup>
import { computed, ref } from 'vue'
import ProjectImage from './ProjectImage.vue'
import { categoryColor } from '../utils/color'
import { useSwipeOrTap } from '../composables/useSwipeOrTap'

const props = defineProps({
  project: { type: Object, required: true },
  stackPosition: { type: Number, required: true },
  gestureDisabled: { type: Boolean, default: false },
})

const emit = defineEmits(['tap', 'swiped'])

const isTop = computed(() => props.stackPosition === 0)
const accent = computed(() => categoryColor(props.project.category))
const disabled = computed(() => !isTop.value || props.gestureDisabled)

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

const cardStyle = computed(() => {
  if (isFlyingAway.value) {
    return {
      transform: `translate(${flyDirection.value.x * 2}px, ${flyDirection.value.y * 2}px) rotate(${flyDirection.value.x / 10}deg)`,
      opacity: 0,
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
  }
})
</script>

<template>
  <article
    class="playing-card"
    :class="{ 'playing-card--top': isTop, 'playing-card--dragging': isDragging, 'playing-card--wip': project.status === 'wip' }"
    :style="{ ...cardStyle, '--accent': accent }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <span v-if="project.status === 'wip'" class="playing-card__wip">WIP</span>
    <header class="playing-card__header">
      <span class="playing-card__category">{{ project.category }}</span>
      <span class="playing-card__order">#{{ String(project.order).padStart(2, '0') }}</span>
    </header>
    <div class="playing-card__art">
      <ProjectImage :slug="project.slug" :src="project.coverImage" :alt="project.title" />
      <div class="playing-card__shine" aria-hidden="true"></div>
    </div>
    <h2 class="playing-card__title">{{ project.title }}</h2>
    <p class="playing-card__tagline">{{ project.tagline }}</p>
  </article>
</template>

<style scoped>
.playing-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 0.9rem;
  border-radius: 16px;
  background: var(--surface);
  border: 2px solid var(--accent);
  box-shadow: 0 0 16px -4px var(--accent), 0 0 36px -12px var(--accent), 0 12px 24px -10px rgba(0, 0, 0, 0.6);
  touch-action: none;
  user-select: none;
  will-change: transform;
}

.playing-card--top {
  cursor: grab;
}

.playing-card--top.playing-card--dragging {
  cursor: grabbing;
}

.playing-card__wip {
  position: absolute;
  top: -0.6rem;
  right: 0.8rem;
  padding: 0.15rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #1a1306;
  background: var(--amber);
  border-radius: 999px;
  box-shadow: 0 0 10px -2px var(--amber);
}

.playing-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.playing-card__art {
  position: relative;
  margin-top: 0.5rem;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.playing-card__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.35) 50%, transparent 60%);
  background-size: 250% 250%;
  background-position: -20% -20%;
  transition: background-position 700ms ease;
  pointer-events: none;
}

.playing-card--top:hover .playing-card__shine {
  background-position: 120% 120%;
}

.playing-card__title {
  margin: 0.6rem 0 0.15rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.2;
  color: var(--text);
}

.playing-card__tagline {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.3;
  color: var(--text-muted);
}
</style>
