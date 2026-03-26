import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function LandlordMaintenancePage() {
  const session = await auth();
  const landlordId = session.user.id;

  async function setStatus(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));

    const ticket = await prisma.maintenanceRequest.findFirst({
      where: { id, landlordId },
    });
    if (!ticket) return;

    await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "DONE" ? new Date() : null,
      },
    });

    revalidatePath("/landlord/maintenance");
  }

  const tickets = await prisma.maintenanceRequest.findMany({
    where: { landlordId },
    include: { tenant: true, property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <h2>Maintenance</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Property</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Resolved</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.tenant.email}</td>

              <td>
                {t.property?.name ?? (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </td>

              <td>
                <strong>{t.title}</strong>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  {t.description}
                </div>
              </td>

              <td>
                {t.status === "DONE" ? (
                    <span className="badge badgeOk">DONE</span>) 
                    : t.status === "IN_PROGRESS" ? 
                    (<span className="badge badgeWarn">IN PROGRESS</span>) 
                    : (<span className="badge">OPEN</span>)}
                    </td>

              <td>{new Date(t.createdAt).toLocaleString()}</td>

              <td>
                {t.resolvedAt ? (
                  new Date(t.resolvedAt).toLocaleString()
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </td>

              <td>
                <div className="row">
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="OPEN" />
                    <button className="btn" type="submit">
                      Open
                    </button>
                  </form>

                  <form action={setStatus}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="IN_PROGRESS" />
                    <button className="btn" type="submit">
                      In Progress
                    </button>
                  </form>

                  <form action={setStatus}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="DONE" />
                    <button className="btn" type="submit">
                      Done
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}

          {tickets.length === 0 && (
            <tr>
              <td colSpan={7} style={{ color: "var(--muted)" }}>
                No maintenance requests yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}