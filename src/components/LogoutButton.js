"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    // Sign out without relying on NextAuth to navigate for us
    await signOut({ redirect: false });

    // Force a hard navigation so session + UI definitely reset
    window.location.href = "/login";
  }

  return (
    <button className="btn btnDanger" onClick={handleLogout}>
      Logout
    </button>
  );
}