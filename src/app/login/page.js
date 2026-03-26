"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const sp = useSearchParams();

  const registered = sp.get("registered"); // "1" if coming from registration
  const urlError = sp.get("error"); // e.g. "CredentialsSignin"
  const callbackUrl = sp.get("callbackUrl") || "/";
  const emailFromUrl = sp.get("email") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email if provided via URL (e.g., after registration)
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const urlErrorMap = {
    CredentialsSignin: "Invalid email or password.",
  };

  const displayError =
    localError || (urlError ? urlErrorMap[urlError] || "Login failed." : "");

  async function onSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!res) {
      setLocalError("Something went wrong. Try again.");
      return;
    }

    if (res.error) {
      setLocalError("Invalid email or password.");
      return;
    }

    window.location.href = res.url || "/";
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
        <h2>Login</h2>

        {registered ? (
          <p className="successText">
            Account created successfully. You can now log in.
          </p>
        ) : null}

        {displayError ? <p className="errorText">{displayError}</p> : null}

        <p className="mutedText">
          Landlord: landlord@test.com / landlord123
          <br />
          Tenant: tenant@test.com / tenant123
        </p>

        <form onSubmit={onSubmit}>
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div className="spacer10" />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="spacer14" />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="spacer14" />

        <Link href="/register/landlord">Register as landlord</Link>
      </div>
    </div>
  );
}