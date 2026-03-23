"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface OTPInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  className,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = React.useState(0)

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = value.split("")
    newValue[index] = e.target.value.replace(/\D/g, "")
    const newValueStr = newValue.join("")
    onChange?.(newValueStr)

    if (e.target.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    const newValue = value.split("")

    pastedData.split("").forEach((char, i) => {
      newValue[i] = char
    })

    onChange?.(newValue.join(""))

    if (pastedData.length > 0) {
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  React.useEffect(() => {
    if (focusedIndex < length) {
      inputRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, length])

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          disabled={disabled}
          className={cn(
            "h-12 w-12 text-center text-xl font-bold rounded-md border",
            "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "bg-white dark:bg-zinc-900",
            "border-zinc-200 dark:border-zinc-800",
            "placeholder:text-zinc-400",
            value[index]
              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
              : "border-zinc-200 dark:border-zinc-800"
          )}
          placeholder="-"
        />
      ))}
    </div>
  )
}

export default OTPInput
