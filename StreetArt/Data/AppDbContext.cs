namespace StreetArt.Data;

using Microsoft.EntityFrameworkCore;
using StreetArt.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Location> Locations { get; set; } = null!;
    public DbSet<Artwork> Artworks { get; set; } = null!;
    public DbSet<SecurityCamera> SecurityCameras { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<Artwork>()
            .HasOne(a => a.Location)
            .WithMany(l => l.Artworks)
            .HasForeignKey(a => a.LocationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
