import Link from "next/link";
import { type ComponentProps } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./Button";

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A navigation link that looks like a button, without nesting `a` in `button`. */
export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
