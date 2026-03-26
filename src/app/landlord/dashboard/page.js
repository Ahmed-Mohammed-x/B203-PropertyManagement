import { auth } from "@/lib/auth";

export default async function LandlordDashboard() {
  const session = await auth();

  return (
    <div className="card">
      <h2>Landlord Dashboard</h2>

      <p style={{ color: "var(--muted)" }}>
        Logged in as: {session?.user?.email || "Unknown"}
      </p>

      <p>
        Use the navigation to manage properties, tenants, payments, and maintenance.
      </p>
    </div>
  );
}