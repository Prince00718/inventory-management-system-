import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://127.0.0.1:5001/api/auth/activity-logs",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setLogs(res.data.logs || []);
  };

  return (
    <Layout>
      <h2 style={title}>Activity Logs</h2>

      <table className="log-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.user}</td>
              <td>{log.action}</td>
              <td>{log.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`

.log-table{
width:100%;
border-collapse:collapse;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 6px 20px rgba(0,0,0,0.05);
}

.log-table th{
background:#f9fafb;
padding:12px;
text-align:left;
}

.log-table td{
padding:12px;
border-top:1px solid #eee;
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

export default ActivityLogs;
