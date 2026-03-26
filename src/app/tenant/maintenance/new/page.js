import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewMaintenancePage() {
  const session = await auth();
  const tenantId = session.user.id;

  const tp = await prisma.tenantProfile.findUnique({
    where: { userId: tenantId },
  });

  if (!tp) {
    return (
      <div className="card">
        <h2>New Maintenance Request</h2>
        <p style={{ color: "var(--muted)" }}>No tenant profile found.</p>
      </div>
    );
  }

  async function createTicket(formData) {
    "use server";

    const session = await auth();
    if (!session) return;

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!title || !description) return;

    await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        tenantId: session.user.id,
        landlordId: tp.landlordId,
        propertyId: tp.propertyId,
      },
    });

    redirect("/tenant/dashboard");
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h2>New Maintenance Request</h2>

      <form action={createTicket}>
        <label className="label">Title</label>
        <input
          className="input"
          name="title"
          placeholder="e.g., Leaking faucet"
        />

        <div style={{ height: 10 }} />

        <label className="label">Description</label>
        <textarea
          className="input"
          name="description"
          rows={5}
          placeholder="Describe the issue..."
        />

        <div style={{ height: 14 }} />

        <button className="btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}