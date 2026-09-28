/**
 * Card — a surface container with subtle border and shadow.
 *
 * Composed of Card, CardHeader, CardBody, CardFooter for flexibility.
 */

import { cn } from "../../utils/cn";

export function Card({ className = "", children, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-t border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;