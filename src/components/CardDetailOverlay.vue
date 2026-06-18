<script setup>
import { computed, ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import InfoBox from './InfoBox.vue'
import ProjectImage from './ProjectImage.vue'
import { categoryColor } from '../utils/color'

const props = defineProps({
  project: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const accent = computed(() => categoryColor(props.project.category))

const storyParagraphs = computed(() =>
  props.project.storyRaw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
)

const panelRef = ref(null)
onClickOutside(panelRef, () => emit('close'))
onKeyStroke('Escape', () => emit('close'))
</script>

<template>
  <div class="overlay">
    <div ref="panelRef" class="overlay__panel" :style="{ '--accent': accent }">
      <button class="overlay__close" type="button" aria-label="Close details" @click="emit('close')">
        ✕
      </button>

      <div class="overlay__intro">
        <span class="overlay__category">{{ project.category }}</span>
        <h2 class="overlay__title">{{ project.title }}</h2>
        <p class="overlay__tagline">{{ project.tagline }}</p>
      </div>

      <div class="overlay__cover">
        <ProjectImage :slug="project.slug" :src="project.coverImage" :alt="project.title" />
      </div>

      <TransitionGroup tag="div" name="info-box" class="overlay__facts" appear>
        <InfoBox key="goal" label="Goal" style="--i: 0">{{ project.goal }}</InfoBox>
        <InfoBox key="concept" label="Concept" style="--i: 1">{{ project.concept }}</InfoBox>
        <InfoBox key="setup" label="Setup" style="--i: 2">
          <ul>
            <li v-for="item in project.setup" :key="item">{{ item }}</li>
          </ul>
        </InfoBox>
        <InfoBox key="outcome" label="Outcome" style="--i: 3">{{ project.outcome }}</InfoBox>
      </TransitionGroup>

      <InfoBox label="Story" class="overlay__story" style="--i: 4">
        <p v-for="(paragraph, index) in storyParagraphs" :key="index">{{ paragraph }}</p>
      </InfoBox>

      <div v-if="project.gallery?.length" class="overlay__gallery">
        <ProjectImage
          v-for="(image, index) in project.gallery"
          :key="image"
          :slug="project.slug"
          :src="image"
          :alt="`${project.title} photo ${index + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(8, 9, 20, 0.78);
  backdrop-filter: blur(6px);
}

.overlay__panel {
  position: relative;
  width: min(640px, 100%);
  max-height: min(82vh, 720px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.75rem;
  border-radius: 20px;
  background: var(--surface);
  border: 2px solid var(--accent);
  box-shadow: 0 0 32px -6px var(--accent), 0 24px 60px -20px rgba(0, 0, 0, 0.7);
  text-align: left;
}

.overlay__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid var(--accent);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  cursor: pointer;
  line-height: 1;
}

.overlay__intro {
  text-align: center;
}

.overlay__category {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.overlay__title {
  margin: 0.2rem 0;
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--text);
}

.overlay__tagline {
  margin: 0;
  color: var(--text-muted);
}

.overlay__cover {
  height: 220px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.overlay__facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.overlay__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 0.5rem;
}

.overlay__gallery .project-image,
.overlay__gallery :deep(.placeholder-art) {
  height: 96px;
  border-radius: 8px;
}

@media (max-width: 480px) {
  .overlay__facts {
    grid-template-columns: 1fr;
  }
}
</style>
