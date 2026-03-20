using InventoryAPI.Data;
using InventoryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuppliersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Suppliers
        [HttpPost]
        public async Task<IActionResult> CreateSupplier(Supplier supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.Name))
                return BadRequest("Supplier name is required");

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return Ok(supplier);
        }

        // GET: api/Suppliers
        [HttpGet]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            return Ok(suppliers);
        }
    }
}
