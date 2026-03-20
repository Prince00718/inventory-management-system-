using ClosedXML.Excel;
using InventoryMVC.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net.Http.Headers;
using System.Text.Json;

namespace InventoryMVC.Controllers
{
    [Authorize]
    public class ReportsController : Controller
    {
        private readonly HttpClient _http;

        public ReportsController(IHttpClientFactory factory)
        {
            _http = factory.CreateClient("api");
        }

        // Attach JWT token
        private void AttachToken()
        {
            var token = HttpContext.Session.GetString("JWToken");

            if (!string.IsNullOrEmpty(token))
            {
                _http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);
            }
        }

        private async Task<ReportVM> GetReportData()
        {
            AttachToken();

            var json = await _http.GetStringAsync("api/Reports");

            var root = JsonDocument.Parse(json).RootElement;

            long GetLong(string n) =>
                root.TryGetProperty(n, out var p) && p.TryGetInt64(out var v) ? v : 0;

            decimal GetDecimal(string n) =>
                root.TryGetProperty(n, out var p) && p.TryGetDecimal(out var v) ? v : 0;

            return new ReportVM
            {
                TotalProducts = GetLong("totalProducts"),
                TotalCategories = GetLong("totalCategories"),
                TotalSales = GetLong("totalSales"),
                TotalPurchases = GetLong("totalPurchases"),
                TotalRevenue = GetDecimal("totalRevenue"),
                TotalPurchaseCost = GetDecimal("totalPurchaseCost"),
                Profit = GetDecimal("profit")
            };
        }

        // ================= REPORT PAGE =================
        public async Task<IActionResult> Index()
        {
            var vm = await GetReportData();
            return View(vm);
        }

        // ================= PDF EXPORT =================
        public async Task<IActionResult> ExportPdf()
        {
            var data = await GetReportData();

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);

                    page.Header().Text("Inventory Report")
                        .FontSize(22)
                        .Bold()
                        .AlignCenter();

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn();
                            c.RelativeColumn();
                        });

                        void Row(string title, string value)
                        {
                            table.Cell().Element(CellStyle).Text(title).Bold();
                            table.Cell().Element(CellStyle).Text(value);
                        }

                        Row("Total Products", data.TotalProducts.ToString());
                        Row("Total Categories", data.TotalCategories.ToString());
                        Row("Total Sales", data.TotalSales.ToString());
                        Row("Total Purchases", data.TotalPurchases.ToString());
                        Row("Revenue", data.TotalRevenue.ToString("C"));
                        Row("Purchase Cost", data.TotalPurchaseCost.ToString("C"));
                        Row("Profit", data.Profit.ToString("C"));

                        static IContainer CellStyle(IContainer c) =>
                            c.Border(1).Padding(5);
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generated on ");
                            x.Span(DateTime.Now.ToString("dd MMM yyyy HH:mm")).Bold();
                        });
                });
            }).GeneratePdf();

            return File(pdf, "application/pdf", "InventoryReport.pdf");
        }

        // ================= EXCEL EXPORT =================
        public async Task<IActionResult> ExportExcel()
        {
            var data = await GetReportData();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Report");

            ws.Cell(1, 1).Value = "Inventory Report";
            ws.Range(1, 1, 1, 2).Merge().Style
                .Font.SetBold().Font.SetFontSize(16)
                .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            ws.Cell(3, 1).Value = "Total Products";
            ws.Cell(3, 2).Value = data.TotalProducts;

            ws.Cell(4, 1).Value = "Total Categories";
            ws.Cell(4, 2).Value = data.TotalCategories;

            ws.Cell(5, 1).Value = "Total Sales";
            ws.Cell(5, 2).Value = data.TotalSales;

            ws.Cell(6, 1).Value = "Total Purchases";
            ws.Cell(6, 2).Value = data.TotalPurchases;

            ws.Cell(7, 1).Value = "Revenue";
            ws.Cell(7, 2).Value = data.TotalRevenue;

            ws.Cell(8, 1).Value = "Purchase Cost";
            ws.Cell(8, 2).Value = data.TotalPurchaseCost;

            ws.Cell(9, 1).Value = "Profit";
            ws.Cell(9, 2).Value = data.Profit;

            ws.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "InventoryReport.xlsx"
            );
        }
    }
}