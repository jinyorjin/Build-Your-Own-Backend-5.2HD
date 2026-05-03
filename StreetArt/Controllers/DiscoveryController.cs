namespace StreetArt.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StreetArt.Data;
using StreetArt.Models;
using System;

// Bounded Context: Discovery
// Handles location-based search and discovering artworks in the vicinity of the user.
[Route("api/[controller]")]
[ApiController]
public class DiscoveryController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiscoveryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearbyArtworks([FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radius)
    {
        // Input validation
        if (lat < -90 || lat > 90)
            return BadRequest("Latitude must be between -90 and 90.");
        
        if (lng < -180 || lng > 180)
            return BadRequest("Longitude must be between -180 and 180.");
            
        if (radius <= 0)
            return BadRequest("Radius must be greater than 0.");

        // NOTE: This Haversine formula implementation is for demonstration and simplicity.
        // It fetches data into memory to calculate distance.
        // It can be upgraded to use PostGIS and ST_DWithin directly in the database query later for performance.
        var allArtworks = await _context.Artworks.Include(a => a.Location).ToListAsync();

        var nearbyArtworks = allArtworks
            .Where(a => a.Location != null)
            .Select(a => new
            {
                Artwork = a,
                DistanceMeters = CalculateHaversineDistance(lat, lng, a.Location!.Latitude, a.Location.Longitude)
            })
            .Where(x => x.DistanceMeters <= radius)
            .OrderBy(x => x.DistanceMeters)
            .ToList();

        return Ok(nearbyArtworks);
    }

    // Calculates the distance between two coordinates in meters
    private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371e3; // Earth's radius in meters
        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaPhi = (lat2 - lat1) * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;

        var a = Math.Sin(deltaPhi / 2) * Math.Sin(deltaPhi / 2) +
                Math.Cos(phi1) * Math.Cos(phi2) *
                Math.Sin(deltaLambda / 2) * Math.Sin(deltaLambda / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c; // Distance in meters
    }
}
