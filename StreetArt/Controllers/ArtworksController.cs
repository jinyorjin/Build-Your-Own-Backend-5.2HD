namespace StreetArt.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StreetArt.Data;
using StreetArt.Models;

// Bounded Context: Artworks
// Manages the actual artworks, their status, artists, and imagery.
// Artworks are associated with a Location.
[Route("api/[controller]")]
[ApiController]
public class ArtworksController : ControllerBase
{
    private readonly AppDbContext _context;

    public ArtworksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Artwork>>> GetArtworks()
    {
        return await _context.Artworks.Include(a => a.Location).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Artwork>> GetArtwork(int id)
    {
        var artwork = await _context.Artworks.Include(a => a.Location).FirstOrDefaultAsync(a => a.Id == id);

        if (artwork == null)
        {
            return NotFound();
        }

        return artwork;
    }

    [HttpPost]
    public async Task<ActionResult<Artwork>> PostArtwork(Artwork artwork)
    {
        _context.Artworks.Add(artwork);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetArtwork), new { id = artwork.Id }, artwork);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutArtwork(int id, Artwork artwork)
    {
        if (id != artwork.Id)
        {
            return BadRequest();
        }

        _context.Entry(artwork).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ArtworkExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArtwork(int id)
    {
        var artwork = await _context.Artworks.FindAsync(id);
        if (artwork == null)
        {
            return NotFound();
        }

        _context.Artworks.Remove(artwork);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ArtworkExists(int id)
    {
        return _context.Artworks.Any(e => e.Id == id);
    }
}
