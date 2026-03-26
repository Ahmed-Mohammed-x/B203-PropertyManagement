import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role === "LANDLORD") redirect("/landlord/dashboard");
  redirect("/tenant/dashboard");
}