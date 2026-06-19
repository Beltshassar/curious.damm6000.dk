<script setup>
import { computed } from 'vue'
import { resolveProjectImage } from '../content/loadProjects'
import PlaceholderArt from './PlaceholderArt.vue'

const props = defineProps({
  slug: { type: String, required: true },
  src: { type: String, default: undefined },
  alt: { type: String, default: '' },
})

const resolvedSrc = computed(() => resolveProjectImage(props.slug, props.src))
</script>

<template>
  <img v-if="resolvedSrc" class="project-image" :src="resolvedSrc" :alt="alt" loading="lazy" draggable="false" />
  <PlaceholderArt v-else class="project-image" :seed="slug" :label="alt" />
</template>

<style scoped>
.project-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Browsers let you drag an <img> out of the page by default once the
     pointer moves a few px - that native drag start hijacks the gesture
     out from under our own pointer-based swipe handling. */
  -webkit-user-drag: none;
  user-select: none;
}
</style>
