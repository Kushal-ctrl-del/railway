import { Train } from '../types/train';

// India's approximate bounding box
const INDIA_BOUNDS = {
  north: 37.6,
  south: 6.4,
  east: 97.25,
  west: 68.7
};

// Major Indian cities for realistic train routes
const MAJOR_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 }
];

// Railway routes (arrays of [lat, lng])
const RAILWAY_ROUTES = [
  [
    [28.6139, 77.2090],
    [27.4924, 77.6737],
    [26.9124, 75.7873],
    [25.4358, 75.6403],
    [24.5929, 73.7150],
    [23.0225, 72.5714],
    [22.3072, 73.1812],
    [21.1702, 72.8311],
    [20.4283, 72.8777],
    [19.0760, 72.8777]
  ],
  [
    [28.6139, 77.2090],
    [27.1767, 78.0081],
    [26.4499, 80.3319],
    [25.4358, 81.8463],
    [25.3176, 83.0120],
    [25.5941, 85.1376],
    [24.6336, 87.8493],
    [23.3441, 88.2461],
    [22.5726, 88.3639]
  ],
  [
    [19.0760, 72.8777],
    [18.5204, 73.8567],
    [17.6599, 75.9064],
    [15.8497, 74.4977],
    [12.9716, 77.5946],
    [13.0827, 80.2707]
  ],
  [
    [13.0827, 80.2707],
    [13.6288, 79.4192],
    [14.4426, 79.9865],
    [15.8281, 78.0373],
    [17.3850, 78.4867]
  ],
  [
    [12.9716, 77.5946],
    [13.3409, 77.7176],
    [14.4222, 77.7115],
    [15.8281, 78.0373],
    [17.3850, 78.4867]
  ]
];

// Helper types
type Point = [number, number];
type Route = Point[];

// Returns nearest point on a segment and normalized position [0..1]
function nearestPointOnSegment(
  point: { lat: number; lng: number },
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): { point: { lat: number; lng: number }, position: number } {
  const x = point.lng;
  const y = point.lat;
  const x1 = lineStart.lng;
  const y1 = lineStart.lat;
  const x2 = lineEnd.lng;
  const y2 = lineEnd.lat;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx: number, yy: number;
  let position = param;

  if (param < 0) {
    xx = x1;
    yy = y1;
    position = 0;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
    position = 1;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return {
    point: { lat: yy, lng: xx },
    position: Math.max(0, Math.min(1, position))
  };
}

// Find the next segment in a route (returns next from/to or reversed route if at end)
function findNextSegment(route: Route, currentFrom: Point, currentTo: Point) {
  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    if (from[0] === currentFrom[0] && from[1] === currentFrom[1] &&
        to[0] === currentTo[0] && to[1] === currentTo[1]) {
      if (i + 2 < route.length) {
        return {
          from: [route[i+1][0], route[i+1][1]] as Point,
          to: [route[i+2][0], route[i+2][1]] as Point,
          isEnd: false,
          route,
          segmentIndex: i + 1
        };
      }
      // at end -> return reversed route's first segment
      return {
        from: [route[route.length-1][0], route[route.length-1][1]] as Point,
        to: [route[route.length-2][0], route[route.length-2][1]] as Point,
        isEnd: true,
        route: [...route].reverse(),
        segmentIndex: 0
      };
    }
  }
  return null;
}

// Attempt to snap a train to the nearest route segment (used when train.currentTrack missing)
function snapToNearestTrack(train: Train) {
  let minDistance = Infinity;
  let nearestSegment: { from: Point; to: Point } | null = null;
  let nearestPoint: { lat: number; lng: number } | null = null;
  let nearestPosition = 0;
  let nearestRoute: Route | null = null;

  for (const route of RAILWAY_ROUTES) {
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];

      const result = nearestPointOnSegment(
        { lat: train.lat, lng: train.lng },
        { lat: from[0], lng: from[1] },
        { lat: to[0], lng: to[1] }
      );

      const dx = result.point.lng - train.lng;
      const dy = result.point.lat - train.lat;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearestSegment = { from, to };
        nearestPoint = result.point;
        nearestPosition = result.position;
        nearestRoute = route;
      }
    }
  }

  if (!nearestSegment || !nearestPoint || !nearestRoute) return null;

  const from = { lat: nearestSegment.from[0], lng: nearestSegment.from[1], name: '' };
  const to = { lat: nearestSegment.to[0], lng: nearestSegment.to[1], name: '' };

  const dx = nearestSegment.to[1] - nearestSegment.from[1];
  const dy = nearestSegment.to[0] - nearestSegment.from[0];
  const segmentLength = Math.sqrt(dx * dx + dy * dy);

  const nextSegment = findNextSegment(nearestRoute, nearestSegment.from, nearestSegment.to);

  return {
    lat: nearestPoint.lat,
    lng: nearestPoint.lng,
    heading: (Math.atan2(dy, dx) * 180) / Math.PI,
    currentTrack: {
      id: `track-${Math.random().toString(36).substr(2, 9)}`,
      name: `${nearestSegment.from.join(',')}-${nearestSegment.to.join(',')}`,
      from,
      to,
      position: nearestPosition,
      startX: from.lng,
      startY: from.lat,
      endX: to.lng,
      endY: to.lat,
      length: segmentLength,
      maxSpeed: train.type === 'Express' ? 120 : train.type === 'Freight' ? 80 : 100,
      isOccupied: false,
      type: 'Main' as const,
      route: nearestRoute,
      currentSegment: 0,
      nextSegment: nextSegment ? 1 : 0,
      direction: 'East' as const,
      heading: (Math.atan2(dy, dx) * 180) / Math.PI
    } as any // cast because Train.currentTrack may have a concrete type in user's definitions
  };
}

/**
 * Update the train position along the railway network.
 * - If the train has no currentTrack, we snap it to nearest track.
 * - Otherwise we advance along the current segment and switch segments when needed.
 */
function updateTrainPosition(train: Train): Train {
  // If no currentTrack -> find nearest and snap
  if (!train.currentTrack) {
    const snapped = snapToNearestTrack(train);
    if (snapped) {
      return {
        ...train,
        lat: snapped.lat,
        lng: snapped.lng,
        heading: snapped.heading,
        currentTrack: snapped.currentTrack,
        lastUpdated: new Date().toISOString()
      };
    }
    // No track found: fallback to updating via heading (random movement)
  }

  // If we have a currentTrack, move along it
  if (train.currentTrack) {
    // Normalize track shape and values to avoid runtime errors
    const track = {
      ...train.currentTrack,
      direction: (train.currentTrack as any).direction || 'East',
      route: (train.currentTrack as any).route || [],
      currentSegment: typeof (train.currentTrack as any).currentSegment === 'number' ? (train.currentTrack as any).currentSegment : 0,
      nextSegment: typeof (train.currentTrack as any).nextSegment === 'number' ? (train.currentTrack as any).nextSegment : 0,
      heading: typeof (train.currentTrack as any).heading === 'number' ? (train.currentTrack as any).heading : 0,
      from: { ...(train.currentTrack as any).from },
      to: { ...(train.currentTrack as any).to },
      position: typeof (train.currentTrack as any).position === 'number' ? (train.currentTrack as any).position : 0.5,
      length: typeof (train.currentTrack as any).length === 'number' ? (train.currentTrack as any).length : 1
    };

    const position = track.position!;
    const speedKmh = train.currentSpeed || 0;

    // Convert speed to a normalized delta along segment: speedKmh / (segmentLength km) * dt
    // Since our coordinates are degrees, we normalize by a factor to keep motion visible.
    // segment length is in degree-space (since we used lat/lng differences)
    const segmentLength = Math.max(track.length || 1, 0.000001);
    const speedDegPerTick = (speedKmh / 3600) * (1 / (segmentLength || 1)); // rough normalization per second

    const dir = track.direction === 'East' ? 1 : -1;
    let newPosition = position + dir * speedDegPerTick;

    // Helper to move to next segment
    const switchToNextSegment = (route: Route, currentIdx: number, directionSign: number, overshoot: number) => {
      let nextIdx = currentIdx + directionSign;
      let reversed = false;
      if (nextIdx < 0 || nextIdx >= route.length - 1) {
        // reverse
        reversed = true;
        nextIdx = currentIdx + (directionSign * -1);
      }
      if (nextIdx >= 0 && nextIdx < route.length - 1) {
        const from = route[nextIdx];
        const to = route[nextIdx + 1];
        const dx = to[1] - from[1];
        const dy = to[0] - from[0];
        const segLen = Math.sqrt(dx * dx + dy * dy) || 1;
        const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

        return {
          from: { lat: from[0], lng: from[1], name: '' },
          to: { lat: to[0], lng: to[1], name: '' },
          currentSegment: nextIdx,
          position: overshoot,
          heading,
          length: segLen,
          direction: reversed ? (track.direction === 'East' ? 'West' : 'East') : track.direction
        };
      }
      return null;
    };

    // If newPosition goes out of bounds -> move to next segment (or reverse route)
    if (newPosition > 1 || newPosition < 0) {
      const overshoot = newPosition > 1 ? newPosition - 1 : -newPosition;
      const currentRoute = Array.isArray(track.route) ? track.route as Route : [];
      const currentSegmentIndex = track.currentSegment || 0;
      const directionSign = dir;

      const switched = switchToNextSegment(currentRoute, currentSegmentIndex, directionSign, overshoot);

      if (switched) {
        const newLat = switched.from.lat + (switched.to.lat - switched.from.lat) * switched.position!;
        const newLng = switched.from.lng + (switched.to.lng - switched.from.lng) * switched.position!;
        return {
          ...train,
          lat: newLat,
          lng: newLng,
          heading: switched.heading,
          currentTrack: {
            ...train.currentTrack,
            from: switched.from,
            to: switched.to,
            currentSegment: switched.currentSegment,
            position: switched.position,
            length: switched.length,
            heading: switched.heading,
            direction: switched.direction
          },
          lastUpdated: new Date().toISOString()
        };
      }

      // If cannot switch, clamp position and return
      newPosition = Math.max(0, Math.min(1, newPosition));
      const clampedLat = track.from.lat + (track.to.lat - track.from.lat) * newPosition;
      const clampedLng = track.from.lng + (track.to.lng - track.from.lng) * newPosition;
      return {
        ...train,
        lat: clampedLat,
        lng: clampedLng,
        heading: track.heading || train.heading,
        currentTrack: {
          ...train.currentTrack,
          position: newPosition
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Normal movement within the segment
    const newLat = track.from.lat + (track.to.lat - track.from.lat) * newPosition;
    const newLng = track.from.lng + (track.to.lng - track.from.lng) * newPosition;
    // heading: compute from from->to and convert to compass heading
    const dx = track.to.lng - track.from.lng;
    const dy = track.to.lat - track.from.lat;
    const headingRaw = (Math.atan2(dy, dx) * 180) / Math.PI;
    const compassHeading = (360 - (headingRaw + 90) % 360) % 360;

    return {
      ...train,
      lat: newLat,
      lng: newLng,
      heading: isFinite(compassHeading) ? compassHeading : (train.heading || 0),
      currentTrack: {
        ...train.currentTrack,
        position: newPosition
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // If no track and snapping failed, fallback to simple heading-based movement
  {
    const speedKmh = train.currentSpeed || 0;
    const speedMs = speedKmh * 0.277778; // km/h -> m/s

    const earthRadius = 6371000; // m
    const dtSeconds = 2; // tick duration used previously
    const deltaLat = (speedMs * dtSeconds) / earthRadius * (180 / Math.PI);
    const deltaLng = (speedMs * dtSeconds) / (earthRadius * Math.cos((train.lat * Math.PI) / 180)) * (180 / Math.PI);

    const headingRad = (train.heading || 0) * Math.PI / 180;
    const newLat = train.lat + deltaLat * Math.cos(headingRad);
    const newLng = train.lng + deltaLng * Math.sin(headingRad);

    const boundedLat = Math.max(INDIA_BOUNDS.south - 1, Math.min(INDIA_BOUNDS.north + 1, newLat));
    const boundedLng = Math.max(INDIA_BOUNDS.west - 1, Math.min(INDIA_BOUNDS.east + 1, newLng));

    let newHeading = train.heading || 0;
    if (newLat !== boundedLat) {
      newHeading = (360 - (train.heading || 0)) % 360;
    }
    if (newLng !== boundedLng) {
      newHeading = (180 - (train.heading || 0) + 360) % 360;
    }

    return {
      ...train,
      lat: boundedLat,
      lng: boundedLng,
      heading: newHeading,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Wrapper default export
function updateTrainPositionWrapper(train: Train): Train {
  return updateTrainPosition(train);
}

// Generate initial train data with realistic Indian train routes
const generateTrainData = (count: number = 10): Train[] => {
  const trains: Train[] = [];
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];
  const trainTypes: ('Express' | 'Freight' | 'Local')[] = ['Express', 'Freight', 'Local'];
  const zones = ['Central', 'Western', 'Northern', 'Southern', 'Eastern'];

  for (let i = 0; i < count; i++) {
    // Pick random origin and destination cities
    const originIndex = Math.floor(Math.random() * cities.length);
    let destIndex;
    do {
      destIndex = Math.floor(Math.random() * cities.length);
    } while (destIndex === originIndex);

    const origin = cities[originIndex];
    const destination = cities[destIndex];
    const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
    const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 60) : 0;
    const status = delay > 30 ? 'Critical' : delay > 0 ? 'Delayed' : 'On Time';

    const lat = 20.5937 + (Math.random() * 20 - 10); // Random point in India
    const lng = 78.9629 + (Math.random() * 20 - 10);
    const heading = Math.random() * 360;
    
    trains.push({
      id: `TRAIN-${10000 + i}`,
      name: `${type} ${1000 + i}`,
      type,
      status,
      zone: zones[Math.floor(Math.random() * zones.length)],
      route: `${origin} - ${destination}`,
      currentSpeed: 80 + Math.random() * 40, // 80-120 km/h
      maxSpeed: 130,
      delay,
      priority: Math.floor(Math.random() * 5) + 1,
      destination,
      nextStation: '',
      estimatedArrival: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      lastUpdated: new Date().toISOString(),
      currentTrack: {
        id: `track-${i}`,
        name: `${origin} Main Line`,
        from: { lat: 0, lng: 0 },
        to: { lat: 0, lng: 0 },
        position: 0,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        length: 0,
        maxSpeed: 130,
        isOccupied: false,
        type: 'Main'
      },
      position: 0,
      direction: Math.random() > 0.5 ? 'North' : 'South',
      lat,
      lng,
      heading
    });
  }

  return trains;
};

export { nearestPointOnSegment, updateTrainPosition, snapToNearestTrack, generateTrainData };
export default updateTrainPositionWrapper;
