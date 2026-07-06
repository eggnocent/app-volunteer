import { useRef } from 'react'

import { Dialog } from '@/components/Dialog'

type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  isPending?: boolean
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Batal',
  isPending = false,
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmClassName =
    tone === 'danger'
      ? 'bg-destructive text-destructive-foreground hover:bg-red-700'
      : 'bg-primary text-primary-foreground hover:bg-deep-green'

  return (
    <Dialog
      open
      title={title}
      description={description}
      className="max-w-md"
      isDismissDisabled={isPending}
      initialFocusRef={cancelButtonRef}
      onClose={onCancel}
      footer={
        <>
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${confirmClassName}`}
          >
            {isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {confirmLabel}
          </button>
        </>
      }
    />
  )
}
