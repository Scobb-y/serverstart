import "./DashboardLayout.css";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">MC Dashboard</h2>

        <nav className="nav">
          <a href="#" className="nav-item">Servers</a>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <input className="search" placeholder="Search..." />
        </header>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}
