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
            w-full px-4 py-2.5 border rounded-lg outline-none transition-all text-sm
            ${error
              ? 'border-danger-300 focus:ring-2 focus:ring-danger-500 focus:border-danger-500'
              : 'border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
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
