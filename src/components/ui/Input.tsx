import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightElement, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`
              w-full py-2.5 border rounded-xl outline-none transition-all text-sm bg-white/60 backdrop-blur-sm
              ${icon ? 'pl-10' : 'px-4'}
              ${rightElement ? 'pr-10' : 'pr-4'}
              ${error
                ? 'border-danger-500 focus:ring-4 focus:ring-danger-500/20 focus:border-danger-500'
                : 'border-neutral-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 hover:border-neutral-300 hover:bg-white/80'
              }
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-neutral-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
