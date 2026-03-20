using InventoryAPI.Data;
using InventoryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchasesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchasesController(AppDbContext context)
        {
            _context = context;
        }

        // ================= GET ALL PURCHASES =================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Purchase>>> GetPurchases()
        {
            return await _context.Purchases
                .Include(p => p.Product)
                .OrderByDescending(p => p.Date)
                .ToListAsync();
        }

        // ================= GET PURCHASE BY ID =================
        [HttpGet("{id}")]
        public async Task<ActionResult<Purchase>> GetPurchase(int id)
        {
            var purchase = await _context.Purchases
                .Include(p => p.Product)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (purchase == null)
                return NotFound();

            return purchase;
        }

        // ================= CREATE PURCHASE =================
        [HttpPost]
public async Task<ActionResult<Purchase>> CreatePurchase(Purchase purchase)
{
    var product = await _context.Products.FindAsync(purchase.ProductId);

    if (product == null)
        return BadRequest("Product not found");

    // ✅ Set purchase date
    purchase.Date = DateTime.Now;

    // ✅ Calculate total cost
    purchase.TotalCost = purchase.Quantity * product.Price;

    // ✅ Increase stock
    product.Quantity += purchase.Quantity;

    _context.Purchases.Add(purchase);

    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetPurchase), new { id = purchase.Id }, purchase);
}

        // ================= DELETE PURCHASE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchase(int id)
        {
            var purchase = await _context.Purchases.FindAsync(id);

            if (purchase == null)
                return NotFound();

            var product = await _context.Products.FindAsync(purchase.ProductId);

            if (product != null)
                product.Quantity -= purchase.Quantity;

            _context.Purchases.Remove(purchase);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}