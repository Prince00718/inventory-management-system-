using InventoryAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetReport()
        {
            try
            {
                var totalProducts = await _context.Products.CountAsync();
                var totalCategories = await _context.Categories.CountAsync();
                var totalSales = await _context.Sales.CountAsync();
                var totalPurchases = await _context.Purchases.CountAsync();

                var totalRevenue =
                    await _context.Sales.SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

                // ✅ Correct purchase cost calculation
                var totalPurchaseCost =
                    await _context.Purchases.SumAsync(x => (decimal?)x.TotalCost) ?? 0;

                var profit = totalRevenue - totalPurchaseCost;

                return Ok(new
                {
                    totalProducts,
                    totalCategories,
                    totalSales,
                    totalPurchases,
                    totalRevenue,
                    totalPurchaseCost,
                    profit
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}