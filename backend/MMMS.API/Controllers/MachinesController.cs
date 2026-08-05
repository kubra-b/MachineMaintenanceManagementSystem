using Microsoft.AspNetCore.Mvc;
using MMMS.Application.DTOs;
using MMMS.Application.Interfaces;

namespace MMMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    private readonly IMachineService _machineService;

    public MachinesController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMachines([FromQuery] int? departmentId, [FromQuery] string? searchTerm)
    {
        var result = await _machineService.GetMachinesAsync(departmentId, searchTerm);
        return Ok(result);
    }

    [HttpPost("report-failure")]
    public async Task<IActionResult> ReportFailure([FromBody] ReportFailureDto dto)
    {
        var success = await _machineService.ReportFailureAsync(dto);
        if (!success) return BadRequest("Makine bulunamadı.");
        return Ok(new { message = "Arıza kaydı başarıyla oluşturuldu." });
    }

    [HttpPost("{id}/start-maintenance")]
    public async Task<IActionResult> StartMaintenance(int id, [FromBody] string technicianName)
    {
        var success = await _machineService.StartMaintenanceAsync(id, technicianName);
        if (!success) return BadRequest("Makine bakıma alınamadı. Makine durumunu kontrol ediniz.");
        return Ok(new { message = "Makine bakıma alındı." });
    }

    [HttpPost("{id}/complete-maintenance")]
    public async Task<IActionResult> CompleteMaintenance(int id, [FromBody] string? technicianNote)
    {
        var success = await _machineService.CompleteMaintenanceAsync(id, technicianNote);
        if (!success) return BadRequest("Bakım tamamlanamadı. Makine durumunu kontrol ediniz.");
        return Ok(new { message = "Bakım başarıyla tamamlandı, makine çalışır durumda." });
    }
}