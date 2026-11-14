import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";

const STATUS_TONES: Record<ReportStatusValue, BadgeTone> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

export function StatusBadge({ status }: { status: ReportStatusValue }) {
  return (
    <Badge tone={STATUS_TONES[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: ReportTypeValue }) {
  return (
    <Badge tone={type === "EMERGENCY" ? "danger" : "neutral"}>
      {TYPE_LABELS[type]}
    </Badge>
  );
}
