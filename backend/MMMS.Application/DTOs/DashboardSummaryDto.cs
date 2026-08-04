namespace MMMS.Application.DTOs;

public class DashboardSummaryDto
{
    public int TotalMachines { get; set; }
    public int WorkingMachines { get; set; }
    public int FaultyMachines { get; set; }
    public int UnderMaintenanceMachines { get; set; }
}