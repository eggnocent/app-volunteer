import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

type LoadingModalProps = {
  open: boolean
  title: string
  description: string
}

let scrollLockCount = 0
let previousBodyOverflow = ''

export function LoadingModal({ open, title, description }: LoadingModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    lockBodyScroll()

    return () => {
      unlockBodyScroll()
    }
  }, [open])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          <motion.section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-2xl"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 18, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 10, scale: 0.985 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <LoaderCircle size={24} className="animate-spin" />
            </span>
            <h2 id={titleId} className="mt-5 font-heading text-2xl font-extrabold">
              {title}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  scrollLockCount += 1
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)

  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
  }
}
