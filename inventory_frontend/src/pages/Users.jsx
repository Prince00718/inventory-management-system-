import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Users() {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data.users || []);
  };

  const addUser = async () => {
    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:5001/api/auth/users",
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("User created");

      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");

      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    const token = localStorage.getItem("token");

    await axios.delete(`http://127.0.0.1:5001/api/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();
  };

  return (
    <Layout>
      <h2 style={title}>Users</h2>

      <div className="user-layout">
        <div className="form-card">
          <h3>Add User</h3>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          <button onClick={addUser}>Create User</button>
        </div>

        <div>
          <h3>User List</h3>

          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(u.id)}
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

.user-layout{
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

.form-card input,
.form-card select{
padding:12px;
border-radius:8px;
border:1px solid #e5e7eb;
}

.form-card button{
background:#4f46e5;
color:white;
padding:12px;
border:none;
border-radius:8px;
cursor:pointer;
}

.user-table{
width:100%;
border-collapse:collapse;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 6px 20px rgba(0,0,0,0.05);
}

.user-table th{
background:#f9fafb;
padding:12px;
text-align:left;
}

.user-table td{
padding:12px;
border-top:1px solid #eee;
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

export default Users;
