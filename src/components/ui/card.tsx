import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'gradient' | 'bordered' | 'elevated'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  animated?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  action?: React.ReactNode
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
}

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  onClick?: () => void
  loading?: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  badgeText?: string
  badgeColor?: 'success' | 'warning' | 'error' | 'info'
  className?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', hover = false, animated = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/30',
      gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100',
      bordered: 'bg-white border-2 border-gray-300',
      elevated: 'bg-white border border-gray-100 shadow-xl'
    }

    const sizes = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden',
          variants[variant],
          sizes[size],
          hover && 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer',
          animated && 'animate-slideInUp',
          className
        )}
        {...props}
      >
        {/* Gradient overlay for enhanced visual effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between space-y-1.5 pb-4', className)}
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, justify = 'start', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-4 mt-4 border-t border-gray-100',
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardFooter.displayName = 'CardFooter'

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    color = 'blue', 
    onClick, 
    loading = false,
    ...props 
  }, ref) => {
    const colorClasses = {
      blue: {
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'from-blue-50 to-indigo-50',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      },
      green: {
        gradient: 'from-green-500 to-emerald-600',
        bg: 'from-green-50 to-emerald-50',
        text: 'text-green-600',
        icon: 'text-green-600'
      },
      yellow: {
        gradient: 'from-yellow-500 to-orange-600',
        bg: 'from-yellow-50 to-orange-50',
        text: 'text-yellow-600',
        icon: 'text-yellow-600'
      },
      red: {
        gradient: 'from-red-500 to-pink-600',
        bg: 'from-red-50 to-pink-50',
        text: 'text-red-600',
        icon: 'text-red-600'
      },
      purple: {
        gradient: 'from-purple-500 to-pink-600',
        bg: 'from-purple-50 to-pink-50',
        text: 'text-purple-600',
        icon: 'text-purple-600'
      },
      indigo: {
        gradient: 'from-indigo-500 to-purple-600',
        bg: 'from-indigo-50 to-purple-50',
        text: 'text-indigo-600',
        icon: 'text-indigo-600'
      }
    }

    if (loading) {
      return (
        <Card 
          ref={ref}
          variant="glass" 
          hover 
          animated 
          className="group"
          {...props}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </Card>
      )
    }

    const colors = colorClasses[color]

    return (
      <Card 
        ref={ref}
        variant="glass" 
        hover 
        animated 
        onClick={onClick}
        className={cn(
          'group cursor-pointer bg-gradient-to-br',
          colors.bg,
          onClick && 'hover:scale-105'
        )}
        {...props}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                {title}
              </p>
              <p className={cn(
                'text-2xl font-bold mt-1 transition-all duration-300 group-hover:scale-105',
                colors.text
              )}>
                {value}
              </p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            {Icon && (
              <div className={cn(
                'p-3 rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
                colors.gradient
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center space-x-2">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                trend.isPositive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">
                vs {trend.period}
              </span>
            </div>
          )}
        </div>
      </Card>
    )
  }
)
StatCard.displayName = 'StatCard'

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    badgeText, 
    badgeColor = 'info',
    className,
    ...props 
  }, ref) => {
    const badgeColors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    }

    return (
      <Card 
        ref={ref}
        variant="glass" 
        hover 
        animated 
        className={cn('group', className)}
        {...props}
      >
        <CardHeader>
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-base">{title}</CardTitle>
              {subtitle && (
                <CardDescription className="text-xs mt-1">
                  {subtitle}
                </CardDescription>
              )}
            </div>
            {badgeText && (
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full border',
                badgeColors[badgeColor]
              )}>
                {badgeText}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {value}
          </p>
        </CardContent>
      </Card>
    )
  }
)
MetricCard.displayName = 'MetricCard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  MetricCard
}