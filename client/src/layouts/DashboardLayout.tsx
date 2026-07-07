import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>ServerStart</h2>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/servers">Servers</Link>
        </nav>
      </aside>

      <main className="content">
        <header className="header">
          <h1>{title}</h1>
        </header>
        <section className="body">{children}</section>
      </main>
    </div>
  );
}
