import { useNavigate } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Menu,
  FileText,
} from "lucide-react";
import { useState } from "react";

function Layout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isMobile = window.innerWidth <= 768;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      {/* Mobile menu button */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            cursor: "pointer",
          }}
          onClick={() => setOpen(!open)}
        >
          <Menu size={28} />
        </div>
      )}

      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: "#fff",
          padding: "30px 20px",
          borderRight: "1px solid #e5e7eb",
          position: isMobile ? "fixed" : "relative",
          height: "100vh",
          left: isMobile ? (open ? "0" : "-260px") : "0",
          transition: "all 0.3s ease",
          zIndex: 999,
        }}
      >
        <h3 style={{ marginBottom: "40px", fontWeight: "700" }}>
          Inventory Pro
        </h3>

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
        )}

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/products")}>
            <Package size={18} /> Products
          </div>
        )}

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/categories")}>
            <FileText size={18} /> Categories
          </div>
        )}

        <div style={menuItem} onClick={() => handleNavigate("/sales")}>
          <ShoppingCart size={18} /> Sales
        </div>

        <div style={menuItem} onClick={() => handleNavigate("/invoices")}>
          <FileText size={18} /> Invoices
        </div>

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/purchases")}>
            <FileText size={18} /> Purchases
          </div>
        )}

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/suppliers")}>
            <FileText size={18} /> Suppliers
          </div>
        )}

        <div style={menuItem} onClick={() => handleNavigate("/customers")}>
          <FileText size={18} /> Customers
        </div>

        {role === "admin" && (
          <div style={menuItem} onClick={() => handleNavigate("/users")}>
            <FileText size={18} /> Users
          </div>
        )}

        <div style={{ ...menuItem, color: "#dc2626" }} onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: "40px",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  marginBottom: "8px",
};

export default Layout;
