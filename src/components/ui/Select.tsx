import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <select
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
