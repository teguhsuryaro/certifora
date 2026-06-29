interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showCount?: boolean
  variant?: 'default' | 'quota'
}

export function ProgressBar({ current, total, label, showCount = true, variant = 'default' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        {label && <span className="text-neutral-600">{label}</span>}
        {showCount && (
          <span className="text-neutral-500 font-medium">
            {current} / {total} ({percentage}%)
          </span>
        )}
      </div>
      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            variant === 'quota'
              ? percentage > 90
                ? 'bg-danger-500'
                : percentage > 75
                ? 'bg-warning-500'
                : 'bg-success-500'
              : 'bg-gradient-to-r from-primary-500 to-primary-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
