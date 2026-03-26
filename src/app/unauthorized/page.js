import Link from "next/link";

export default function unauthorized() {
  return (
    <div className="container">
      <div className="card">
        <h2>Unauthorized</h2>

        <p style={{ color: "var(--muted)" }}>
          You do not have permission to view this page.
        </p>

        <Link href="/">Go home</Link>
      </div>
    </div>
  );
}