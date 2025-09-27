import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Pane } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster';

declare module 'leaflet' {
  interface MarkerCluster extends L.Layer {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
  }
}
import 'leaflet/dist/leaflet.css';
import type { Train } from '../../types/train';
import { generateTrainData } from '../../utils/trainDataGenerator';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Major Indian cities with their coordinates
interface CityCoords {
  [key: string]: [number, number];
}

const cities: CityCoords = {
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  ahmedabad: [23.0225, 72.5714],
  pune: [18.5204, 73.8567],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462]
};

// Generate track segments between major Indian cities with intermediate points for more natural curves
const generateTrackSegments = (): [number, number][][] => {
  // Define city connections with intermediate points for more natural curves
  const routes = [
    // Delhi to Mumbai (via Jaipur, Ahmedabad)
    [
      cities.delhi,
      [27.0238, 74.2179],  // Jaipur
      [26.9124, 75.7873],  // Ajmer
      [24.5854, 73.7125],  // Udaipur
      [23.0225, 72.5714],  // Ahmedabad
      [22.3072, 73.1812],  // Vadodara
      [20.4283, 72.8397],  // Valsad
      [19.0760, 72.8777]   // Mumbai
    ],
    // Delhi to Kolkata (via Kanpur, Allahabad, Patna)
    [
      cities.delhi,
      [27.1767, 78.0081],  // Agra
      [26.4499, 80.3319],  // Kanpur
      [25.4358, 81.8463],  // Allahabad
      [25.5941, 85.1376],  // Patna
      [24.6336, 87.8493],  // Bhagalpur
      [23.3441, 88.2461],  // Krishnanagar
      [22.5726, 88.3639]   // Kolkata
    ],
    // Mumbai to Chennai (via Pune, Solapur, Bangalore)
    [
      cities.mumbai,
      [18.5204, 73.8567],  // Pune
      [17.6599, 75.9064],  // Solapur
      [16.5186, 80.4970],  // Vijayawada
      [13.0827, 80.2707]   // Chennai
    ],
    // Chennai to Bangalore
    [
      cities.chennai,
      [12.9716, 77.5946]   // Bangalore
    ],
    // Bangalore to Hyderabad
    [
      [12.9716, 77.5946],  // Bangalore
      [14.4222, 77.7115],  // Anantapur
      [15.8281, 78.0373],  // Kurnool
      [17.3850, 78.4867]   // Hyderabad
    ],
    // Mumbai to Hyderabad (via Pune, Solapur)
    [
      cities.mumbai,
      [18.5204, 73.8567],  // Pune
      [17.6599, 75.9064],  // Solapur
      [17.6868, 77.5996],  // Gulbarga
      [17.3850, 78.4867]   // Hyderabad
    ],
    // Delhi to Jaipur
    [
      cities.delhi,
      [27.4924, 77.6737],  // Alwar
      [26.9124, 75.7873]   // Jaipur
    ]
  ];

  // Convert to the required format
  return routes.map(route => 
    route.map(point => [point[0], point[1]] as [number, number])
  );
};

// Custom train icon
const createTrainIcon = (type: string, heading: number = 0) => {
  const color = type === 'Express' ? '#ef4444' : 
                type === 'Freight' ? '#22c55e' : '#3b82f6';
  
  // Create a more visible train icon
  const iconHtml = `
    <div style="
      width: 16px;
      height: 16px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      transform: rotate(${heading}deg);
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `;

  try {
    return L.divIcon({
      html: iconHtml,
      className: 'train-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  } catch (error) {
    console.error('Error creating train icon:', error);
    // Fallback to default marker if there's an error
    return L.divIcon({
      html: '<div style="background:red;width:10px;height:10px;border-radius:50%;"></div>',
      className: 'train-marker-fallback',
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
  }
};

interface MapTrain extends Omit<Train, 'position' | 'currentTrack' | 'direction'> {
  lat: number;
  lng: number;
  heading: number;
  position: number;
  currentTrack: {
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
  };
  currentSegment: number;
  nextSegment: number;
  direction: 'East' | 'West';
}

export const LiveTrainMap: React.FC<{ onSelectTrain?: (trainId: string) => void }> = ({ onSelectTrain }) => {
  const [trains, setTrains] = useState<MapTrain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTypes, setVisibleTypes] = useState({
    Express: true,
    Freight: true,
    Local: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  const allTrackSegments = useMemo(() => generateTrackSegments(), []);

  const generateInitialTrains = useCallback((count: number): MapTrain[] => {
    return generateTrainData(count).map((train, index) => {
      // Assign each train to a track segment
      const segmentIndex = index % allTrackSegments.length;
      const [from, to] = allTrackSegments[segmentIndex];
      const position = Math.random() * 100;
      
      // Calculate initial position along the track segment
      const lat = from[0] + (to[0] - from[0]) * (position / 100);
      const lng = from[1] + (to[1] - from[1]) * (position / 100);
      
      // Calculate heading in degrees (0-360) based on track direction
      const dx = to[1] - from[1];
      const dy = to[0] - from[0];
      const heading = (Math.atan2(dy, dx) * 180) / Math.PI;
      
      // Find the next segment to create a continuous path
      const nextSegmentIndex = (segmentIndex + 1) % allTrackSegments.length;
      
      return {
        ...train,
        id: `TRAIN-${index + 1}`,
        lat,
        lng,
        heading,
        position,
        currentTrack: {
          from: { lat: from[0], lng: from[1], name: 'Current' },
          to: { lat: to[0], lng: to[1], name: 'Next' }
        },
        currentSegment: segmentIndex,
        nextSegment: nextSegmentIndex,
        direction: 'East' // Initial direction
      };
    });
  }, [allTrackSegments]);

  const updateTrainPositions = useCallback((currentTrains: MapTrain[]): MapTrain[] => {
    return currentTrains.map(train => {
      const { currentTrack, currentSegment, nextSegment, direction } = train;
      const speed = 0.1;
      let newPosition = train.position + (direction === 'East' ? speed : -speed);
      
      // Track segment is used implicitly for position calculation
      
      // If train reaches the end of current segment, switch to next segment
      if (newPosition > 100) {
        // Move to the next segment
        newPosition = 0;
        const newCurrentSegment = nextSegment;
        const newNextSegment = (newCurrentSegment + 1) % allTrackSegments.length;
        
        // Update track points
        const newFrom = allTrackSegments[newCurrentSegment][0];
        const newTo = allTrackSegments[newCurrentSegment][1];
        
        // Calculate new position and heading
        const newLat = newFrom[0] + (newTo[0] - newFrom[0]) * (newPosition / 100);
        const newLng = newFrom[1] + (newTo[1] - newFrom[1]) * (newPosition / 100);
        const dx = newTo[1] - newFrom[1];
        const dy = newTo[0] - newFrom[0];
        const newHeading = (Math.atan2(dy, dx) * 180) / Math.PI;
        
        return {
          ...train,
          lat: newLat,
          lng: newLng,
          heading: newHeading,
          position: newPosition,
          currentSegment: newCurrentSegment,
          nextSegment: newNextSegment,
          currentTrack: {
            from: { lat: newFrom[0], lng: newFrom[1], name: 'Current' },
            to: { lat: newTo[0], lng: newTo[1], name: 'Next' }
          }
        };
      }
      
      // Calculate new position along current segment
      const newLat = currentTrack.from.lat + 
        (currentTrack.to.lat - currentTrack.from.lat) * (newPosition / 100);
      const newLng = currentTrack.from.lng + 
        (currentTrack.to.lng - currentTrack.from.lng) * (newPosition / 100);
      
      return {
        ...train,
        lat: newLat,
        lng: newLng,
        position: newPosition
      };
    });
  }, [allTrackSegments]);

  useEffect(() => {
    const initialTrains = generateInitialTrains(500); // Changed from 10 to 500 trains
    setTrains(initialTrains);
    setIsLoading(false);
    
    // Update train positions every 500ms (slower update frequency)
    const interval = setInterval(() => {
      setTrains(prevTrains => updateTrainPositions(prevTrains));
    }, 500);
    
    return () => clearInterval(interval);
  }, [generateInitialTrains, updateTrainPositions]);

  const filteredTrains = useMemo(() => {
    return trains.filter(train => {
      const matchesSearch = !searchTerm || 
        train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isVisible = visibleTypes[train.type as keyof typeof visibleTypes];
      
      return matchesSearch && isVisible;
    });
  }, [trains, searchTerm, visibleTypes]);

  const trackSegmentLines = useMemo(() => {
    return allTrackSegments.map((segment, idx) => {
      // Convert each point to [lat, lng] format for Polyline
      const positions = segment.map(point => [point[0], point[1]] as [number, number]);
      return (
        <Polyline
          key={`track-${idx}`}
          positions={positions}
          color="#f59e0b"
          weight={3}
          opacity={0.8}
          lineCap="round"
          lineJoin="round"
        />
      );
    });
  }, [allTrackSegments]);

  const cityMarkers = useMemo(() => {
    return Object.entries(cities).map(([name, [lat, lng]]) => (
      <Circle
        key={name}
        center={[lat, lng]}
        radius={1000}
        fillColor="#3b82f6"
        fillOpacity={0.8}
        color="#1e40af"
        weight={1}
      >
        <Popup>
          <div className="p-2 min-w-48">
            <div className="font-medium">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
            <div className="text-sm text-gray-600">Major Station</div>
          </div>
        </Popup>
      </Circle>
    ));
  }, []);

  const handleSearch = (trainId: string) => {
    const train = trains.find(t => t.id === trainId || t.name.toLowerCase().includes(trainId.toLowerCase()));
    if (train && train.lat && train.lng && mapRef.current) {
      mapRef.current.flyTo([train.lat, train.lng], 10);
      onSelectTrain?.(train.id);
    }
  };

  const toggleTrainType = (type: keyof typeof visibleTypes) => {
    setVisibleTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading train data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Live Train Map - India</h3>
          <span className="text-sm text-gray-400">({filteredTrains.length} trains)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-4 h-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search trains by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {Object.entries(visibleTypes).map(([type, visible]) => (
              <button
                key={type}
                onClick={() => toggleTrainType(type as keyof typeof visibleTypes)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visible 
                    ? type === 'Express' ? 'bg-red-500/20 text-red-400' :
                      type === 'Freight' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {visible ? <div className="w-3 h-3 text-white rounded-full bg-green-400" /> : <div className="w-3 h-3 text-white rounded-full bg-red-400" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full flex-1 rounded-lg overflow-hidden" style={{ minHeight: 'calc(100vh - 250px)' }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ 
              height: '100%', 
              width: '100%',
              minHeight: '500px',
              position: 'relative',
              backgroundColor: '#1a202c' // Dark background to match theme
            }}
            zoomControl={true}
            className="z-0"
            ref={mapRef}
          >
            {/* Primary Tile Layer */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
            
            {/* Railway Overlay */}
            <TileLayer
              url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
              attribution='<a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
              maxZoom={19}
              opacity={0.8}
            />
            
            {/* Tracks */}
            <Pane name="tracks" style={{ zIndex: 1 }}>
              {trackSegmentLines}
            </Pane>

            {/* Cities */}
            <Pane name="cities" style={{ zIndex: 2 }}>
              {cityMarkers}
            </Pane>
            
            {/* Trains */}
            <MarkerClusterGroup
              maxClusterRadius={40}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={true}
              zoomToBoundsOnClick={true}
              disableClusteringAtZoom={8}
              spiderfyDistanceMultiplier={2}
              iconCreateFunction={(cluster: L.MarkerCluster) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `<div style="
                    width: 36px;
                    height: 36px;
                    background: rgba(59, 130, 246, 0.7);
                    border: 2px solid white;
                    border-radius: 50%;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                  ">${count}</div>`,
                  className: 'cluster-marker',
                  iconSize: L.point(36, 36, true),
                  iconAnchor: [18, 18]
                });
              }}
            >
              {filteredTrains.map((train) => (
                <Marker
                  key={train.id}
                  position={[train.lat, train.lng]}
                  icon={createTrainIcon(train.type, train.heading)}
                  eventHandlers={{
                    click: () => onSelectTrain?.(train.id)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-48">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{train.name}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          train.type === 'Express' ? 'bg-red-100 text-red-800' :
                          train.type === 'Freight' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {train.type}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium ${
                            train.status === 'On Time' ? 'text-green-600' :
                            train.status === 'Delayed' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {train.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className="font-medium">{train.currentSpeed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delay:</span>
                          <span className={`font-medium ${
                            train.delay > 15 ? 'text-red-600' :
                            train.delay > 5 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {train.delay} min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destination:</span>
                          <span className="font-medium">{train.destination}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-lg font-bold text-red-400">{trains.filter(t => t.type === 'Express').length}</div>
          <div className="text-xs text-gray-400">Express</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-lg font-bold text-green-400">{trains.filter(t => t.type === 'Freight').length}</div>
          <div className="text-xs text-gray-400">Freight</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-400">{trains.filter(t => t.type === 'Local').length}</div>
          <div className="text-xs text-gray-400">Local</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-lg font-bold text-yellow-400">{trains.filter(t => t.status === 'Delayed').length}</div>
          <div className="text-xs text-gray-400">Delayed</div>
        </div>
      </div>
    </div>
  );
};