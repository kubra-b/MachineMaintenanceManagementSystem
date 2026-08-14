using MMMS.Application.DTOs;

namespace MMMS.Application.Interfaces;


public interface IMachineService
{
    Task<IEnumerable<MachineDto>> GetMachinesAsync(int? departmentId, string? searchTerm);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<bool> ReportFailureAsync(ReportFailureDto dto);
    Task<bool> StartMaintenanceAsync(int machineId, string technicianName);
    Task<bool> CompleteMaintenanceAsync(int machineId, string? technicianNote);
}