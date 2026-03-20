import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCategories(res.data.categories || []);
  };

  const addCategory = async () => {
    if (!name) {
      alert("Enter category name");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:5001/api/auth/add-category",
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Category added");

      setName("");
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding category");
    }
  };

  return (
    <Layout>
      <div style={{ width: "100%" }}>
        <h2 style={title}>Categories</h2>

        <div className="category-layout">
          {/* ADD CATEGORY */}

          <div className="form-card">
            <h3>Add Category</h3>

            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />

            <button onClick={addCategory} className="btn">
              Add Category
            </button>
          </div>

          {/* CATEGORY LIST */}

          <div>
            <h3 style={{ marginBottom: 20 }}>Category List</h3>

            <table className="category-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Total Products</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>

                    <td style={{ fontWeight: "600" }}>{c.name}</td>

                    <td style={{ color: "#6b7280" }}>
                      {c.products && c.products.length > 0
                        ? c.products.join(", ")
                        : "No products"}
                    </td>

                    <td>
                      <span className="count-badge">
                        {c.total_products || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`

      .category-layout{
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
        font-weight:600;
      }

      .category-table{
        width:100%;
        border-collapse:collapse;
        background:white;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 6px 20px rgba(0,0,0,0.05);
      }

      .category-table th{
        background:#f9fafb;
        padding:14px;
        text-align:left;
        border-bottom:1px solid #eee;
      }

      .category-table td{
        padding:14px;
        border-top:1px solid #eee;
      }

      .category-table tbody tr:hover{
        background:#f3f4f6;
      }

      .count-badge{
        background:#eef2ff;
        color:#4338ca;
        padding:4px 10px;
        border-radius:6px;
        font-weight:600;
        font-size:13px;
      }

      @media(max-width:900px){

        .category-layout{
          grid-template-columns:1fr;
        }

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

export default Categories;
