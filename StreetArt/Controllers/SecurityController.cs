namespace StreetArt.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StreetArt.Data;
using StreetArt.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// Bounded Context: Security / Surveillance
// Handles security infrastructure (like cameras) and assesses the vulnerability or risk level of artworks.
[Route("api/[controller]")]
[ApiController]
public class SecurityController : ControllerBase
{
    private readonly AppDbContext _context;

    public SecurityController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/security/cameras
    [HttpGet("cameras")]
    public async Task<ActionResult<IEnumerable<SecurityCamera>>> GetCameras()
    {
        return await _context.SecurityCameras.ToListAsync();
    }

    // POST: api/security/cameras
    [HttpPost("cameras")]
    public async Task<ActionResult<SecurityCamera>> PostCamera(SecurityCamera camera)
    {
        _context.SecurityCameras.Add(camera);
        await _context.SaveChangesAsync();

        return Created($"/api/security/cameras/{camera.Id}", camera);
    }

    // GET: api/security/artworks-risk
    [HttpGet("artworks-risk")]
    public async Task<IActionResult> GetArtworksRisk()
    {
        var artworks = await _context.Artworks
            .Include(a => a.Location)
            .ToListAsync();

        var artworksWithRisk = artworks
            .Where(a => a.Location != null)
            .Select(a => new
            {
                ArtworkTitle = a.Title,
                ArtistName = a.ArtistName,
                LocationName = a.Location!.Name,
                HasCctv = a.Location.HasCctv,
                HasPerspexCover = a.Location.HasPerspexCover,
                RiskLevel = (a.Location.HasCctv || a.Location.HasPerspexCover) ? "Low Risk" : "High Risk"
            });

        return Ok(artworksWithRisk);
    }
}
