using Microsoft.EntityFrameworkCore;
using MMMS.Infrastructure.Context;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext Servis Kaydı (SQL Server Bağlantısı)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS Politikası (React frontend'inin API'ye erişebilmesi için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS Middleware Aktif Etme
app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapControllers();

app.Run();