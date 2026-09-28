import { cn } from "@/utils/cn";

/**
 * Renders children in a container that is visually hidden but still
 * exposed to assistive technology. Standard sr-only technique with a
 * fallback for Windows High Contrast mode.
 */
export default function VisuallyHidden({
  as: As = "span",
  className,
  children,
  ...props
}) {
  return (
    <As
      className={cn(
        "sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}