namespace MMMS.Application.DTOs;

public class ReportFailureDto
{
    public int MachineId { get; set; }
    public string FailureType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ReportedBy { get; set; } = string.Empty;
}