using InventoryMVC.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace InventoryMVC.Controllers
{
    [Authorize]
    public class PurchasesController : Controller
    {
        private readonly HttpClient _http;

        public PurchasesController(IHttpClientFactory factory)
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

        // ================= INDEX =================
        public async Task<IActionResult> Index()
        {
            AttachToken();

            var data = await _http.GetFromJsonAsync<List<PurchaseVM>>("api/Purchases");

            return View(data ?? new List<PurchaseVM>());
        }

        // ================= CREATE GET =================
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            AttachToken();

            var products = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");

            ViewBag.Products = products ?? new List<ProductVM>();

            return View(new PurchaseVM());
        }

        // ================= CREATE POST =================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(PurchaseVM vm)
        {
            if (!ModelState.IsValid)
            {
                AttachToken();

                var products = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");
                ViewBag.Products = products ?? new List<ProductVM>();

                return View(vm);
            }

            AttachToken();

            var res = await _http.PostAsJsonAsync("api/Purchases", vm);

            if (res.IsSuccessStatusCode)
                return RedirectToAction("Index");

            ModelState.AddModelError("", "Failed to create purchase");

            var prods = await _http.GetFromJsonAsync<List<ProductVM>>("api/Products");
            ViewBag.Products = prods ?? new List<ProductVM>();

            return View(vm);
        }
    }
}