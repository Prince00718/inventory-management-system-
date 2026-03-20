namespace InventoryMVC.Models.ViewModels
{
    public class DashboardVM
    {
        public int TotalProducts { get; set; }
        public int TotalSales { get; set; }
        public int TotalPurchases { get; set; }
        public int LowStock { get; set; }

        public decimal Revenue { get; set; }
        public decimal PurchaseCost { get; set; }
        public decimal Profit { get; set; }
    }
}
