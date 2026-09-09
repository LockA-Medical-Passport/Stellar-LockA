"use client";

import { ActivityView } from "@/features/activity/ActivityView";
import { PassportGate } from "@/features/passport/PassportGate";

export default function ActivityPage() {
  return (
    <PassportGate>
      <ActivityView />
    </PassportGate>
  );
}
