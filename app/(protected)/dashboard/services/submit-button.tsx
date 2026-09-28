'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

type SubmitButtonProps = {
  label: string
  pendingLabel: string
  className: string
  variant?: 'default' | 'outline' | 'destructive'
}

export function SubmitButton({
  label,
  pendingLabel,
  className,
  variant = 'default',
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </Button>
  )
}
