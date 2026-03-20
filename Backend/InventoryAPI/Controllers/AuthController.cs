using InventoryAPI.Data;
using InventoryAPI.DTOs;
using InventoryAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]   // 🔓 LOGIN & REGISTER MUST BE PUBLIC
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            // 1️⃣ Validate user
            var user = _context.Users
                .FirstOrDefault(u => u.Username == dto.Username && u.Password == dto.Password);

            if (user == null)
                return Unauthorized("Invalid credentials");

            // 2️⃣ Read JWT key safely
            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
                return StatusCode(500, "JWT Key is missing in appsettings.json");

            // 3️⃣ Create claims
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // 4️⃣ Create token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            // 5️⃣ Return token
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                role = user.Role
            });
        }
    }
}
