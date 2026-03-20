namespace InventoryMVC.Models.ViewModels
{
    public class ReportVM
    {
        public long TotalProducts { get; set; }
        public long TotalCategories { get; set; }
        public long TotalSales { get; set; }
        public long TotalPurchases { get; set; }

        // ⭐ THESE WERE MISSING → caused your error
        public decimal TotalRevenue { get; set; }
        public decimal TotalPurchaseCost { get; set; }

        public decimal Profit { get; set; }
    }
}
