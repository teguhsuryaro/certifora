interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showCount?: boolean
}

export function ProgressBar({ current, total, label, showCount = true }: ProgressBarProps) {
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
          className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
