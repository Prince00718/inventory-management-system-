namespace InventoryMVC.Models.ViewModels
{
    public class PurchaseVM
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        // ⭐ REQUIRED so view can show Product Name
        public ProductVM? Product { get; set; }

        public int Quantity { get; set; }

        public DateTime Date { get; set; }
    }
}
