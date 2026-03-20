using InventoryMVC.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace InventoryMVC.Controllers
{
    [Authorize]
    public class CategoriesController : Controller
    {
        private readonly HttpClient _http;

        public CategoriesController(IHttpClientFactory factory)
        {
            _http = factory.CreateClient("api");
        }

        // ===== Helper method to attach JWT token =====
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

            var categories = await _http.GetFromJsonAsync<List<CategoryVM>>("api/Categories");

            return View(categories ?? new List<CategoryVM>());
        }

        // ===== CREATE GET =====
        [HttpGet]
        public IActionResult Create()
        {
            return View(new CategoryVM());
        }

        // ===== CREATE POST =====
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CategoryVM vm)
        {
            if (!ModelState.IsValid)
                return View(vm);

            AttachToken();

            var res = await _http.PostAsJsonAsync("api/Categories", vm);

            if (res.IsSuccessStatusCode)
                return RedirectToAction("Index");

            ModelState.AddModelError("", "Failed to create category");
            return View(vm);
        }
    }
}