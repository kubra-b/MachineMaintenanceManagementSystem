using Microsoft.AspNetCore.Mvc;
using MMMS.Application.Interfaces;

namespace MMMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IMachineService _machineService;

    public DashboardController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _machineService.GetDashboardSummaryAsync();
        return Ok(summary);
    }
}