import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/api/auth/login",
        {
          email,
          password,
        },
      );

      // Save token
      localStorage.setItem("token", response.data.token);

      // Normalize role
      const role = (response.data.user.role || "").toLowerCase();
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/sales");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <div className="login-card">
        <h1>Inventory Pro</h1>
        <p>Login to your dashboard</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <style>{`

      .login-page{
      height:100vh;
      width:100vw;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#f3f4f6;
      overflow:hidden;
      font-family:Segoe UI;
      }

      .blob{
      position:absolute;
      width:400px;
      height:400px;
      border-radius:50%;
      filter:blur(120px);
      opacity:0.7;
      animation:float 12s infinite ease-in-out;
      }

      .blob1{
      background:#6366f1;
      top:-120px;
      left:-120px;
      }

      .blob2{
      background:#9333ea;
      bottom:-120px;
      right:-120px;
      animation-delay:5s;
      }

      @keyframes float{
      0%{transform:translateY(0)}
      50%{transform:translateY(40px)}
      100%{transform:translateY(0)}
      }

      .login-card{
      width:380px;
      padding:40px;
      border-radius:20px;
      background:rgba(255,255,255,0.25);
      backdrop-filter:blur(20px);
      box-shadow:0 20px 60px rgba(0,0,0,0.15);
      text-align:center;
      animation:fadeIn 0.6s ease;
      }

      @keyframes fadeIn{
      from{opacity:0; transform:translateY(20px)}
      to{opacity:1; transform:translateY(0)}
      }

      .login-card h1{
      margin-bottom:5px;
      }

      .login-card p{
      font-size:14px;
      color:#555;
      margin-bottom:30px;
      }

      .login-card input{
      width:100%;
      padding:14px;
      border-radius:10px;
      border:1px solid #e5e7eb;
      margin-bottom:16px;
      font-size:14px;
      outline:none;
      transition:0.2s;
      }

      .login-card input:focus{
      border-color:#6366f1;
      box-shadow:0 0 0 3px rgba(99,102,241,0.15);
      }

      .password-box{
      position:relative;
      }

      .password-box input{
      margin-bottom:0;
      }

      .eye{
      position:absolute;
      right:12px;
      top:50%;
      transform:translateY(-50%);
      cursor:pointer;
      color:#666;
      }

      .login-btn{
      width:100%;
      padding:14px;
      border:none;
      border-radius:12px;
      background:linear-gradient(135deg,#6366f1,#4f46e5);
      color:white;
      font-weight:600;
      cursor:pointer;
      margin-top:20px;
      transition:0.25s;
      }

      .login-btn:hover{
      transform:translateY(-2px);
      box-shadow:0 10px 25px rgba(0,0,0,0.2);
      }

      `}</style>
    </div>
  );
}

export default Login;
