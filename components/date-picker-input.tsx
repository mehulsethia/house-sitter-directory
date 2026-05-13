'use client'

type DatePickerInputProps = {
  name: string
  value?: string
  ariaLabel: string
  className?: string
  onChange?: (value: string) => void
}

export function DatePickerInput({ name, value, ariaLabel, className, onChange }: DatePickerInputProps) {
  return (
    <input
      name={name}
      type="date"
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onChange?.(event.target.value)}
      onClick={(event) => event.currentTarget.showPicker?.()}
      onFocus={(event) => event.currentTarget.showPicker?.()}
      className={className}
    />
  )
}
