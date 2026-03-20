import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);

  // FILTER STATES
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filteredSales, setFilteredSales] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSales();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [selectedProduct, quantity, products]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://127.0.0.1:5001/api/auth/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data.products || []);
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:5001/api/auth/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCustomers(res.data.customers || []);
  };

  const fetchSales = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://127.0.0.1:5001/api/auth/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSales(res.data.sales || []);
  };

  const calculateTotal = () => {
    const product = products.find((p) => p.id == selectedProduct);
    if (product) {
      setTotal(product.selling_price * quantity);
    } else {
      setTotal(0);
    }
  };

  const handleSale = async () => {
    if (!selectedCustomer || !selectedProduct || quantity <= 0) {
      alert("Select customer, product and valid quantity");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:5001/api/auth/sell",
        {
          customer_id: Number(selectedCustomer),
          product_id: Number(selectedProduct),
          quantity: Number(quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Sale completed successfully!");

      setQuantity(1);
      setSelectedProduct("");
      setSelectedCustomer("");

      fetchProducts();
      fetchSales();
    } catch (error) {
      alert(error.response?.data?.message || "Sale failed");
    }
  };

  /* ================= FILTER ================= */

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Select date range");
      return;
    }

    const filtered = sales.filter((sale) => {
      const saleDate = sale.created_at ? sale.created_at.split("T")[0] : "";

      const matchDate = saleDate >= startDate && saleDate <= endDate;

      const matchProduct = !filterProduct || sale.product_id == filterProduct;

      return matchDate && matchProduct;
    });

    setFilteredSales(filtered);
  };

  const resetFilter = () => {
    setFilteredSales(null);
    setStartDate("");
    setEndDate("");
    setFilterProduct("");
  };

  /* ================= EXPORT CSV ================= */

  const exportCSV = () => {
    const dataToExport = filteredSales ?? sales;

    if (!dataToExport.length) {
      alert("No sales data to export");
      return;
    }

    let csv = "Customer,Product,Quantity,Revenue,Profit,Date\n";

    dataToExport.forEach((sale) => {
      csv += `${sale.customer_name},${sale.product_name},${sale.quantity_sold},${sale.revenue},${sale.profit},${sale.created_at}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_report.csv";
    a.click();
  };

  /* ================= SUMMARY ================= */

  const today = new Date().toISOString().split("T")[0];

  const todaySales = sales.filter((sale) => sale.created_at?.includes(today));

  const todayRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.revenue || 0),
    0,
  );

  const todayProfit = todaySales.reduce(
    (sum, sale) => sum + Number(sale.profit || 0),
    0,
  );

  const lowStockCount = products.filter(
    (product) => product.quantity < 5,
  ).length;

  const displaySales = filteredSales ?? sales;

  return (
    <Layout>
      <div style={{ width: "100%" }}>
        <h2 style={pageTitle}>Sales</h2>

        {/* SUMMARY CARDS */}
        <div className="summary-grid">
          <div className="summary-card">
            <p>Today Revenue</p>
            <h3>₹{todayRevenue}</h3>
          </div>

          <div className="summary-card">
            <p>Today Profit</p>
            <h3
              style={{
                color: todayProfit >= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              ₹{todayProfit}
            </h3>
          </div>

          <div className="summary-card">
            <p>Total Sales</p>
            <h3>{sales.length}</h3>
          </div>

          <div className="summary-card">
            <p>Low Stock Items</p>
            <h3 style={{ color: "#dc2626" }}>{lowStockCount}</h3>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="sales-layout">
          {/* CREATE SALE */}
          <div style={saleCard}>
            <h3 style={{ marginBottom: "20px" }}>Create Sale</h3>

            {/* CUSTOMER SELECT */}
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select Customer</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
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
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
            />

            <div style={totalBox}>Total: ₹{total}</div>

            <button onClick={handleSale} style={sellButton}>
              Complete Sale
            </button>
          </div>

          {/* SALES SECTION */}
          <div>
            <h3 style={sectionTitle}>Recent Sales</h3>

            {/* SALES GRID */}
            <div className="sales-grid">
              {displaySales.length === 0 ? (
                <div style={emptyStyle}>No sales found</div>
              ) : (
                displaySales.map((sale, index) => (
                  <div
                    key={sale.sale_id}
                    className="sale-card"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >
                    <h4>{sale.product_name}</h4>

                    <div style={smallText}>Customer: {sale.customer_name}</div>

                    <div style={smallText}>Quantity: {sale.quantity_sold}</div>

                    <div style={smallText}>Revenue: ₹{sale.revenue}</div>

                    <div
                      className={
                        sale.profit >= 0 ? "profit-positive" : "profit-negative"
                      }
                    >
                      Profit: ₹{sale.profit}
                    </div>

                    <div style={dateText}>{sale.created_at}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <style>{`
.summary-grid {
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 25px;
margin-bottom: 50px;
}

.summary-card {
background: #ffffff;
padding: 25px;
border-radius: 18px;
box-shadow: 0 8px 25px rgba(0,0,0,0.05);
}

.sales-layout {
display: grid;
grid-template-columns: 350px 1fr;
gap: 40px;
align-items: start;
}

.sales-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 25px;
}

.sale-card {
background: #ffffff;
padding: 25px;
border-radius: 18px;
box-shadow: 0 8px 25px rgba(0,0,0,0.05);
border: 1px solid #f3f4f6;
animation: fadeInUp 0.4s ease forwards;
opacity: 0;
transform: translateY(10px);
transition: 0.3s ease;
}

.sale-card:hover {
transform: translateY(-6px);
box-shadow: 0 15px 40px rgba(0,0,0,0.1);
}

.profit-positive {
margin-top: 8px;
font-weight: 700;
color: #16a34a;
}

.profit-negative {
margin-top: 8px;
font-weight: 700;
color: #dc2626;
}

@keyframes fadeInUp {
to {
opacity: 1;
transform: translateY(0);
}
}
`}</style>
      </div>
    </Layout>
  );
}

const pageTitle = {
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "40px",
};

const sectionTitle = {
  marginBottom: "25px",
  fontSize: "22px",
  fontWeight: "600",
};

const saleCard = {
  background: "#ffffff",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
};

const totalBox = {
  background: "#f3f4f6",
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "600",
  textAlign: "center",
};

const sellButton = {
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "#fff",
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const smallText = {
  fontSize: "14px",
  marginBottom: "6px",
  color: "#374151",
};

const dateText = {
  marginTop: "10px",
  fontSize: "12px",
  color: "#9ca3af",
};

const emptyStyle = {
  padding: "40px",
  textAlign: "center",
  color: "#9ca3af",
};

export default Sales;
