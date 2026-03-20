using InventoryAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]   // 🔐 ADMIN ONLY
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();
            var totalSuppliers = await _context.Suppliers.CountAsync();
            var totalCustomers = await _context.Customers.CountAsync();
            var totalStock = await _context.Products.SumAsync(p => p.Quantity);
            var totalPurchases = await _context.Purchases.CountAsync();
            var totalSales = await _context.Sales.CountAsync();

            return Ok(new
            {
                totalProducts,
                totalCategories,
                totalSuppliers,
                totalCustomers,
                totalStock,
                totalPurchases,
                totalSales
            });
        }
    }
}
