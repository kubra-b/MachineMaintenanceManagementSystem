using MMMS.Domain.Enums;

using Microsoft.EntityFrameworkCore;
using MMMS.Domain.Entities;

namespace MMMS.Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Department> Departments { get; set; }
    public DbSet<Machine> Machines { get; set; }
    public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tablo ilişkileri ve Fluent API konfigürasyonları
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
            entity.Property(d => d.Code).IsRequired().HasMaxLength(20);
        });

        modelBuilder.Entity<Machine>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.MachineNumber).IsRequired().HasMaxLength(50);
            entity.Property(m => m.Name).IsRequired().HasMaxLength(100);
            entity.Property(m => m.SerialNumber).IsRequired().HasMaxLength(100);

            // Departman Silindiğinde Makineler Etkilenmesin (Restrict)
            entity.HasOne(m => m.Department)
                  .WithMany(d => d.Machines)
                  .HasForeignKey(m => m.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MaintenanceLog>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.FailureType).IsRequired().HasMaxLength(100);
            entity.Property(l => l.ReportedBy).IsRequired().HasMaxLength(100);

            // Makine Silindiğinde Arıza Geçmişi de Temizlensin (Cascade)
            entity.HasOne(l => l.Machine)
                  .WithMany(m => m.MaintenanceLogs)
                  .HasForeignKey(l => l.MachineId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}