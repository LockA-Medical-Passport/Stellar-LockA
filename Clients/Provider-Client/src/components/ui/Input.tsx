import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, describedByFor, fieldBaseClasses, fieldStateClasses } from "./field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: ReactNode;
  error?: string;
  /** Rendered inside the field on the right, e.g. an inline "Generate" action. */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, id, className, trailing, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <FieldWrapper
        id={inputId}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
      >
        <div className={cn(trailing && "flex items-center gap-2")}>
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={describedByFor(inputId, error, helperText)}
            className={cn(fieldBaseClasses, fieldStateClasses(!!error), className)}
            {...props}
          />
          {trailing && <div className="shrink-0">{trailing}</div>}
        </div>
      </FieldWrapper>
    );
  },
);

Input.displayName = "Input";
