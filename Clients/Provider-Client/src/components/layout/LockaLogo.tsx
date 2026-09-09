import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LockaLogoProps {
  /** Rendered pixel size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * The LockA locker mark from `Assets/lockA_blue.png`.
 *
 * The source artwork is navy-on-white, so it sits on its own light tile rather
 * than directly on the navy app background.
 */
export function LockaMark({ size = 32, className }: LockaLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-white/20",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/locka-mark.png"
        alt=""
        width={size}
        height={size}
        priority
        className="size-full object-contain"
      />
    </span>
  );
}

export interface LockaWordmarkProps {
  /** Rendered width of the full logo lockup. */
  width?: number;
  className?: string;
  priority?: boolean;
}

/** The full logo lockup, mark plus "LockA — secure. private. health records." */
export function LockaWordmark({ width = 220, className, priority }: LockaWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-white/20",
        className,
      )}
    >
      <Image
        src="/locka-logo.png"
        alt="LockA Medical Passport"
        width={width}
        height={Math.round((width * 488) / 512)}
        priority={priority}
        className="h-auto w-full"
      />
    </span>
  );
}

export interface BrandLockupProps {
  /** Second line under "LockA", naming which client this is. */
  subtitle: string;
  className?: string;
}

/** Sidebar brand block: mark, product name, client name. */
export function BrandLockup({ subtitle, className }: BrandLockupProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LockaMark size={32} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">
          Lock
          <span className="bg-gradient-to-br from-locka-cyan to-locka-blue bg-clip-text text-transparent">
            A
          </span>
        </span>
        <span className="mt-1 truncate text-[0.625rem] tracking-widest text-foreground/45 uppercase">
          {subtitle}
        </span>
      </span>
    </span>
  );
}
