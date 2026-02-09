export const dynamic = "force-dynamic";

import { PhoneForm } from "@/components/PhoneForm";

export default function NewPhonePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Phone</h1>
      <PhoneForm />
    </div>
  );
}
