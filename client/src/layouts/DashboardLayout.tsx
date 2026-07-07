import React from "react";

interface Props {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: Props) => {
  return (
    <div className="dashboard-container" style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          background: "#1e1e1e",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Dashboard</h2>
        <nav style={{ marginTop: "20px" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><a href="/" style={{ color: "white" }}>Home</a></li>
            <li><a href="/servers" style={{ color: "white" }}>Servers</a></li>
            <li><a href="/settings" style={{ color: "white" }}>Settings</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: "#f5f5f5" }}>
        <header
          style={{
            background: "white",
            padding: "15px 25px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h1 style={{ margin: 0 }}>{title}</h1>
        </header>

        <div style={{ padding: "25px" }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

