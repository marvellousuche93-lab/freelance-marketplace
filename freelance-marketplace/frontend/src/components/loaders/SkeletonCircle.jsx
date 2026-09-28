import SkeletonBlock from "./SkeletonBlock";
import { cn } from "@/utils/cn";

const SIZES = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
};

export default function SkeletonCircle({ size = "md", className }) {
  return (
    <SkeletonBlock
      rounded="full"
      className={cn(SIZES[size] || SIZES.md, "shrink-0", className)}
    />
  );
}