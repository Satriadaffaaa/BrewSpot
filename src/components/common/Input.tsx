import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  endIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, endIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 group">
        {label && (
          <label
            className="text-xs font-black uppercase tracking-[0.2em] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-light group-focus-within:text-accent transition-colors"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            className={cn(
              'flex h-12 w-full rounded-xl border border-neutral/5 bg-secondary/30 px-5 py-3 text-sm font-medium placeholder:text-neutral-light/50 outline-none ring-2 ring-transparent focus:ring-accent/20 focus:border-accent/50 focus:bg-surface disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm',
              error && 'border-danger/50 focus:ring-danger/20',
              endIcon && 'pr-12',
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-light group-focus-within:text-accent transition-colors">
              {endIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[10px] font-bold uppercase tracking-widest text-danger animate-in fade-in slide-in-from-top-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

