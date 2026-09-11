"use client";

import { PractitionerGate } from "@/features/practitioner/PractitionerGate";
import { PractitionerProfile } from "@/features/practitioner/PractitionerProfile";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";

export default function ProfilePage() {
  return (
    <PractitionerGate>
      <ProfileView />
    </PractitionerGate>
  );
}

function ProfileView() {
  const { practitioner } = usePractitionerData();
  if (!practitioner) return null;
  return <PractitionerProfile practitioner={practitioner} />;
}
