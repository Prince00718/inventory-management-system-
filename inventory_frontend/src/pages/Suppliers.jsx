import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [supplierPurchases, setSupplierPurchases] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/suppliers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSuppliers(res.data.suppliers || []);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingId(null);
  };

  const saveSupplier = async () => {
    if (!name) {
      alert("Supplier name required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:5001/api/auth/suppliers/${editingId}`,
          { name, phone, email, address },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Supplier updated");
      } else {
        await axios.post(
          "http://127.0.0.1:5001/api/auth/suppliers",
          { name, phone, email, address },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Supplier added");
      }

      resetForm();
      fetchSuppliers();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving supplier");
    }
  };

  const editSupplier = (supplier) => {
    setName(supplier.name);
    setPhone(supplier.phone);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setEditingId(supplier.id);
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://127.0.0.1:5001/api/auth/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Supplier deleted");
      fetchSuppliers();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const viewPurchases = async (id) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://127.0.0.1:5001/api/auth/suppliers/${id}/purchases`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setSupplierPurchases(res.data.purchases || []);
    setSelectedSupplier(id);
  };

  return (
    <Layout>
      <div style={{ width: "100%" }}>
        <h2 style={title}>Suppliers</h2>

        <div className="supplier-layout">
          {/* FORM */}

          <div style={formCard}>
            <h3>{editingId ? "Edit Supplier" : "Add Supplier"}</h3>

            <input
              placeholder="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={input}
            />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={input}
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />

            <textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={input}
            />

            <button onClick={saveSupplier} style={button}>
              {editingId ? "Update Supplier" : "Add Supplier"}
            </button>

            {editingId && (
              <button onClick={resetForm} style={cancelButton}>
                Cancel
              </button>
            )}
          </div>

          {/* SUPPLIER LIST */}

          <div>
            <h3 style={{ marginBottom: 20 }}>Supplier List</h3>

            <div className="supplier-table-container">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td className="supplier-name">{s.name}</td>
                      <td>{s.phone}</td>
                      <td>{s.email}</td>
                      <td className="address-cell">{s.address}</td>

                      <td className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => viewPurchases(s.id)}
                        >
                          Purchases
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() => editSupplier(s)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteSupplier(s.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PURCHASE HISTORY */}

            {selectedSupplier && (
              <div style={{ marginTop: 40 }}>
                <h3>Supplier Purchase History</h3>

                <table className="supplier-table">
                  <thead>
                    <tr>
                      <th>Purchase ID</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {supplierPurchases.map((p) => (
                      <tr key={p.purchase_id}>
                        <td>{p.purchase_id}</td>
                        <td>₹{p.total}</td>
                        <td>{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <style>{`
        .supplier-layout{
          display:grid;
          grid-template-columns:350px 1fr;
          gap:40px;
        }

        .supplier-table-container{
          background:white;
          border-radius:16px;
          padding:20px;
          box-shadow:0 10px 40px rgba(0,0,0,0.06);
        }

        .supplier-table{
          width:100%;
          border-collapse:collapse;
        }

        .supplier-table th{
          padding:16px;
          background:#f9fafb;
          border-bottom:1px solid #e5e7eb;
        }

        .supplier-table td{
          padding:16px;
          border-bottom:1px solid #f1f5f9;
        }

        .supplier-name{
          font-weight:600;
        }

        .action-buttons{
          display:flex;
          gap:8px;
        }

        .view-btn{
          background:#16a34a;
          color:white;
          border:none;
          padding:6px 10px;
          border-radius:6px;
          cursor:pointer;
        }

        .edit-btn{
          background:#4f46e5;
          color:white;
          border:none;
          padding:6px 10px;
          border-radius:6px;
          cursor:pointer;
        }

        .delete-btn{
          background:#dc2626;
          color:white;
          border:none;
          padding:6px 10px;
          border-radius:6px;
          cursor:pointer;
        }

        `}</style>
      </div>
    </Layout>
  );
}

const title = {
  fontSize: "30px",
  fontWeight: "700",
  marginBottom: "40px",
};

const formCard = {
  background: "#ffffff",
  padding: "25px",
  borderRadius: "18px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const button = {
  background: "#4f46e5",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const cancelButton = {
  background: "#9ca3af",
  color: "white",
  padding: "10px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

export default Suppliers;
