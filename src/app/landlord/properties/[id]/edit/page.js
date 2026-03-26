import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function EditPropertyPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  // Next.js 16: params can be a Promise
  const p = await params;
  const id = p.id;

  const landlordId = session.user.id;

  const property = await prisma.property.findFirst({
    where: { id, landlordId },
  });

  if (!property) redirect("/landlord/properties");

  async function updateProperty(formData) {
    "use server";

    const session = await auth();
    if (!session) redirect("/login");
    if (session.user.role !== "LANDLORD") redirect("/unauthorized");

    const landlordId = session.user.id;

    // Re-read id from the closure (works now because id is defined correctly)
    const existing = await prisma.property.findFirst({
      where: { id, landlordId },
    });
    if (!existing) redirect("/landlord/properties");

    const name = String(formData.get("name") || "").trim();
    const address = String(formData.get("address") || "").trim();
    if (!name || !address) return;

    await prisma.property.update({
      where: { id },
      data: { name, address },
    });

    revalidatePath("/landlord/properties");
    redirect("/landlord/properties");
  }

  return (
    <div className="card">
      <h2>Edit Property</h2>

      <form action={updateProperty}>
        <label className="label">Name</label>
        <input className="input" name="name" defaultValue={property.name} />

        <div className="spacer10" />

        <label className="label">Address</label>
        <input className="input" name="address" defaultValue={property.address} />

        <div className="spacer14" />

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}