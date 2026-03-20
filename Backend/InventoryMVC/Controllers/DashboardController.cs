using InventoryMVC.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

namespace InventoryMVC.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly HttpClient _http;

        public DashboardController(IHttpClientFactory factory)
        {
            _http = factory.CreateClient("api");
        }

        // Attach JWT token from session
        private void AttachToken()
        {
            var token = HttpContext.Session.GetString("JWToken");

            if (!string.IsNullOrEmpty(token))
            {
                _http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<IActionResult> Index()
        {
            AttachToken();

            var json = await _http.GetStringAsync("api/Reports");

            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            int GetInt(string name) =>
                root.TryGetProperty(name, out var p) && p.TryGetInt32(out var v) ? v : 0;

            decimal GetDecimal(string name) =>
                root.TryGetProperty(name, out var p) && p.TryGetDecimal(out var v) ? v : 0;

            var vm = new DashboardVM
            {
                TotalProducts = GetInt("totalProducts"),
                TotalSales = GetInt("totalSales"),
                TotalPurchases = GetInt("totalPurchases"),
                LowStock = GetInt("lowStock"),

                Revenue = GetDecimal("totalRevenue"),
                PurchaseCost = GetDecimal("totalPurchaseCost"),
                Profit = GetDecimal("profit")
            };

            return View(vm);
        }
    }
}