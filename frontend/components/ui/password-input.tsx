"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Classes for the outer wrapper (spacing, width). */
  wrapperClassName?: string;
};

/**
 * Password field with an eye button that toggles between hidden and visible text.
 * The input keeps its own `className`; right padding is added so text never runs under the button.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className = "", wrapperClassName = "", disabled, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        ref={ref}
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={props.id}
        title={visible ? "Hide password" : "Show password"}
        className="pressable absolute inset-y-0 right-1 my-auto flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 cursor-pointer"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>
    </div>
  );
});
