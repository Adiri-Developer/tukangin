'use client'

import { useFormStatus } from 'react-dom'
import { Ban, RotateCcw } from 'lucide-react'
import { cancelOrRejectBooking } from '@/app/actions/booking-lifecycle'
import { Button } from '@/components/ui/button'

type CancellationActionProps = {
  bookingId: string
  label: string
  pendingLabel: string
  description: string
  confirmation: string
  refundsPayment?: boolean
}

function CancellationSubmitButton({
  label,
  pendingLabel,
  refundsPayment,
}: Pick<CancellationActionProps, 'label' | 'pendingLabel' | 'refundsPayment'>) {
  const { pending } = useFormStatus()
  const Icon = refundsPayment ? RotateCcw : Ban

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
      className="h-11 w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 font-bold text-[#B91C1C] hover:bg-[#FEE2E2] hover:text-[#991B1B] focus-visible:ring-[#DC2626]/25"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {pending ? pendingLabel : label}
    </Button>
  )
}

export function CancellationAction({
  bookingId,
  label,
  pendingLabel,
  description,
  confirmation,
  refundsPayment = false,
}: CancellationActionProps) {
  return (
    <form
      action={cancelOrRejectBooking}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault()
      }}
      className="rounded-[12px] border border-[#FECACA] bg-white p-4"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <p className="mb-3 text-xs leading-5 text-[#7F1D1D]">{description}</p>
      <CancellationSubmitButton label={label} pendingLabel={pendingLabel} refundsPayment={refundsPayment} />
    </form>
  )
}
