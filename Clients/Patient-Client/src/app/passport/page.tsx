"use client";

import { PassportDetail } from "@/features/passport/PassportDetail";
import { PassportGate } from "@/features/passport/PassportGate";
import { usePassportData } from "@/features/passport/usePassportData";

export default function PassportPage() {
  return (
    <PassportGate>
      <PassportView />
    </PassportGate>
  );
}

function PassportView() {
  const { passport } = usePassportData();
  if (!passport) return null;
  return <PassportDetail passport={passport} />;
}
