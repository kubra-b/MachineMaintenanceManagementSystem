using MMMS.Domain.Enums;

namespace MMMS.Application.DTOs;

public class MachineDto
{
    public int Id { get; set; }
    public string MachineNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public MachineStatusEnum CurrentStatus { get; set; }
}