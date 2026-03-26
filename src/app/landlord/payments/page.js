import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function LandlordPaymentsPage() {
  const session = await auth();
  const landlordId = session.user.id;

  const tenants = await prisma.tenantProfile.findMany({
    where: { landlordId },
    include: { user: true, property: true },
  });

  async function createPayment(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const tenantId = String(formData.get("tenantId"));
    const month = String(formData.get("month") || "").trim();
    const amount = Number(formData.get("amount") || 0);

    const tp = await prisma.tenantProfile.findFirst({
      where: { landlordId, userId: tenantId },
    });
    if (!tp) return;

    await prisma.payment.create({
      data: {
        tenantId,
        landlordId,
        propertyId: tp.propertyId,
        month,
        amount,
        status: "PENDING",
      },
    });

    revalidatePath("/landlord/payments");
  }

  async function markPaid(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const id = String(formData.get("id"));

    const payment = await prisma.payment.findFirst({ where: { id, landlordId } });
    if (!payment) return;

    await prisma.payment.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
    revalidatePath("/landlord/payments");
  }

  async function markPending(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const id = String(formData.get("id"));

    const payment = await prisma.payment.findFirst({ where: { id, landlordId } });
    if (!payment) return;

    await prisma.payment.update({ where: { id }, data: { status: "PENDING", paidAt: null } });
    revalidatePath("/landlord/payments");
  }

  async function deletePayment(formData) {
    "use server";

    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") return;

    const landlordId = session.user.id;
    const id = String(formData.get("id"));

    const payment = await prisma.payment.findFirst({ where: { id, landlordId } });
    if (!payment) return;

    await prisma.payment.delete({ where: { id } });
    revalidatePath("/landlord/payments");
  }

  const payments = await prisma.payment.findMany({
    where: { landlordId },
    include: { tenant: true, property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <h2>Payments</h2>

      <form action={createPayment} style={{ marginBottom: 16 }}>
        <div className="row">
          <div style={{ flex: 2, minWidth: 240 }}>
            <label className="label">Tenant</label>
            <select className="select" name="tenantId" defaultValue="">
              <option value="" disabled>Select tenant</option>
              {tenants.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.user.email}{t.property ? ` — ${t.property.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label">Month (YYYY-MM)</label>
            <input className="input" name="month" placeholder="2026-07" />
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label">Amount</label>
            <input className="input" name="amount" type="number" placeholder="1200" />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn" type="submit">Create</button>
          </div>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Property</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid at</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.tenant.email}</td>
              <td>{p.property?.name ?? <span className="mutedText">—</span>}</td>
              <td>{p.month}</td>
              <td>{p.amount}</td>
              <td>
                {p.status === "PAID" ? <span className="badge badgeOk">PAID</span> : <span className="badge badgeWarn">PENDING</span>}
              </td>
              <td>{p.paidAt ? new Date(p.paidAt).toLocaleString() : <span className="mutedText">—</span>}</td>
              <td>
                <div className="row">
                  <form action={markPaid}><input type="hidden" name="id" value={p.id} /><button className="btn" type="submit">Mark Paid</button></form>
                  <form action={markPending}><input type="hidden" name="id" value={p.id} /><button className="btn" type="submit">Mark Pending</button></form>
                  <form action={deletePayment}><input type="hidden" name="id" value={p.id} /><button className="btn btnDanger" type="submit">Delete</button></form>
                </div>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={7} className="mutedText">No payments yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}