import { notFound } from "next/navigation";
import { PatientDetailScreen } from "./PatientDetailScreen";

/**
 * `params` is a promise in Next 16, so the id is resolved here and the screen
 * itself stays a client component with access to the wallet-backed store.
 */
export default async function PatientPage({ params }: { params: Promise<{ passportId: string }> }) {
  const { passportId } = await params;

  if (!/^\d{1,19}$/.test(passportId)) notFound();
  const parsed = Number(passportId);
  if (!Number.isSafeInteger(parsed)) notFound();

  return <PatientDetailScreen passportId={parsed} />;
}
