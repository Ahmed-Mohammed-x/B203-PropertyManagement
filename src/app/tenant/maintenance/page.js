import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TenantMaintenancePage() {
  const session = await auth();
  const tenantId = session.user.id;

  const tickets = await prisma.maintenanceRequest.findMany({
    where: { tenantId },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>My Maintenance Requests</h2>

        <Link className="btn" href="/tenant/maintenance/new">
          New Request
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Resolved</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>
                {t.property?.name ?? (
                  <span className="mutedText">—</span>
                )}
              </td>

              <td>
                <strong>{t.title}</strong>
                <div className="mutedText">{t.description}</div>
              </td>

              <td>
                {t.status === "DONE" ? (
                  <span className="badge badgeOk">DONE</span>
                ) : t.status === "IN_PROGRESS" ? (
                  <span className="badge badgeWarn">IN PROGRESS</span>
                ) : (
                  <span className="badge">OPEN</span>
                )}
              </td>

              <td>{new Date(t.createdAt).toLocaleString()}</td>

              <td>
                {t.resolvedAt ? (
                  new Date(t.resolvedAt).toLocaleString()
                ) : (
                  <span className="mutedText">—</span>
                )}
              </td>
            </tr>
          ))}

          {tickets.length === 0 && (
            <tr>
              <td colSpan={5} className="mutedText">
                No maintenance requests yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}