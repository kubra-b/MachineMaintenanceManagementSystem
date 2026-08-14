using MMMS.Domain.Enums;

namespace MMMS.Domain.Entities;
 
 
public class MaintenanceLog
{
    public int Id { get; set; }
    public int MachineId { get; set; }
    public Machine Machine { get; set; } = null!;

    public MachineStatusEnum FailureType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ReportedBy { get; set; } = string.Empty;

    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public string? TechnicianName { get; set; }
    public DateTime? MaintenanceStartTime { get; set; }
    public DateTime? MaintenanceEndTime { get; set; }
}