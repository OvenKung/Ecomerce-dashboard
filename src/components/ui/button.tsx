import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { LucideIcon, Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 focus-visible:ring-blue-500',
        destructive: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-700 focus-visible:ring-red-500',
        outline: 'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 focus-visible:ring-blue-500',
        secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus-visible:ring-gray-500',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 focus-visible:ring-green-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-orange-700 focus-visible:ring-yellow-500',
        info: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-blue-700 focus-visible:ring-cyan-500',
        purple: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:from-purple-600 hover:to-pink-700 focus-visible:ring-purple-500',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-purple-500',
        glass: 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-900 hover:bg-white/30 focus-visible:ring-blue-500'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        xl: 'h-14 rounded-xl px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12'
      },
      animation: {
        none: '',
        bounce: 'hover:animate-bounce',
        pulse: 'hover:animate-pulse',
        scale: 'hover:scale-105',
        lift: 'hover:-translate-y-1'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'scale'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  badge?: string | number
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    animation,
    asChild = false,
    loading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    badge,
    glow = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          glow && 'hover:shadow-xl hover:shadow-blue-500/25',
          disabled && 'cursor-not-allowed'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {!asChild && (
          <>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Loading state */}
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            
            {/* Left icon */}
            {LeftIcon && !loading && (
              <LeftIcon className={cn(
                'transition-transform duration-300 group-hover:scale-110',
                children ? 'mr-2 h-4 w-4' : 'h-4 w-4'
              )} />
            )}
            
            {/* Content */}
            <span className="relative z-10 flex items-center">
              {children}
            </span>
            
            {/* Right icon */}
            {RightIcon && !loading && (
              <RightIcon className={cn(
                'transition-transform duration-300 group-hover:scale-110',
                children ? 'ml-2 h-4 w-4' : 'h-4 w-4'
              )} />
            )}
            
            {/* Badge */}
            {badge && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </>
        )}
        {asChild && children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Specialized button components
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: LucideIcon
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, tooltip, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        title={tooltip}
        {...props}
      >
        <Icon className="h-4 w-4" />
      </Button>
    )
  }
)
IconButton.displayName = 'IconButton'

export interface ActionButtonProps extends ButtonProps {
  label: string
  description?: string
  icon?: LucideIcon
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ label, description, icon: Icon, size = 'lg', variant = 'outline', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className="h-auto p-4 flex-col space-y-1"
        leftIcon={Icon}
        {...props}
      >
        <span className="font-semibold">{label}</span>
        {description && (
          <span className="text-xs opacity-75 font-normal">{description}</span>
        )}
      </Button>
    )
  }
)
ActionButton.displayName = 'ActionButton'

export interface FloatingActionButtonProps extends ButtonProps {
  icon: LucideIcon
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon: Icon, position = 'bottom-right', size = 'icon-lg', variant = 'default', className, ...props }, ref) => {
    const positions = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          positions[position],
          'shadow-2xl hover:shadow-3xl z-50 rounded-full',
          className
        )}
        {...props}
      >
        <Icon className="h-6 w-6" />
      </Button>
    )
  }
)
FloatingActionButton.displayName = 'FloatingActionButton'

// Button group component
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'default' | 'lg'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', size = 'default', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          '[&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none',
          orientation === 'vertical' && '[&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none',
          '[&>button:not(:last-child)]:border-r-0',
          orientation === 'vertical' && '[&>button:not(:last-child)]:border-b-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

export { 
  Button, 
  IconButton, 
  ActionButton, 
  FloatingActionButton, 
  ButtonGroup, 
  buttonVariants 
}