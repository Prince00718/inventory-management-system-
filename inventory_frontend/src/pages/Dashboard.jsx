import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Dashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("7");
  const [topProduct, setTopProduct] = useState(null);

  useEffect(() => {
    fetchData(period);
  }, [period]);

  useEffect(() => {
    fetchTopProduct();
  }, []);

  const fetchData = async (selectedPeriod) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://127.0.0.1:5001/api/auth/dashboard-stats?period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setData(res.data || { summary: {}, chart_data: [] });
    } catch (err) {
      console.error("Dashboard error:", err);
      setData({ summary: {}, chart_data: [] });
    }
  };

  const fetchTopProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:5001/api/auth/top-products",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.top_products.length > 0) {
        setTopProduct(res.data.top_products[0]);
      }
    } catch (err) {
      console.error("Top product error:", err);
    }
  };

  if (!data) {
    return (
      <Layout>
        <div style={{ padding: "40px" }}>Loading dashboard...</div>
      </Layout>
    );
  }

  const summary = data.summary || {};
  const chartData = data.chart_data || [];

  const chartConfig = {
    labels: chartData.map((item) => item.date || ""),
    datasets: [
      {
        label: "Revenue",
        data: chartData.map((item) => item.revenue || 0),
        backgroundColor: "#6366f1",
        borderRadius: 10,
        barThickness: 35,
      },
      {
        label: "Profit",
        data: chartData.map((item) => item.profit || 0),
        backgroundColor: chartData.map((item) =>
          item.profit >= 0 ? "#16a34a" : "#dc2626",
        ),
        borderRadius: 10,
        barThickness: 35,
      },
    ],
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Business Dashboard</h2>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        {/* KPI GRID */}
        <div className="kpi-grid">
          <StatCard title="Total Products" value={summary.total_products} />
          <StatCard title="Total Sales" value={summary.total_sales} />
          <StatCard
            title="Total Revenue"
            value={summary.total_revenue}
            isMoney
          />
          <StatCard title="Total Profit" value={summary.total_profit} isMoney />
          <StatCard
            title="Period Profit"
            value={summary.period_profit}
            isMoney
          />
          <StatCard
            title="Low Stock"
            value={summary.low_stock_count}
            isDanger
          />
        </div>

        {/* TOP PRODUCT */}
        {topProduct && (
          <div className="top-product-card">
            <h3 style={{ marginBottom: "15px" }}>🏆 Top Selling Product</h3>

            <h2 style={{ marginBottom: "10px" }}>{topProduct.product_name}</h2>

            <div className="top-stats">
              <div>
                <strong>Quantity Sold:</strong> {topProduct.total_quantity_sold}
              </div>
              <div>
                <strong>Revenue:</strong> ₹
                {topProduct.total_revenue.toLocaleString()}
              </div>
              <div>
                <strong>Profit:</strong>{" "}
                <span
                  style={{
                    color: topProduct.total_profit >= 0 ? "#16a34a" : "#dc2626",
                  }}
                >
                  ₹{topProduct.total_profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CHART */}
        <div className="chart-card">
          <h3 style={{ marginBottom: "25px" }}>Revenue vs Profit Trend</h3>

          {chartData.length > 0 ? (
            <Bar
              data={chartConfig}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <p>No data available</p>
          )}
        </div>

        {/* CSS */}
        <style>{`
          .dashboard-container {
            width: 100%;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }

          .period-select {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }

          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
            margin-bottom: 50px;
          }

          .top-product-card {
            background: linear-gradient(135deg, #a9aae2, #a6a2f0);
            color: #ffffff;
            padding: 35px;
            border-radius: 20px;
            margin-bottom: 50px;
            box-shadow: 0 20px 60px rgba(154, 150, 238, 0.3);
          }

          .top-stats {
            display: flex;
            gap: 40px;
            flex-wrap: wrap;
            font-size: 15px;
          }

          .chart-card {
            background: #ffffff;
            padding: 35px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          }

          @media (max-width: 1200px) {
            .kpi-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 992px) {
            .kpi-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 600px) {
            .dashboard-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 15px;
            }

            .kpi-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

/* STAT CARD */
function StatCard({ title, value = 0, isMoney, isDanger }) {
  const formattedValue = isMoney
    ? `₹${(value || 0).toLocaleString()}`
    : (value || 0).toLocaleString();

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "30px",
        borderRadius: "18px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.06)",
      }}
    >
      <h4 style={{ opacity: 0.6, marginBottom: "10px" }}>{title}</h4>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: isDanger ? "#dc2626" : "#111",
        }}
      >
        {formattedValue}
      </div>
    </div>
  );
}

export default Dashboard;
