using MMMS.Domain.Enums;

namespace MMMS.Domain.Entities;

public class Machine
{
    public int Id { get; set; }
    public string MachineNumber { get; set; } = string.Empty; // Örn: M-01
    public string Name { get; set; } = string.Empty;          // Örn: Örgü Makinesi 1
    public string? Model { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Departman İlişkisi (Foreign Key)
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    // Anlık Makine Durumu (Enum)
    public MachineStatusEnum CurrentStatus { get; set; } = MachineStatusEnum.Working;

    // Navigation Property: Makinenin arıza/bakım geçmişi
    public ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = new List<MaintenanceLog>();
}