/**
 * StatusBadge — a badge for a status string, with consistent colors
 * across applications, jobs, and reviews.
 */

import Badge from "../ui/Badge";
import { formatStatus, statusVariant } from "../../utils/format";

export default function StatusBadge({ status, className = "" }) {
  return (
    <Badge variant={statusVariant(status)} className={className}>
      {formatStatus(status)}
    </Badge>
  );
}