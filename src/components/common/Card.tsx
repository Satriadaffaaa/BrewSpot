import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-white/5 bg-surface shadow-premium text-neutral overflow-hidden transition-all duration-300',
        hover && 'hover:shadow-xl hover:-translate-y-1 hover:border-accent/10',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }

