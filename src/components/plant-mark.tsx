import { cn } from "@/lib/utils";
import type { PlantStatus } from "@/lib/types";

const statusColor: Record<PlantStatus, string> = {
  在庫: "border-moss/30 bg-leaf/10",
  販売中: "border-gold bg-gold/20",
  売約済: "border-clay bg-clay/15",
  入金済: "border-ink/30 bg-ink/10",
  売却済: "border-stone bg-stone/30",
  枯死: "border-stone bg-stone/40 grayscale",
  返品: "border-clay bg-clay/10"
};

export function PlantMark({ status, className }: { status: PlantStatus; className?: string }) {
  return (
    <div className={cn("relative mx-auto h-24 w-20 rounded-b-[28px] rounded-t-lg border-2", statusColor[status], className)}>
      <div className="absolute left-1/2 top-3 h-12 w-2 -translate-x-1/2 rounded-full bg-moss" />
      <div className="absolute left-6 top-2 h-9 w-7 -rotate-12 rounded-full bg-leaf" />
      <div className="absolute right-5 top-1 h-10 w-8 rotate-12 rounded-full bg-moss" />
      <div className="absolute left-7 top-8 h-7 w-9 rounded-full bg-[#6f8d67]" />
      <div className="absolute bottom-0 left-2 right-2 h-9 rounded-t-md bg-clay/75" />
    </div>
  );
}
