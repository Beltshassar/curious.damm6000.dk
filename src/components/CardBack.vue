<script setup>
import { computed } from 'vue'
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
</script>

<template>
  <div class="card-back" :style="{ '--accent': accent }">
    <button class="card-back__close" type="button" aria-label="Close details" @click="emit('close')">
      ✕
    </button>

    <div class="card-back__scroll">
      <div class="card-back__intro">
        <span class="card-back__category">{{ project.category }}</span>
        <h2 class="card-back__title">{{ project.title }}</h2>
        <p class="card-back__tagline">{{ project.tagline }}</p>
      </div>

      <div class="card-back__cover">
        <ProjectImage :slug="project.slug" :src="project.coverImage" :alt="project.title" />
      </div>

      <TransitionGroup tag="div" name="info-box" class="card-back__facts" appear>
        <InfoBox key="goal" label="Goal" style="--i: 0">{{ project.goal }}</InfoBox>
        <InfoBox key="concept" label="Concept" style="--i: 1">{{ project.concept }}</InfoBox>
        <InfoBox key="setup" label="Setup" style="--i: 2">
          <ul>
            <li v-for="item in project.setup" :key="item">{{ item }}</li>
          </ul>
        </InfoBox>
        <InfoBox key="outcome" label="Outcome" style="--i: 3">{{ project.outcome }}</InfoBox>
      </TransitionGroup>

      <InfoBox label="Story" class="card-back__story" style="--i: 4">
        <p v-for="(paragraph, index) in storyParagraphs" :key="index">{{ paragraph }}</p>
      </InfoBox>

      <div v-if="project.gallery?.length" class="card-back__gallery">
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
.card-back {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  background: var(--surface);
  text-align: left;
}

.card-back__close {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 10;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: 2px solid var(--text);
  background: var(--yellow);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
}

.card-back__scroll {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  border-radius: 18px;
}

.card-back__intro {
  text-align: center;
  padding-right: 1.6rem;
}

.card-back__category {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--accent);
}

.card-back__title {
  margin: 0.2rem 0;
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--text);
}

.card-back__tagline {
  margin: 0;
  color: var(--text-muted);
}

.card-back__cover {
  height: 180px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid var(--accent);
}

.card-back__facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.card-back__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 0.5rem;
}

.card-back__gallery .project-image,
.card-back__gallery :deep(.placeholder-art) {
  height: 96px;
  border-radius: 8px;
}

@media (max-width: 480px) {
  .card-back__facts {
    grid-template-columns: 1fr;
  }
}
</style>
