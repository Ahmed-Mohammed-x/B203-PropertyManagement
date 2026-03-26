import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function LandlordLayout({ children }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/unauthorized");

  return (
    <div className="container">
      <div className="nav">
        <Link href="/landlord/dashboard">Dashboard</Link>
        <Link href="/landlord/properties">Properties</Link>
        <Link href="/landlord/tenants">Tenants</Link>
        <Link href="/landlord/payments">Payments</Link>
        <Link href="/landlord/maintenance">Maintenance</Link>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}