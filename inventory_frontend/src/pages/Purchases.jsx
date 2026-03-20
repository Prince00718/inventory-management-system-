import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Purchases() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState("");

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchPurchases();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts(res.data.products || []);
  };

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/suppliers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSuppliers(res.data.suppliers || []);
  };

  const fetchPurchases = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/purchases", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPurchaseHistory(res.data.purchases || []);
  };

  const addItem = () => {
    if (!selectedProduct || quantity <= 0 || !costPrice) {
      alert("Select product, quantity and cost price");
      return;
    }

    const product = products.find((p) => p.id == selectedProduct);

    const newItem = {
      product_id: Number(selectedProduct),
      name: product.name,
      quantity: Number(quantity),
      cost_price: Number(costPrice),
      subtotal: Number(quantity) * Number(costPrice),
    };

    setItems([...items, newItem]);

    setSelectedProduct("");
    setQuantity(1);
    setCostPrice("");
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const submitPurchase = async () => {
    if (!selectedSupplier) {
      alert("Select supplier");
      return;
    }

    if (items.length === 0) {
      alert("Add at least one item");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:5001/api/auth/purchase",
        {
          supplier_id: Number(selectedSupplier),
          items: items,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Purchase recorded successfully!");

      setItems([]);
      setSelectedSupplier("");

      fetchProducts();
      fetchPurchases();
    } catch (error) {
      alert(error.response?.data?.message || "Purchase failed");
    }
  };

  const downloadInvoice = async (id) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `http://127.0.0.1:5001/api/auth/purchase/${id}/invoice`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `purchase_${id}.pdf`);

    document.body.appendChild(link);
    link.click();
  };

  return (
    <Layout>
      <div style={{ width: "100%" }}>
        <h2 style={pageTitle}>Purchases</h2>

        <div className="purchase-layout">
          <div style={purchaseCard}>
            <h3>Add Purchase</h3>

            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select Supplier</option>

              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedProduct}
              onChange={(e) => {
                const productId = e.target.value;
                setSelectedProduct(productId);

                const product = products.find((p) => p.id == productId);

                if (product) {
                  setCostPrice(product.cost_price);
                }
              }}
              style={inputStyle}
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.quantity})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Cost Price"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              style={inputStyle}
            />

            <button onClick={addItem} style={addButton}>
              Add Item
            </button>
          </div>

          <div>
            <h3 style={{ marginBottom: 20 }}>Purchase Items</h3>

            {items.length === 0 ? (
              <div style={emptyStyle}>No items added</div>
            ) : (
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.cost_price}</td>
                      <td>₹{item.subtotal}</td>

                      <td>
                        <button
                          onClick={() => removeItem(index)}
                          style={deleteBtn}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={totalBox}>Total Amount: ₹{totalAmount}</div>

            <button onClick={submitPurchase} style={purchaseButton}>
              Complete Purchase
            </button>
          </div>
        </div>

        {/* PREMIUM PURCHASE HISTORY */}

        <h3 style={{ marginTop: 50 }}>Purchase History</h3>

        <div className="history-card">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Total</th>
                <th>Date</th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {purchaseHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No purchases found
                  </td>
                </tr>
              ) : (
                purchaseHistory.map((p) => (
                  <tr key={p.id}>
                    <td className="id-cell">#{p.id}</td>
                    <td>{p.supplier}</td>
                    <td className="amount-cell">₹{p.total}</td>
                    <td>{p.date}</td>

                    <td>
                      <button
                        className="invoice-btn"
                        onClick={() => downloadInvoice(p.id)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <style>{`

        .purchase-layout{
          display:grid;
          grid-template-columns:350px 1fr;
          gap:40px;
        }

        .purchase-table{
          width:100%;
          border-collapse:collapse;
          background:white;
          border-radius:10px;
          overflow:hidden;
          box-shadow:0 6px 20px rgba(0,0,0,0.05);
        }

        .purchase-table th{
          background:#f9fafb;
          padding:12px;
          text-align:left;
        }

        .purchase-table td{
          padding:12px;
          border-top:1px solid #eee;
        }

        .history-card{
          background:white;
          padding:25px;
          border-radius:16px;
          box-shadow:0 12px 35px rgba(0,0,0,0.06);
          margin-top:20px;
        }

        .history-table{
          width:100%;
          border-collapse:collapse;
        }

        .history-table th{
          padding:14px;
          background:#f8fafc;
          border-bottom:2px solid #e5e7eb;
        }

        .history-table td{
          padding:14px;
          border-bottom:1px solid #f1f5f9;
        }

        .history-table tbody tr:hover{
          background:#f3f4f6;
        }

        .id-cell{
          font-weight:600;
          color:#4f46e5;
        }

        .amount-cell{
          font-weight:600;
          color:#16a34a;
        }

        .invoice-btn{
          background:linear-gradient(135deg,#2563eb,#1d4ed8);
          color:white;
          border:none;
          padding:6px 12px;
          border-radius:8px;
          cursor:pointer;
        }

        .empty-row{
          text-align:center;
          padding:30px;
          color:#9ca3af;
        }

        @media(max-width:900px){
          .purchase-layout{
            grid-template-columns:1fr;
          }
        }

        `}</style>
      </div>
    </Layout>
  );
}

const pageTitle = {
  fontSize: "30px",
  fontWeight: "700",
  marginBottom: "40px",
};

const purchaseCard = {
  background: "#ffffff",
  padding: "25px",
  borderRadius: "18px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const addButton = {
  background: "#4f46e5",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const purchaseButton = {
  marginTop: "20px",
  background: "#16a34a",
  color: "white",
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const totalBox = {
  marginTop: "20px",
  fontWeight: "700",
  fontSize: "18px",
};

const emptyStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#9ca3af",
};

export default Purchases;
