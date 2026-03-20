import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCustomers(res.data.customers || []);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingId(null);
  };

  const saveCustomer = async () => {
    if (!name) {
      alert("Customer name required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:5001/api/auth/customers/${editingId}`,
          { name, phone, email, address },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Customer updated");
      } else {
        await axios.post(
          "http://127.0.0.1:5001/api/auth/customers",
          { name, phone, email, address },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Customer added");
      }

      resetForm();
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving customer");
    }
  };

  const editCustomer = (customer) => {
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email);
    setAddress(customer.address);
    setEditingId(customer.id);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    const token = localStorage.getItem("token");

    await axios.delete(`http://127.0.0.1:5001/api/auth/customers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCustomers();
  };

  return (
    <Layout>
      <h2 style={title}>Customers</h2>

      <div className="customer-layout">
        {/* FORM */}

        <div className="form-card">
          <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>

          <input
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
          />

          <button onClick={saveCustomer} className="btn">
            {editingId ? "Update Customer" : "Add Customer"}
          </button>

          {editingId && (
            <button onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>

        {/* TABLE */}

        <div>
          <h3 style={{ marginBottom: 20 }}>Customer List</h3>

          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{c.address}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => editCustomer(c)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteCustomer(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`

.customer-layout{
display:grid;
grid-template-columns:350px 1fr;
gap:40px;
}

.form-card{
background:white;
padding:25px;
border-radius:16px;
box-shadow:0 10px 30px rgba(0,0,0,0.05);
display:flex;
flex-direction:column;
gap:12px;
}

.input{
padding:12px;
border-radius:8px;
border:1px solid #e5e7eb;
}

.btn{
background:#4f46e5;
color:white;
padding:12px;
border:none;
border-radius:8px;
cursor:pointer;
}

.cancel-btn{
background:#9ca3af;
color:white;
padding:10px;
border:none;
border-radius:8px;
cursor:pointer;
}

.customer-table{
width:100%;
border-collapse:collapse;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 6px 20px rgba(0,0,0,0.05);
}

.customer-table th{
background:#f9fafb;
padding:12px;
text-align:left;
}

.customer-table td{
padding:12px;
border-top:1px solid #eee;
}

.edit-btn{
background:#4f46e5;
color:white;
border:none;
padding:6px 10px;
border-radius:6px;
cursor:pointer;
margin-right:6px;
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
    </Layout>
  );
}

const title = {
  fontSize: "30px",
  fontWeight: "700",
  marginBottom: "40px",
};

export default Customers;
