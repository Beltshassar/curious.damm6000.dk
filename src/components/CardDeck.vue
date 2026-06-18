<script setup>
import PlayingCard from './PlayingCard.vue'

defineProps({
  deck: { type: Array, required: true },
  gestureDisabled: { type: Boolean, default: false },
})

const emit = defineEmits(['tap', 'cycle'])
</script>

<template>
  <div class="card-deck">
    <TransitionGroup name="card-deck">
      <PlayingCard
        v-for="entry in deck"
        :key="entry.project.slug"
        :project="entry.project"
        :stack-position="entry.stackPosition"
        :gesture-disabled="gestureDisabled"
        @tap="emit('tap', entry.project.slug)"
        @swiped="emit('cycle')"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.card-deck {
  position: relative;
  width: 280px;
  height: 400px;
}
</style>
