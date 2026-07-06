import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

type DialogProps = {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  icon?: ReactNode
  closeLabel?: string
  className?: string
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  bodyClassName?: string
  footerClassName?: string
  isDismissDisabled?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  onClose: () => void
}

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const dialogStack: string[] = []
let scrollLockCount = 0
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  icon,
  closeLabel = 'Tutup dialog',
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  footerClassName,
  isDismissDisabled = false,
  initialFocusRef,
  onClose,
}: DialogProps) {
  const prefersReducedMotion = useReducedMotion()
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const stackId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const previouslyFocused = document.activeElement
    dialogStack.push(stackId)
    lockBodyScroll()

    const focusTarget =
      initialFocusRef?.current ??
      getFocusableElements(dialogRef.current)[0] ??
      dialogRef.current

    window.requestAnimationFrame(() => {
      focusTarget?.focus({ preventScroll: true })
    })

    return () => {
      const stackIndex = dialogStack.lastIndexOf(stackId)

      if (stackIndex >= 0) {
        dialogStack.splice(stackIndex, 1)
      }

      unlockBodyScroll()

      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [initialFocusRef, open, stackId])

  function isTopDialog() {
    return dialogStack[dialogStack.length - 1] === stackId
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (
      event.target === event.currentTarget &&
      !isDismissDisabled &&
      isTopDialog()
    ) {
      onClose()
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isTopDialog()) {
      return
    }

    if (event.key === 'Escape' && !isDismissDisabled) {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = getFocusableElements(dialogRef.current)

    if (focusableElements.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus({ preventScroll: true })
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

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
          onMouseDown={handleBackdropClick}
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              'flex max-h-[calc(100svh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg border bg-card shadow-2xl outline-none',
              className,
            )}
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
            onKeyDown={handleKeyDown}
          >
            <header
              className={cn(
                'flex items-start justify-between gap-4 border-b px-5 py-4',
                headerClassName,
              )}
            >
              <div className="flex min-w-0 gap-3">
                {icon ? (
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {icon}
                  </span>
                ) : null}
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className={cn(
                      'font-heading text-xl font-extrabold text-foreground',
                      titleClassName,
                    )}
                  >
                    {title}
                  </h2>
                  {description ? (
                    <p
                      id={descriptionId}
                      className={cn(
                        'mt-1 text-sm leading-6 text-muted-foreground',
                        descriptionClassName,
                      )}
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                disabled={isDismissDisabled}
                onClick={onClose}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={closeLabel}
              >
                <X size={17} />
              </button>
            </header>

            {children ? (
              <div className={cn('min-h-0 overflow-y-auto p-5', bodyClassName)}>
                {children}
              </div>
            ) : null}

            {footer ? (
              <footer
                className={cn(
                  'flex flex-col-reverse gap-3 border-t bg-muted/40 p-5 sm:flex-row sm:justify-end',
                  footerClassName,
                )}
              >
                {footer}
              </footer>
            ) : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'),
  )
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    previousBodyOverflow = document.body.style.overflow
    previousBodyPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  scrollLockCount += 1
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)

  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
    document.body.style.paddingRight = previousBodyPaddingRight
  }
}
