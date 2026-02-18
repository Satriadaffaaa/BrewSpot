import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-neutral/10 bg-white shadow-sm text-neutral',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }
