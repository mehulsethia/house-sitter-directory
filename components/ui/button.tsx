'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[4px] text-[14px] font-medium tracking-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#5a4a3b] text-white hover:opacity-95',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-95',
        outline: 'border border-[#5a4a3b] bg-transparent text-[#5a4a3b] hover:bg-[#5a4a3b] hover:text-white',
        secondary: 'bg-black text-white hover:opacity-95',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-[#5a4a3b] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-[4px] px-3 text-[13px]',
        lg: 'h-11 rounded-[4px] px-8 text-[14px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
