namespace MMMS.Domain.Entities;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Örn: Örgü, Yıkama, Desen
    public string Code { get; set; } = string.Empty; // Örn: ORG, YKM, DSN
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation Property: Bir departmanda birden fazla makine olabilir
    public ICollection<Machine> Machines { get; set; } = new List<Machine>();
}