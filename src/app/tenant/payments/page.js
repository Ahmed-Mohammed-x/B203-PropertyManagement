import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TenantPaymentsPage() {
  const session = await auth();
  const tenantId = session.user.id;

  const payments = await prisma.payment.findMany({
    where: { tenantId },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <h2>My Payments</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid at</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.property?.name ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
              <td>{p.month}</td>
              <td>{p.amount}</td>
              <td>
                {p.status === "PAID" ? (
                  <span className="badge badgeOk">PAID</span>
                ) : (
                  <span className="badge badgeWarn">PENDING</span>
                )}
              </td>
              <td>{p.paidAt ? new Date(p.paidAt).toLocaleString() : <span style={{ color: "var(--muted)" }}>—</span>}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: "var(--muted)" }}>No payments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}