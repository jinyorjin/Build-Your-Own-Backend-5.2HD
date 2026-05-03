namespace StreetArt.Models;

public class Artwork
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ArtistName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // e.g., Active, Destroyed, Faded
    public int LocationId { get; set; }
    public Location? Location { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
