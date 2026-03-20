import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Invoices() {
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSales();
    fetchInvoices();
  }, []);

  const fetchSales = async () => {
    const res = await axios.get("http://127.0.0.1:5001/api/auth/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSales(res.data.sales || []);
  };

  const fetchInvoices = async () => {
    const res = await axios.get("http://127.0.0.1:5001/api/auth/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInvoices(res.data.invoices || []);
  };

  const generateInvoice = async (saleId) => {
    try {
      await axios.post(
        `http://127.0.0.1:5001/api/auth/generate-invoice/${saleId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Invoice generated successfully");
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Error generating invoice");
    }
  };

  const viewInvoice = async (invoiceId) => {
    const res = await axios.get(
      `http://127.0.0.1:5001/api/auth/invoice/${invoiceId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setSelectedInvoice(res.data);
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="invoice-page">
        {/* LEFT SIDE - SALES */}
        <div className="sales-section">
          <h2>Generate Invoice</h2>

          <div className="card-grid">
            {sales.map((sale) => (
              <div key={sale.sale_id} className="card">
                <h4>{sale.product_name}</h4>
                <p>Qty: {sale.quantity_sold}</p>
                <p>Revenue: ₹{sale.revenue}</p>
                <p>Profit: ₹{sale.profit}</p>

                <button onClick={() => generateInvoice(sale.sale_id)}>
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - INVOICES */}
        <div className="invoice-section">
          <h2>Generated Invoices</h2>

          {invoices.length === 0 ? (
            <p>No invoices yet</p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.invoice_id} className="invoice-card">
                <div>
                  <strong>{inv.invoice_number}</strong>
                  <p>₹{inv.total_amount}</p>
                </div>
                <button onClick={() => viewInvoice(inv.invoice_id)}>
                  View
                </button>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}
        {selectedInvoice && (
          <div className="modal-overlay">
            <div className="invoice-modal">
              <div className="invoice-header">
                <h2>INVOICE</h2>
                <div>
                  <strong>{selectedInvoice.invoice_number}</strong>
                  <p>{selectedInvoice.created_at}</p>
                </div>
              </div>

              <hr />

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unit_price}</td>
                      <td>₹{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-total">
                <h3>Total: ₹{selectedInvoice.total_amount}</h3>
              </div>

              <div className="invoice-buttons">
                <button onClick={printInvoice}>Download / Print</button>
                <button onClick={closeInvoice} className="close-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSS */}
        <style>{`
          .invoice-page {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
          }

          .card-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .card {
            background: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.05);
          }

          .card button {
            margin-top: 10px;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
          }

          .invoice-card {
            background: white;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          }

          .invoice-card button {
            background: #111827;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
          }

          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .invoice-modal {
            background: white;
            width: 700px;
            padding: 40px;
            border-radius: 12px;
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .invoice-table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
          }

          .invoice-table th,
          .invoice-table td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
          }

          .invoice-total {
            margin-top: 20px;
            text-align: right;
          }

          .invoice-buttons {
            margin-top: 25px;
            display: flex;
            gap: 10px;
          }

          .invoice-buttons button {
            padding: 8px 14px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            background: #4f46e5;
            color: white;
          }

          .close-btn {
            background: #dc2626;
          }

          @media (max-width: 992px) {
            .invoice-page {
              grid-template-columns: 1fr;
            }

            .card-grid {
              grid-template-columns: 1fr;
            }
          }

          @media print {
            body * {
              visibility: hidden;
            }

            .invoice-modal, .invoice-modal * {
              visibility: visible;
            }

            .invoice-modal {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export default Invoices;
