import { useRef, useEffect, type RefObject } from 'react'

interface UseDragToDismissOptions {
  /** Which direction dismisses: 'down' for bottom drawers, 'up' for top drawers */
  direction: 'down' | 'up'
  /** Pixel threshold to trigger dismiss (default: 80) */
  threshold?: number
  /** Called when drag exceeds threshold */
  onDismiss: () => void
  /** Ref to the drawer panel element (for applying drag offset) */
  panelRef: RefObject<HTMLDivElement | null>
  /** Ref to the drag handle element (pointer events are attached here) */
  handleRef: RefObject<HTMLDivElement | null>
  /** Whether the drawer is currently open */
  isOpen: boolean
}

/**
 * Hook that makes a drawer drag-to-dismiss via its handle.
 * Uses pointer events (works for both touch and mouse).
 * While dragging, the panel's transform is updated directly (CSS transition disabled).
 * On release past the threshold, onDismiss is called.
 * On release below threshold, the panel snaps back.
 */
export function useDragToDismiss({
  direction,
  threshold = 80,
  onDismiss,
  panelRef,
  handleRef,
  isOpen,
}: UseDragToDismissOptions) {
  const startY = useRef(0)
  const dragging = useRef(false)
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    const handle = handleRef.current
    const panel = panelRef.current
    if (!handle || !panel || !isOpen) return

    function onPointerDown(e: PointerEvent) {
      startY.current = e.clientY
      dragging.current = true
      try {
        handle!.setPointerCapture(e.pointerId)
      } catch {
        // Pointer may have already been released on some mobile browsers
      }
      panel!.style.transition = 'none'
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return
      e.preventDefault()

      const deltaY = e.clientY - startY.current

      if (direction === 'down') {
        panel!.style.transform = `translateY(${Math.max(0, deltaY)}px)`
      } else {
        panel!.style.transform = `translateY(${Math.min(0, deltaY)}px)`
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return
      dragging.current = false

      const deltaY = e.clientY - startY.current
      const shouldDismiss =
        direction === 'down' ? deltaY > threshold : deltaY < -threshold

      panel!.style.transition = ''

      if (shouldDismiss) {
        panel!.style.transform = direction === 'down' ? 'translateY(100%)' : 'translateY(-100%)'
        dismissRef.current()
      } else {
        panel!.style.transform = 'translateY(0)'
      }
    }

    handle.addEventListener('pointerdown', onPointerDown)
    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
    handle.addEventListener('pointercancel', onPointerUp)

    return () => {
      handle.removeEventListener('pointerdown', onPointerDown)
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      handle.removeEventListener('pointercancel', onPointerUp)
    }
  }, [direction, threshold, panelRef, handleRef, isOpen])
}
