namespace InventoryAPI.Models
{
    public class Sale
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public Product? Product { get; set; }

        public int Quantity { get; set; }

        public decimal TotalAmount { get; set; }   // ⭐ ADD THIS

        public DateTime Date { get; set; } = DateTime.Now;
    }
}
