import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    selling_price: "",
    cost_price: "",
    quantity: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts(res.data.products);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCategories(res.data.categories);
  };

  const handleSaveProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const form = new FormData();

      form.append("name", formData.name);
      form.append("sku", formData.sku);
      form.append("category_id", formData.category_id);
      form.append("selling_price", formData.selling_price);
      form.append("cost_price", formData.cost_price);
      form.append("quantity", formData.quantity);

      if (image) form.append("image", image);

      if (editMode) {
        await axios.put(
          `http://127.0.0.1:5001/api/auth/update-product/${editId}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        await axios.post("http://127.0.0.1:5001/api/auth/add-product", form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      resetModal();
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert("Product save failed");
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setEditId(product.id);

    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      selling_price: product.selling_price,
      cost_price: product.cost_price,
      quantity: product.quantity,
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:5001/api/auth/delete-product/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
    setImage(null);

    setFormData({
      name: "",
      sku: "",
      category_id: "",
      selling_price: "",
      cost_price: "",
      quantity: "",
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Layout>
      <div className="page">
        <div className="header">
          <h2>Products</h2>

          <button className="addBtn" onClick={() => setShowModal(true)}>
            + Add Product
          </button>
        </div>

        <input
          className="search"
          placeholder="Search product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="imgBox">
                <img
                  src={
                    product.image
                      ? `http://127.0.0.1:5001/uploads/${product.image}`
                      : "https://via.placeholder.com/200"
                  }
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200";
                  }}
                />
              </div>

              <div className="info">
                <h3>{product.name}</h3>

                <p className="sku">SKU: {product.sku}</p>

                <p className="price">₹{product.selling_price}</p>

                <p
                  className="stock"
                  style={{
                    color: product.quantity < 5 ? "#dc2626" : "#16a34a",
                  }}
                >
                  Stock: {product.quantity}
                </p>

                <div className="buttons">
                  <button className="edit" onClick={() => handleEdit(product)}>
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="overlay">
          <div className="modal">
            <h3>{editMode ? "Edit Product" : "Add Product"}</h3>

            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Selling Price"
              value={formData.selling_price}
              onChange={(e) =>
                setFormData({ ...formData, selling_price: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Cost Price"
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({ ...formData, cost_price: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />

            <input type="file" onChange={(e) => setImage(e.target.files[0])} />

            <div className="modalBtns">
              <button className="save" onClick={handleSaveProduct}>
                Save
              </button>

              <button className="cancel" onClick={resetModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`

.page{
width:100%;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:30px;
}

.search{
width:100%;
padding:14px;
border-radius:10px;
border:1px solid #e5e7eb;
margin-bottom:30px;
}

.addBtn{
background:#4f46e5;
color:white;
border:none;
padding:12px 20px;
border-radius:10px;
cursor:pointer;
}

.grid{
display:grid;
grid-template-columns:repeat(3, 320px);
gap:30px;
justify-content:flex-start;
}

.card{
background:white;
border-radius:16px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.05);
}


.imgBox{
height:200px;
display:flex;
align-items:center;
justify-content:center;
background:#f9fafb;
}

.imgBox img{
max-width:100%;
max-height:160px;
object-fit:contain;
}

.info{
padding:20px;
}

.price{
font-weight:700;
color:#4f46e5;
}

.buttons{
display:flex;
gap:10px;
margin-top:15px;
}

.edit{
flex:1;
background:#111827;
color:white;
border:none;
padding:10px;
border-radius:8px;
}

.delete{
flex:1;
background:#ef4444;
color:white;
border:none;
padding:10px;
border-radius:8px;
}

.overlay{
position:fixed;
top:0;
left:0;
width:100vw;
height:100vh;
background:rgba(0,0,0,0.2);
display:flex;
align-items:center;
justify-content:center;
z-index:9999;
}

.modal{
background:white;
width:450px;
padding:30px;
border-radius:16px;
display:flex;
flex-direction:column;
gap:12px;
}

.modal input,
.modal select{
padding:10px;
border-radius:8px;
border:1px solid #e5e7eb;
}

.modalBtns{
display:flex;
gap:10px;
margin-top:10px;
}

.save{
flex:1;
background:#4f46e5;
color:white;
border:none;
padding:10px;
border-radius:8px;
}

.cancel{
flex:1;
background:#e5e7eb;
border:none;
padding:10px;
border-radius:8px;
}

`}</style>
    </Layout>
  );
}

export default Products;
