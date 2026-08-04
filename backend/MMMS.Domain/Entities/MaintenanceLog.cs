namespace MMMS.Domain.Entities;

public class MaintenanceLog
{
    public int Id { get; set; }
    
    // Hangi makineye ait olduğu
    public int MachineId { get; set; }
    public Machine Machine { get; set; } = null!;

    // Arıza Bildirim Bilgileri
    public string FailureType { get; set; } = string.Empty; // Örn: Motor, Elektrik, Sensör
    public string Description { get; set; } = string.Empty;
    public string ReportedBy { get; set; } = string.Empty;
    public DateTime ReportedDate { get; set; } = DateTime.Now;

    // Onarım / Müdahale Bilgileri
    public string? AssignedTechnician { get; set; }
    public string? TechnicianNote { get; set; }
    public DateTime? MaintenanceStartDate { get; set; }
    public DateTime? ResolvedDate { get; set; }

    // Kaydın Durumu (1: Bildirildi, 2: Onarımda, 3: Tamamlandı)
    public int LogStatus { get; set; } = 1;
}