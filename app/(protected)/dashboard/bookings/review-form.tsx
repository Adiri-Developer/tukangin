'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Star } from 'lucide-react'
import { submitReview } from '@/app/actions/review'
import { Button } from '@/components/ui/button'

function ReviewSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="h-11 w-full rounded-[8px] bg-[#FF6B00] font-bold text-white shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#E05E00] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Mengirim ulasan...' : 'Kirim Ulasan'}
    </Button>
  )
}

export function ReviewForm({ bookingId, providerName }: { bookingId: string; providerName: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  return (
    <form action={submitReview} className="rounded-[16px] border-2 border-[#FED7AA] bg-[#FFF7ED] p-5 shadow-sm">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="mb-4">
        <p className="text-sm font-bold text-[#9A3412]">Nilai pekerjaan {providerName}</p>
        <p className="mt-1 text-xs leading-5 text-[#C2410C]">Ulasan Anda membantu customer lain memilih mitra.</p>
      </div>

      <fieldset className="mb-4">
        <legend className="mb-2 text-xs font-semibold text-[#7C2D12]">Rating pekerjaan</legend>
        <div className="flex gap-1" aria-label={`${rating || 0} dari 5 bintang`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded-md p-1 focus-within:ring-2 focus-within:ring-[#FF6B00] focus-within:ring-offset-2">
              <input
                className="sr-only"
                type="radio"
                name="rating"
                value={value}
                required
                checked={rating === value}
                onChange={() => setRating(value)}
              />
              <span className="sr-only">{value} bintang</span>
              <Star
                className={`h-7 w-7 transition-colors ${value <= rating ? 'fill-amber-400 text-amber-500' : 'text-[#CBD5E1]'}`}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor={`review-comment-${bookingId}`} className="mb-1.5 block text-xs font-semibold text-[#7C2D12]">
        Ceritakan pengalaman <span className="font-normal text-[#9A3412]">(opsional)</span>
      </label>
      <textarea
        id={`review-comment-${bookingId}`}
        name="comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={500}
        rows={4}
        placeholder="Contoh: Datang tepat waktu dan hasilnya rapi."
        className="mb-1 w-full resize-y rounded-[8px] border border-[#FDBA74] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
      />
      <p className="mb-4 text-right text-[11px] text-[#9A3412]">{comment.length}/500</p>

      <ReviewSubmitButton disabled={rating === 0} />
    </form>
  )
}
