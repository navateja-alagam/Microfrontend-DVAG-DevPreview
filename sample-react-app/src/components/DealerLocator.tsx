import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import bridge from '@lightning-out/bridge';

interface Dealer {
  name: string;
  city: string;
  state: string;
  address: string;
}

function DealerLocator() {
  const [query, setQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const dealers: Dealer[] = [
    { name: 'City Bikes', city: 'San Francisco', state: 'CA', address: '123 Main St, San Francisco, CA 94101' },
    { name: 'Trail Masters', city: 'Denver', state: 'CO', address: '1437 Bannock St, Denver 80202' },
    { name: 'Mountain Gear', city: 'Boulder', state: 'CO', address: '1777 BroadwayBoulder, CO 80302' }
  ];

  useEffect(() => {
    // Fix Leaflet icon paths - delete the default _getIconUrl method
    // and set explicit paths to our assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/marker-icon-2x.png',
      iconUrl: '/assets/marker-icon.png',
      shadowUrl: '/assets/marker-shadow.png'
    });

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [39.5, -98.35], // Center of USA
        zoom: 4
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      setFilteredDealers(dealers);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);


  const search = async () => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? dealers.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.city.toLowerCase().includes(q) ||
            d.state.toLowerCase().includes(q)
        )
      : dealers;

    setFilteredDealers(filtered);
    await updateMapMarkers(filtered);
  };

  const clear = () => {
    setQuery('');
    setFilteredDealers(dealers);
    updateMapMarkers(dealers);
    if (isDirty) {
      setIsDirty(false);
      bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-reset'));
    }
  };

  const updateMapMarkers = async (dealersToShow: Dealer[]) => {
    if (!mapRef.current) return;

    // Remove existing markers
    mapRef.current.eachLayer((layer: any) => {
      if ((layer as any).options && (layer as any).options.attribution === undefined) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Geocode addresses (mock via free API)
    for (const d of dealersToShow) {
      const coords = await geocodeAddress(d.address);
      if (coords && mapRef.current) {
        L.marker(coords)
          .addTo(mapRef.current)
          .bindPopup(`<b>${d.name}</b><br>${d.address}`);
      }
    }

    if (dealersToShow.length > 0 && mapRef.current) {
      const first = await geocodeAddress(dealersToShow[0].address);
      if (first) mapRef.current.setView(first, 12);
    }
  };

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.length) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch {
      console.warn('Geocode failed for', address);
    }
    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="card">
      <h2>React Microfrontend - Dealer Locator</h2>
      <p>Find a dealer near you.</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            className="dealer-input"
            placeholder="Enter city or zip"
            style={{ width: '100%' }}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isDirty) {
                setIsDirty(true);
                bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-detected'));
              }
            }}
            onKeyPress={handleKeyPress}
          />
          <div className="actions" style={{ margin: '8px 0' }}>
            <button className="primary" onClick={search}>
              Search
            </button>
            <button className="secondary" onClick={clear}>
              Clear
            </button>
          </div>
          <ul>
            {filteredDealers.length > 0 ? (
              filteredDealers.map((d, idx) => (
                <li key={idx}>
                  {d.name} — {d.city}, {d.state}
                </li>
              ))
            ) : (
              <li>No dealers found.</li>
            )}
          </ul>
        </div>
        <div style={{ flex: 1, minHeight: '400px' }}>
          <div style={{ height: '100%', borderRadius: '8px' }} ref={mapContainerRef}></div>
        </div>
      </div>
    </div>
  );
}

export default DealerLocator;
