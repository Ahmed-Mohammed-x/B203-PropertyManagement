import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function TenantLayout({ children }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/unauthorized");

  return (
    <div className="container">
      <div className="nav">
        <Link href="/tenant/dashboard">Dashboard</Link>
        <Link href="/tenant/payments">Payments</Link>
        <Link href="/tenant/maintenance">Maintenance Status</Link>
        <Link href="/tenant/maintenance/new">New Maintenance</Link>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}