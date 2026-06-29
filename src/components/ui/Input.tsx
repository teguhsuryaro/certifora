import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 border rounded-xl outline-none transition-all text-sm bg-white/60 backdrop-blur-sm
            ${error
              ? 'border-danger-500 focus:ring-4 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-neutral-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 hover:border-neutral-300 hover:bg-white/80'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
