import React, { useCallback, useEffect, useState } from 'react';
import { Compass, MapPin, Video, LocateFixed, AlertTriangle } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { EventsAPI } from '../lib/queries';

const CATEGORIES = ['all', 'personal', 'developer', 'web3', 'social', 'business', 'health'];
const RADII = [10, 25, 50, 100];

export default function DiscoverPage() {
  const [coords, setCoords] = useState(null); // { lat, lng, label }
  const [radiusKm, setRadiusKm] = useState(50);
  const [category, setCategory] = useState('all');
  const [nearby, setNearby] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | denied | done
  const [cityQuery, setCityQuery] = useState('');

  const fetchDiscover = useCallback(async (lat, lng, radius, cat) => {
    setLoading(true);
    try {
      const res = await EventsAPI.discover({
        lat,
        lng,
        radiusKm: radius,
        category: cat === 'all' ? undefined : cat,
      });
      setNearby(res.data.nearby || []);
      setOnline(res.data.online || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your location' };
        setCoords(c);
        setGeoStatus('done');
        fetchDiscover(c.lat, c.lng, radiusKm, category);
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 }
    );
  }, [fetchDiscover, radiusKm, category]);

  useEffect(() => {
    locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords) fetchDiscover(coords.lat, coords.lng, radiusKm, category);
    else fetchDiscover(undefined, undefined, radiusKm, category);
  }, [radiusKm, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCitySelect = ({ formattedAddress, lat, lng }) => {
    setCityQuery(formattedAddress);
    const c = { lat, lng, label: formattedAddress };
    setCoords(c);
    fetchDiscover(lat, lng, radiusKm, category);
  };

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary font-sans pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full bg-luma-blue/10 blur-[130px] animate-float-1" />
        <div className="absolute bottom-[25%] right-[15%] w-[450px] h-[450px] rounded-full bg-luma-indigo/15 blur-[140px] animate-float-2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
          <Compass className="w-4.5 h-4.5" />
          <span>Discover</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          {coords?.label && coords.label !== 'Your location' ? `Events near ${coords.label}` : 'Events near you'}
        </h1>
        <p className="text-luma-text-muted mt-2 text-sm md:text-base max-w-xl">
          Find in-person events close by, or browse what's happening online worldwide.
        </p>

        {/* Controls */}
        <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="flex-1 max-w-md">
            <LocationAutocomplete
              value={cityQuery}
              onChange={setCityQuery}
              onSelect={handleCitySelect}
              placeholder="Search a city or address..."
              className="h-11 rounded-xl bg-white/[0.02] border-white/[0.08]"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={locateMe} className="flex items-center gap-1.5 rounded-xl shrink-0">
            <LocateFixed className="w-3.5 h-3.5" />
            {geoStatus === 'locating' ? 'Locating...' : 'Use my location'}
          </Button>
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.08] p-1 rounded-xl shrink-0">
            {RADII.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  radiusKm === r ? 'bg-white/[0.08] text-white' : 'text-luma-text-muted hover:text-white'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {geoStatus === 'denied' && !coords && (
          <div className="mt-4 flex items-center gap-2 text-xs text-luma-yellow bg-luma-yellow/10 border border-luma-yellow/20 rounded-xl px-4 py-2.5 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            Location access denied -- search a city above instead.
          </div>
        )}

        {/* Category chips */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all cursor-pointer capitalize ${
                category === c
                  ? 'bg-white/[0.08] text-white border-white/[0.1]'
                  : 'text-luma-text-muted border-white/[0.06] hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" variant="primary" label="Finding events..." />
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-4">
                <MapPin className="w-4 h-4 text-luma-yellow" /> Nearby ({nearby.length})
              </h2>
              {nearby.length === 0 ? (
                <p className="text-xs text-luma-text-muted py-6">No physical events found in this radius. Try widening the search or a different city.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearby.map((event) => (
                    <EventCard key={event._id} event={event} distanceKm={event.distanceKm} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-4">
                <Video className="w-4 h-4 text-luma-blue" /> Online ({online.length})
              </h2>
              {online.length === 0 ? (
                <p className="text-xs text-luma-text-muted py-6">No online events right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {online.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
