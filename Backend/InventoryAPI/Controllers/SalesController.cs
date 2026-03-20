using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryAPI.Data;
using InventoryAPI.Models;

namespace InventoryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/sales
        [HttpGet]
        public async Task<IActionResult> GetSales()
        {
            var sales = await _context.Sales
                .Include(s => s.Product)
                .OrderByDescending(s => s.Date)
                .ToListAsync();

            return Ok(sales);
        }

        // POST: api/sales
        [HttpPost]
        public async Task<IActionResult> CreateSale(Sale sale)
        {
            var product = await _context.Products.FindAsync(sale.ProductId);

            if (product == null)
                return BadRequest("Product not found");

            if (product.Quantity < sale.Quantity)
                return BadRequest("Not enough stock");

            // deduct stock
            product.Quantity -= sale.Quantity;

            // calculate total
            sale.TotalAmount = product.Price * sale.Quantity;
            sale.Date = DateTime.Now;

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();

            return Ok(sale);
        }

        // DELETE: api/sales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            var sale = await _context.Sales.FindAsync(id);

            if (sale == null)
                return NotFound();

            _context.Sales.Remove(sale);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
