namespace InventoryMVC.Models.ViewModels
{
    public class SaleVM
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        // MUST exist because API returns product object
        public ProductVM? Product { get; set; }

        public int Quantity { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime Date { get; set; }
    }
}
