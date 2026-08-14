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

    // Departman İlişkisi (Foreign Key) kullanıyoruz çünkü her makine bir departmana aittir.
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    // Anlık Makine Durumu (Enum) kullanıyoruz çünkü makinenin durumu belirli bir setten oluşuyor: Çalışıyor, Arızalı, Onarımda.
    public MachineStatusEnum CurrentStatus { get; set; } = MachineStatusEnum.Working;

    // Navigation Property: Makinenin arıza/bakım geçmişi kullanıyoruz çünkü bir makinenin birden fazla bakım kaydı olabilir.
    public ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = new List<MaintenanceLog>();
}