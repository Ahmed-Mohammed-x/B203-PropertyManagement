import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function PropertiesPage() {
  const session = await auth();
  const landlordId = session.user.id;

  async function createProperty(formData) {
    "use server";

    const session = await auth();
    if (!session) return;
    const landlordId = session.user.id;

    const name = String(formData.get("name") || "").trim();
    const address = String(formData.get("address") || "").trim();
    if (!name || !address) return;

    await prisma.property.create({
      data: { name, address, landlordId },
    });

    revalidatePath("/landlord/properties");
  }

  async function deleteProperty(formData) {
    "use server";

    const session = await auth();
    if (!session) return;
    const landlordId = session.user.id;

    const id = String(formData.get("id"));

    const p = await prisma.property.findFirst({ where: { id, landlordId } });
    if (!p) return;

    await prisma.property.delete({ where: { id } });
    revalidatePath("/landlord/properties");
  }

  const properties = await prisma.property.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <h2>Properties</h2>

      <form action={createProperty} style={{ marginBottom: 16 }}>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Name</label>
            <input className="input" name="name" placeholder="Property name" />
          </div>

          <div style={{ flex: 2, minWidth: 280 }}>
            <label className="label">Address</label>
            <input className="input" name="address" placeholder="Address" />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn" type="submit">
              Add
            </button>
          </div>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/landlord/properties/${p.id}/edit`}>{p.name}</Link>
              </td>
              <td>{p.address}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td>
                <form action={deleteProperty}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btnDanger" type="submit">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {properties.length === 0 ? (
            <tr>
              <td colSpan={4} className="mutedText">
                No properties yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}