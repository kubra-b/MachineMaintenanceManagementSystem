using MMMS.Application.DTOs;
using MMMS.Application.Interfaces;
using MMMS.Domain.Entities;
using MMMS.Domain.Enums;

namespace MMMS.Application.Services;

public class MachineService : IMachineService
{
    private readonly IRepository<Machine> _machineRepository;
    private readonly IRepository<MaintenanceLog> _logRepository;

    public MachineService(
        IRepository<Machine> machineRepository, 
        IRepository<MaintenanceLog> logRepository)
    {
        _machineRepository = machineRepository;
        _logRepository = logRepository;
    }

    public async Task<IEnumerable<MachineDto>> GetMachinesAsync(int? departmentId, string? searchTerm)
    {
        var machines = await _machineRepository.GetAllAsync();

        if (departmentId.HasValue)
        {
            machines = machines.Where(m => m.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            machines = machines.Where(m => 
                m.Name.ToLower().Contains(searchTerm) || 
                m.MachineNumber.ToLower().Contains(searchTerm));
        }

        return machines.Select(m => new MachineDto
        {
            Id = m.Id,
            MachineNumber = m.MachineNumber,
            Name = m.Name,
            Model = m.Model,
            SerialNumber = m.SerialNumber,
            DepartmentId = m.DepartmentId,
            DepartmentName = m.Department?.Name ?? "Belirtilmemiş",
            CurrentStatus = m.CurrentStatus
        });
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var machines = await _machineRepository.GetAllAsync();
        var machineList = machines.ToList();

        return new DashboardSummaryDto
        {
            TotalMachines = machineList.Count,
            WorkingMachines = machineList.Count(m => m.CurrentStatus == MachineStatusEnum.Working),
            FaultyMachines = machineList.Count(m => m.CurrentStatus == MachineStatusEnum.Faulty),
            UnderMaintenanceMachines = machineList.Count(m => m.CurrentStatus == MachineStatusEnum.UnderMaintenance)
        };
    }

    // Durum Geçişi 1: Working -> Faulty (Arıza Bildirimi)
    public async Task<bool> ReportFailureAsync(ReportFailureDto dto)
    {
        var machine = await _machineRepository.GetByIdAsync(dto.MachineId);
        if (machine == null) return false;

        machine.CurrentStatus = MachineStatusEnum.Faulty;
        _machineRepository.Update(machine);

        var log = new MaintenanceLog
        {
            MachineId = dto.MachineId,
            FailureType = dto.GetFailureType(),
            Description = dto.Description,
            ReportedBy = dto.ReportedBy,
            ReportedAt = DateTime.UtcNow
        };

        await _logRepository.AddAsync(log);
        return true;
    }

    // Durum Geçişi 2: Faulty -> UnderMaintenance (Bakıma Alma)
    public async Task<bool> StartMaintenanceAsync(int machineId, string technicianName)
    {
        var machine = await _machineRepository.GetByIdAsync(machineId);
        if (machine == null || machine.CurrentStatus != MachineStatusEnum.Faulty) return false;

        machine.CurrentStatus = MachineStatusEnum.UnderMaintenance;
        _machineRepository.Update(machine);

        var activeLog = (await _logRepository.FindAsync(l => l.MachineId == machineId && l.MaintenanceStartTime == null))
                        .OrderByDescending(l => l.ReportedAt)
                        .FirstOrDefault();

        if (activeLog != null)
        {
            activeLog.TechnicianName = technicianName;
            activeLog.MaintenanceStartTime = DateTime.UtcNow;
            _logRepository.Update(activeLog);
        }

        return true;
    }

    // Durum Geçişi 3: UnderMaintenance -> Working (Bakımı Tamamlama)
    public async Task<bool> CompleteMaintenanceAsync(int machineId, string? technicianNote)
    {
        var machine = await _machineRepository.GetByIdAsync(machineId);
        if (machine == null || machine.CurrentStatus != MachineStatusEnum.UnderMaintenance) return false;

        machine.CurrentStatus = MachineStatusEnum.Working;
        _machineRepository.Update(machine);

        var activeLog = (await _logRepository.FindAsync(l => l.MachineId == machineId && l.MaintenanceEndTime == null))
                        .OrderByDescending(l => l.ReportedAt)
                        .FirstOrDefault();

        if (activeLog != null)
        {
            activeLog.MaintenanceEndTime = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(technicianNote))
            {
                activeLog.Description += $" | Not: {technicianNote}";
            }
            _logRepository.Update(activeLog);
        }

        return true;
    }
}