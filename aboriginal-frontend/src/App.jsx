import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

const API = "http://localhost:5098/api";
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const PRESETS = [
  { label: "Fed Square",    lat: -37.8179, lng: 144.9690 },
  { label: "NGV",           lat: -37.8226, lng: 144.9689 },
  { label: "State Library", lat: -37.8099, lng: 144.9653 },
  { label: "ACMI",          lat: -37.8175, lng: 144.9691 },
];

/* ── Demo preview data (shown only when backend returns 0 artworks) ── */
const DEMO_ARTWORKS = [
  {
    id: "demo-1",
    isDemo: true,
    title: "Kulin Nation Songlines",
    artistName: "Wurundjeri Elder",
    status: "Active",
    description: "A celebration of the Kulin Nation's connection to the Yarra River.",
    location: { name: "Federation Square", latitude: -37.8179, longitude: 144.9690 },
  },
  {
    id: "demo-2",
    isDemo: true,
    title: "River Country",
    artistName: "Boon Wurrung Artist",
    status: "Active",
    description: "Depicting the Birrarung (Yarra River) and its cultural significance.",
    location: { name: "National Gallery of Victoria", latitude: -37.8226, longitude: 144.9689 },
  },
  {
    id: "demo-3",
    isDemo: true,
    title: "Knowledge Keeper",
    artistName: "Ngurai-illum Wurrung Artist",
    status: "Pending",
    description: "Honouring oral traditions and the passing of knowledge across generations.",
    location: { name: "State Library of Victoria", latitude: -37.8099, longitude: 144.9653 },
  },
];

/* ── Load Google Maps script once ──────────────────────────────── */
function loadMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(); return; }
    if (document.getElementById("gmap-script")) {
      document.getElementById("gmap-script").addEventListener("load", resolve);
      return;
    }
    const s = document.createElement("script");
    s.id = "gmap-script";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ── Navbar ─────────────────────────────────────────────────────── */
function Navbar() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">Aboriginal Art Gallery Discovery</span>
        <div className="navbar-links">
          {[["Gallery", "sec-map"], ["Discovery", "sec-discovery"], ["Map", "sec-map"]].map(
            ([label, id]) => (
              <button key={label} className="nav-link" onClick={() => scrollTo(id)}>
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── Compact artwork list card ──────────────────────────────────── */
function ArtworkCard({ artwork, selected, onSelect }) {
  return (
    <div
      className={`list-card${selected ? " list-card--active" : ""}${artwork.isDemo ? " list-card--demo" : ""}`}
      onClick={() => onSelect(artwork)}
    >
      <div className="list-card-body">
        <div className="list-card-title">
          {artwork.title}
          {artwork.isDemo && <span className="demo-pill">Demo Preview</span>}
        </div>
        <div className="list-card-artist">{artwork.artistName ?? "Unknown artist"}</div>
        {artwork.location?.name && (
          <div className="list-card-loc">{artwork.location.name}</div>
        )}
      </div>
      <div className="list-card-right">
        <span className={`badge badge-${(artwork.status ?? "").toLowerCase()}`}>
          {artwork.status ?? "—"}
        </span>
        {artwork.location?.latitude != null && (
          <button
            className="view-btn"
            onClick={(e) => { e.stopPropagation(); onSelect(artwork); }}
          >
            View on map
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Google Map panel ───────────────────────────────────────────── */
function MapPanel({ artworks, selected, onSelectArtwork }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  /* Load script */
  useEffect(() => {
    if (!MAPS_KEY) return;
    loadMapsScript(MAPS_KEY)
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true));
  }, []);

  /* Init map */
  useEffect(() => {
    if (!mapsReady || !containerRef.current || mapRef.current) return;
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: { lat: -37.8136, lng: 144.9631 },
      zoom: 14,
      disableDefaultUI: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f0ece4" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#6b6560" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1eb" }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9c0b6" }] },
        { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8e2d8" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d6cfc4" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f5ead6" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c9b99a" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7a7570" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d8e8" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#8a9bb0" }] },
      ],
    });
    infoRef.current = new window.google.maps.InfoWindow();
  }, [mapsReady]);

  /* Sync markers when artworks change */
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    artworks.forEach((a) => {
      if (!a.location?.latitude) return;
      const marker = new window.google.maps.Marker({
        position: { lat: a.location.latitude, lng: a.location.longitude },
        map: mapRef.current,
        title: a.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#c87120",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelectArtwork(a));
      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworks, mapsReady]);

  /* Pan to selected artwork */
  useEffect(() => {
    if (!mapRef.current || !selected?.location?.latitude) return;
    const pos = { lat: selected.location.latitude, lng: selected.location.longitude };
    mapRef.current.panTo(pos);
    mapRef.current.setZoom(16);
    if (infoRef.current) {
      infoRef.current.setContent(
        `<div style="font-family:Inter,sans-serif;padding:4px 2px">
          <strong style="font-size:14px">${selected.title}</strong><br/>
          <span style="color:#555;font-size:12px">${selected.artistName ?? ""}</span>
        </div>`
      );
      const marker = markersRef.current.find(
        (m) => m.getTitle() === selected.title
      );
      if (marker) infoRef.current.open(mapRef.current, marker);
    }
  }, [selected]);

  if (!MAPS_KEY) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-inner">
          <div className="map-placeholder-title">Google Maps API key required</div>
          <p className="map-placeholder-sub">
            Add <code>VITE_GOOGLE_MAPS_API_KEY=your_key</code> to your{" "}
            <code>.env</code> file and restart the dev server to load the live map.
          </p>
        </div>
      </div>
    );
  }

  if (mapsError) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-inner">
          <div className="map-placeholder-title">Failed to load Google Maps</div>
          <p className="map-placeholder-sub">Check your API key and network connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-canvas" />
      {selected && (
        <div className="map-info-float">
          <div className="mif-title">{selected.title}</div>
          {selected.artistName && <div className="mif-sub">{selected.artistName}</div>}
          {selected.location?.name && (
            <div className="mif-loc">{selected.location.name}</div>
          )}
        </div>
      )}
      {!mapsReady && (
        <div className="map-loading">
          <span className="spinner" /> Loading map...
        </div>
      )}
    </div>
  );
}

/* ── Collapsible Add Artwork panel ──────────────────────────────── */
function AddArtworkPanel({ onAdded }) {
  const [open, setOpen] = useState(false);
  const blank = { title: "", artistName: "", description: "", imageUrl: "", status: "Pending", locationId: "" };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  function handle(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    try {
      const payload = {
        title: form.title, artistName: form.artistName,
        description: form.description, imageUrl: form.imageUrl,
        status: form.status,
        ...(form.locationId ? { locationId: parseInt(form.locationId) } : {}),
      };
      const res = await fetch(`${API}/artworks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm(blank); setSuccess(true);
      onAdded();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message ?? "Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel">
      <button className="admin-toggle" onClick={() => setOpen((v) => !v)}>
        <span>Admin: Add Artwork</span>
        <span className="admin-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-grid">
            <label className="field">
              <span className="field-label">Title <span className="req">*</span></span>
              <input className="input" name="title" value={form.title} onChange={handle} required placeholder="Artwork title" />
            </label>
            <label className="field">
              <span className="field-label">Artist Name <span className="req">*</span></span>
              <input className="input" name="artistName" value={form.artistName} onChange={handle} required placeholder="Artist name" />
            </label>
            <label className="field admin-full">
              <span className="field-label">Description</span>
              <textarea className="input textarea" name="description" value={form.description} onChange={handle} rows={3} placeholder="Brief description" />
            </label>
            <label className="field admin-full">
              <span className="field-label">Image URL</span>
              <input className="input" name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://..." />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select className="input" name="status" value={form.status} onChange={handle}>
                <option>Pending</option><option>Active</option>
                <option>Approved</option><option>Removed</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Location ID <span className="opt">(optional)</span></span>
              <input className="input" name="locationId" type="number" value={form.locationId} onChange={handle} placeholder="e.g. 1" />
            </label>
          </div>
          {success && <div className="msg msg-ok">Artwork added and gallery refreshed.</div>}
          {error   && <div className="msg msg-err">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Add Artwork"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  /* Nearby */
  const [lat, setLat] = useState(-37.8167);
  const [lng, setLng] = useState(144.9691);
  const [radius, setRadius] = useState(1000);
  const [nearbyList, setNearbyList] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyErr, setNearbyErr] = useState(null);

  const loadArtworks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/artworks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArtworks(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach backend at http://localhost:5098. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArtworks(); }, [loadArtworks]);

  async function searchNearby() {
    setNearbyLoading(true); setNearbyErr(null);
    try {
      const res = await fetch(`${API}/discovery/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNearbyList(Array.isArray(data) ? data : []);
    } catch {
      setNearbyErr("Nearby search failed.");
    } finally {
      setNearbyLoading(false);
    }
  }

  /* Use demo data only when backend returns 0 real artworks */
  const isDemo = !loading && !error && artworks.length === 0;

  /* Displayed list: nearby results → real artworks → demo artworks */
  const displayList =
    nearbyList !== null
      ? nearbyList.map((n) => n.artwork).filter(Boolean)
      : isDemo
      ? DEMO_ARTWORKS
      : artworks;

  /* Markers: real artworks when available, otherwise demo artworks */
  const mapMarkers = artworks.length > 0 ? artworks : DEMO_ARTWORKS;

  return (
    <div className="app">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Discover Aboriginal Art Around Melbourne</h1>
          <p className="hero-sub">
            Explore nearby artworks and cultural locations through an interactive CBD map.
          </p>
        </div>
      </header>

      <main className="main" id="sec-map">

        {/* ── Discovery controls ────────────────────────────────────── */}
        <div id="sec-discovery" className="controls-bar">
          <div className="controls-presets">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className="preset-btn"
                onClick={() => { setLat(p.lat); setLng(p.lng); }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="controls-inputs">
            <label className="ctrl-field">
              <span>Lat</span>
              <input className="ctrl-input" type="number" step="0.0001"
                value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} />
            </label>
            <label className="ctrl-field">
              <span>Lng</span>
              <input className="ctrl-input" type="number" step="0.0001"
                value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} />
            </label>
            <label className="ctrl-field">
              <span>Radius (m)</span>
              <input className="ctrl-input" type="number" step="100" min="100"
                value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} />
            </label>
            <button className="btn btn-primary" onClick={searchNearby} disabled={nearbyLoading}>
              {nearbyLoading ? "Searching..." : "Search nearby"}
            </button>
            {nearbyList !== null && (
              <button className="btn btn-ghost" onClick={() => setNearbyList(null)}>
                Clear
              </button>
            )}
          </div>
          {nearbyErr && <div className="msg msg-err">{nearbyErr}</div>}
        </div>

        {/* ── Two-column layout ─────────────────────────────────────── */}
        <div className="split-layout">

          {/* Left: list panel */}
          <aside className="list-panel">
            <div className="list-header">
              {nearbyList !== null
                ? `${displayList.length} nearby result${displayList.length !== 1 ? "s" : ""}`
                : loading
                ? "Loading artworks..."
                : isDemo
                ? "Demo Preview — no artworks in backend yet"
                : `${artworks.length} artwork${artworks.length !== 1 ? "s" : ""}`}
            </div>

            {loading && (
              <div className="list-state">
                <span className="spinner" /> Loading from backend...
              </div>
            )}

            {error && (
              <div className="list-state list-state--error">{error}</div>
            )}

            {!loading && !error && nearbyList !== null && displayList.length === 0 && (
              <div className="list-state">No artworks found within this radius.</div>
            )}

            <div className="list-scroll">
              {displayList.map((a) => (
                <ArtworkCard
                  key={a.id}
                  artwork={a}
                  selected={selected?.id === a.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </aside>

          {/* Right: map panel */}
          <div className="map-panel">
            <MapPanel
              artworks={mapMarkers}
              selected={selected}
              onSelectArtwork={setSelected}
            />
          </div>

        </div>

        {/* ── Admin: Add Artwork (collapsed by default) ─────────────── */}
        <AddArtworkPanel onAdded={loadArtworks} />

      </main>

      <footer className="footer">
        <span>Aboriginal Art Gallery Discovery</span>
        <span className="footer-sep">|</span>
        <span>SIT331 5.2HD</span>
        <span className="footer-sep">|</span>
        <code>{API}</code>
      </footer>
    </div>
  );
}
