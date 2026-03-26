import bcrypt from "bcrypt";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function TenantsPage() {
  const session = await auth();
  const landlordId = session.user.id;

  // Server action to create a tenant
  async function createTenant(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;

    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "").trim();
    const propertyId = String(formData.get("propertyId") || "").trim();

    if (!email || !password) return;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 10);

    const tenantUser = await prisma.user.create({
      data: { email, passwordHash, role: "TENANT" },
    });

    await prisma.tenantProfile.create({
      data: {
        userId: tenantUser.id,
        landlordId,
        propertyId: propertyId || null,
      },
    });

    revalidatePath("/landlord/tenants");
  }

  // Server action to delete a tenant
  async function deleteTenant(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const tenantUserId = String(formData.get("tenantUserId"));

    const tp = await prisma.tenantProfile.findFirst({
      where: { userId: tenantUserId, landlordId },
    });
    if (!tp) return;

    // Delete dependent data first
    await prisma.maintenanceRequest.deleteMany({
      where: { tenantId: tenantUserId, landlordId },
    });
    await prisma.payment.deleteMany({
      where: { tenantId: tenantUserId, landlordId },
    });

    await prisma.tenantProfile.delete({ where: { userId: tenantUserId } });
    await prisma.user.delete({ where: { id: tenantUserId } });

    revalidatePath("/landlord/tenants");
  }

  const properties = await prisma.property.findMany({ where: { landlordId } });

  const tenants = await prisma.tenantProfile.findMany({
    where: { landlordId },
    include: { user: true, property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <h2>Tenants</h2>

      <form action={createTenant} style={{ marginBottom: 16 }}>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Tenant email</label>
            <input className="input" name="email" placeholder="tenant@example.com" />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Password</label>
            <input className="input" name="password" placeholder="tenant password" />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Property (optional)</label>
            <select className="select" name="propertyId" defaultValue="">
              <option value="">Not assigned</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn" type="submit">
              Add Tenant
            </button>
          </div>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Property</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>{t.user.email}</td>
              <td>{t.property ? t.property.name : <span className="mutedText">Not assigned</span>}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                <form action={deleteTenant}>
                  <input type="hidden" name="tenantUserId" value={t.userId} />
                  <button className="btn btnDanger" type="submit">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {tenants.length === 0 && (
            <tr>
              <td colSpan={4} className="mutedText">
                No tenants yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}