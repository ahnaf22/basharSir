import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'accent';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#FFB238] text-[#241600] font-bold hover:bg-[#FFB238]/90 focus-visible:ring-[#FFB238] shadow-[0_2px_0_#B97400,0_10px_30px_-12px_rgba(255,178,56,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all',
  secondary:
    'bg-[#7FD6A0] text-[#0D1814] font-bold hover:bg-[#7FD6A0]/90 focus-visible:ring-[#7FD6A0] shadow-sm',
  accent:
    'bg-[#FFB238] text-[#241600] font-bold hover:bg-[#FFB238]/90 focus-visible:ring-[#FFB238] shadow-sm',
  outline:
    'border border-[rgba(237,232,218,0.22)] bg-transparent text-[#EDE8DA] hover:border-[#FFB238] hover:text-[#FFB238] hover:bg-[#1A2D26] focus-visible:ring-[#FFB238] transition-colors',
  ghost:
    'bg-transparent text-[#B5B9AA] hover:bg-[#1A2D26] hover:text-[#EDE8DA] focus-visible:ring-[#FFB238]',
  danger:
    'bg-[#FF6152] text-white hover:bg-[#FF6152]/90 focus-visible:ring-[#FF6152] shadow-xs',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-heading font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
