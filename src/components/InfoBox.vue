<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <section class="info-box">
    <h3 class="info-box__label">{{ label }}</h3>
    <div class="info-box__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.info-box {
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  box-shadow: 0 0 14px -6px var(--accent);
}

.info-box__label {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.info-box__body {
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--text);
}

.info-box__body p {
  margin: 0 0 0.6rem;
}

.info-box__body p:last-child {
  margin-bottom: 0;
}

.info-box__body ul {
  margin: 0;
  padding-left: 1.1rem;
}
</style>
