import { auth } from "@/lib/auth";

export default async function TenantDashboard() {
  const session = await auth();

  return (
    <div className="card">
      <h2>Tenant Dashboard</h2>
      <p className="mutedText">
        Logged in as: {session?.user?.email || "Unknown"}
      </p>
      <p>Use the navigation to see payments and submit maintenance requests.</p>
    </div>
  );
}