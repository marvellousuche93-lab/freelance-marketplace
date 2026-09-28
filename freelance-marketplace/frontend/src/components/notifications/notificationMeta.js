/**
 * Per-type metadata for notifications: icon, tone, and short label.
 */

import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  Star,
  Undo2,
  XCircle,
} from "lucide-react";

export const NOTIFICATION_META = {
  NEW_APPLICATION: {
    icon: FileText,
    tone: "brand",
    label: "New application",
  },
  APPLICATION_ACCEPTED: {
    icon: CheckCircle2,
    tone: "success",
    label: "Application accepted",
  },
  APPLICATION_REJECTED: {
    icon: XCircle,
    tone: "danger",
    label: "Application rejected",
  },
  APPLICATION_WITHDRAWN: {
    icon: Undo2,
    tone: "neutral",
    label: "Application withdrawn",
  },
  JOB_STATUS_CHANGED: {
    icon: Bell,
    tone: "info",
    label: "Job status changed",
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    tone: "info",
    label: "New message",
  },
  NEW_REVIEW: {
    icon: Star,
    tone: "warning",
    label: "New review",
  },
  SYSTEM: {
    icon: Bell,
    tone: "neutral",
    label: "System",
  },
};

export function getNotificationMeta(type) {
  return NOTIFICATION_META[type] || NOTIFICATION_META.SYSTEM;
}