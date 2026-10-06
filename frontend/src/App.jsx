import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard     from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>

        {/* Top nav */}
        <nav style={{
          background: "#111827", height: 52,
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}>
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.4px" }}>
              Plan<span style={{ color: "#818cf8" }}>Forge</span>
            </span>
          </NavLink>

          <div style={{ width: 1, height: 18, background: "#374151" }} />

          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              color: isActive ? "#fff" : "#9ca3af",
            })}
          >
            Projects
          </NavLink>

          <span style={{ marginLeft: "auto", fontSize: 11, color: "#4b5563" }}>
            ReactJS · FastAPI · MongoDB
          </span>
        </nav>

        <Routes>
          <Route path="/"              element={<Dashboard />}     />
          <Route path="/project/:id"   element={<ProjectDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
