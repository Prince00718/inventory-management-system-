using InventoryAPI.Models;   // ⭐ ADD THIS

namespace InventoryAPI.Models
{
    public class Purchase
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public Product? Product { get; set; }   // navigation property

        public int Quantity { get; set; }

        public decimal TotalCost { get; set; }

        public DateTime Date { get; set; }
    }
}
