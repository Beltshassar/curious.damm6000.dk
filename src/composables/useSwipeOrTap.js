import { ref } from 'vue'

const TAP_THRESHOLD_PX = 8
const SWIPE_THRESHOLD_PX = 80

export function useSwipeOrTap({ onTap, onSwipeAway, disabled }) {
  const dragOffset = ref({ x: 0, y: 0 })
  const isDragging = ref(false)

  let pointerId = null
  let startX = 0
  let startY = 0

  function onPointerDown(event) {
    if (disabled?.value) return
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    isDragging.value = true
    event.currentTarget.setPointerCapture(pointerId)
  }

  function onPointerMove(event) {
    if (!isDragging.value || event.pointerId !== pointerId) return
    dragOffset.value = { x: event.clientX - startX, y: event.clientY - startY }
  }

  function onPointerUp(event) {
    if (!isDragging.value || event.pointerId !== pointerId) return
    isDragging.value = false

    const { x, y } = dragOffset.value
    const distance = Math.hypot(x, y)

    if (distance < TAP_THRESHOLD_PX) {
      // Deferred to a fresh task: the browser still has to dispatch a
      // trailing "click" for this same gesture, and if the detail overlay
      // (with its click-outside listener) mounts before that click fires,
      // it immediately treats its own opening gesture as an outside click.
      setTimeout(() => onTap?.(), 0)
    } else if (distance > SWIPE_THRESHOLD_PX) {
      onSwipeAway?.({ x, y })
    }

    dragOffset.value = { x: 0, y: 0 }
  }

  return { dragOffset, isDragging, onPointerDown, onPointerMove, onPointerUp }
}
