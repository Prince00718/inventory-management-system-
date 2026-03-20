using InventoryMVC.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace InventoryMVC.Controllers
{
    [Authorize]
    public class SalesController : Controller
    {
        private readonly HttpClient _http;

        public SalesController(IHttpClientFactory factory)
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

        // ===== INDEX =====
        public async Task<IActionResult> Index()
        {
            AttachToken();

            var sales = await _http.GetFromJsonAsync<List<SaleVM>>("api/Sales");
            return View(sales ?? new List<SaleVM>());
        }

        // ===== CREATE GET =====
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            AttachToken();

            var products = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");
            ViewBag.Products = products ?? new List<ProductVM>();

            return View(new SaleVM());
        }

        // ===== CREATE POST =====
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(SaleVM vm)
        {
            if (!ModelState.IsValid)
            {
                AttachToken();

                var products = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");
                ViewBag.Products = products ?? new List<ProductVM>();

                return View(vm);
            }

            AttachToken();

            var res = await _http.PostAsJsonAsync("api/Sales", vm);

            if (res.IsSuccessStatusCode)
                return RedirectToAction("Index");

            ModelState.AddModelError("", "Failed to create sale");

            var prods = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");
            ViewBag.Products = prods ?? new List<ProductVM>();

            return View(vm);
        }
    }
}