import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export default async function LandlordRegisterPage({ searchParams }) {
  // Next.js 16: searchParams can be a Promise
  const sp = await searchParams;
  const error = sp?.error;

  const errorMap = {
    missing: "Please fill in all fields.",
    short: "Password must be at least 6 characters.",
    mismatch: "Passwords do not match.",
    exists: "An account with this email already exists.",
  };

  async function register(formData) {
    "use server";

    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (!email || !password || !confirm) redirect("/register/landlord?error=missing");
    if (password.length < 6) redirect("/register/landlord?error=short");
    if (password !== confirm) redirect("/register/landlord?error=mismatch");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) redirect("/register/landlord?error=exists");

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "LANDLORD",
      },
    });

    redirect(`/login?email=${encodeURIComponent(email)}&registered=1`);
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h2>Register as Landlord</h2>

        <p className="mutedText">
          Create a landlord account to manage properties and tenants.
        </p>

        {error ? (
          <p className="errorText">{errorMap[error] || "Something went wrong."}</p>
        ) : null}

        <form action={register}>
          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            type="email"
            placeholder="landlord@example.com"
            required
          />

          <div className="spacer10" />

          <label className="label">Password (min 6 chars)</label>
          <input className="input" name="password" type="password" required />

          <div className="spacer10" />

          <label className="label">Confirm password</label>
          <input className="input" name="confirm" type="password" required />

          <div className="spacer14" />

          <button className="btn" type="submit">
            Create account
          </button>
        </form>

        <div className="spacer14" />

        <Link href="/login">Back to login</Link>
      </div>
    </div>
  );
}