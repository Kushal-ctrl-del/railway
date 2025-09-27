import React, { useEffect, useState } from 'react';
import { Train, TrackSegment } from '../../types/train';

interface TrackMapProps {
  trains: Train[];
  tracks: TrackSegment[];
  selectedTrain?: string;
}

export const TrackMap: React.FC<TrackMapProps> = ({ trains, tracks, selectedTrain }) => {
  const [animatedPositions, setAnimatedPositions] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const positions = trains.reduce((acc, train) => {
      acc[train.id] = train.position;
      return acc;
    }, {} as { [key: string]: number });
    setAnimatedPositions(positions);

    // Simulate train movement
    const interval = setInterval(() => {
      setAnimatedPositions(prev => {
        const newPositions = { ...prev };
        trains.forEach(train => {
          if (train.currentSpeed > 0) {
            const speedFactor = train.currentSpeed / 1000; // Adjust animation speed
            const direction = train.direction === 'East' ? 1 : -1;
            newPositions[train.id] = (newPositions[train.id] + speedFactor * direction) % 100;
            if (newPositions[train.id] < 0) newPositions[train.id] = 100;
          }
        });
        return newPositions;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [trains]);

  const getTrainColor = (train: Train) => {
    switch (train.type) {
      case 'Express':
        return '#3B82F6'; // Blue
      case 'Freight':
        return '#F97316'; // Orange
      case 'Local':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getTrackForTrain = (trainId: string) => {
    const train = trains.find(t => t.id === trainId);
    return tracks.find(track => track.id === train?.currentTrack);
  };

  const calculateTrainPosition = (train: Train, track: TrackSegment) => {
    const position = animatedPositions[train.id] || train.position;
    const x = track.startX + (track.endX - track.startX) * (position / 100);
    const y = track.startY + (track.endY - track.startY) * (position / 100);
    return { x, y };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        Live Track View
      </h3>
      
      <div className="bg-gray-900 rounded-lg p-4 relative overflow-hidden" style={{ height: '400px' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 400" className="border border-gray-700 rounded">
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Track segments */}
          {tracks.map((track) => (
            <g key={track.id}>
              <line
                x1={track.startX}
                y1={track.startY}
                x2={track.endX}
                y2={track.endY}
                stroke={track.isOccupied ? '#EF4444' : '#10B981'}
                strokeWidth="6"
                className="transition-colors duration-300"
              />
              <text
                x={(track.startX + track.endX) / 2}
                y={track.startY - 10}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="middle"
                className="select-none"
              >
                {track.name}
              </text>
            </g>
          ))}
          
          {/* Stations */}
          {[
            { x: 50, y: 180, name: 'Station A' },
            { x: 400, y: 130, name: 'Station B' },
            { x: 750, y: 180, name: 'Station C' }
          ].map((station, index) => (
            <g key={index}>
              <rect
                x={station.x - 15}
                y={station.y - 15}
                width="30"
                height="30"
                fill="#1F2937"
                stroke="#6B7280"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={station.x}
                y={station.y + 5}
                fill="#F3F4F6"
                fontSize="10"
                textAnchor="middle"
                className="select-none font-medium"
              >
                STA
              </text>
              <text
                x={station.x}
                y={station.y + 40}
                fill="#9CA3AF"
                fontSize="10"
                textAnchor="middle"
                className="select-none"
              >
                {station.name}
              </text>
            </g>
          ))}
          
          {/* Trains */}
          {trains.map((train) => {
            const track = getTrackForTrain(train.id);
            if (!track) return null;
            
            const position = calculateTrainPosition(train, track);
            const isSelected = selectedTrain === train.id;
            
            return (
              <g key={train.id}>
                {/* Train icon */}
                <rect
                  x={position.x - 12}
                  y={position.y - 8}
                  width="24"
                  height="16"
                  fill={getTrainColor(train)}
                  stroke={isSelected ? '#FBBF24' : 'transparent'}
                  strokeWidth="2"
                  rx="3"
                  className="transition-all duration-300 cursor-pointer hover:stroke-gray-300"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
                  }}
                />
                
                {/* Direction indicator */}
                <polygon
                  points={train.direction === 'East' 
                    ? `${position.x + 12},${position.y - 2} ${position.x + 18},${position.y} ${position.x + 12},${position.y + 2}`
                    : `${position.x - 12},${position.y - 2} ${position.x - 18},${position.y} ${position.x - 12},${position.y + 2}`
                  }
                  fill="white"
                />
                
                {/* Train label */}
                <text
                  x={position.x}
                  y={position.y - 15}
                  fill="#F3F4F6"
                  fontSize="10"
                  textAnchor="middle"
                  className="select-none font-medium"
                  style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {train.name}
                </text>
                
                {/* Speed indicator */}
                <text
                  x={position.x}
                  y={position.y + 25}
                  fill="#9CA3AF"
                  fontSize="8"
                  textAnchor="middle"
                  className="select-none"
                >
                  {train.currentSpeed} km/h
                </text>
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="180" height="80" fill="#111827" stroke="#374151" rx="4" opacity="0.9"/>
            <text x="10" y="15" fill="#F3F4F6" fontSize="12" className="font-medium">Train Types</text>
            
            {[
              { type: 'Express', color: '#3B82F6', y: 30 },
              { type: 'Freight', color: '#F97316', y: 45 },
              { type: 'Local', color: '#10B981', y: 60 }
            ].map(({ type, color, y }) => (
              <g key={type}>
                <rect x="10" y={y} width="16" height="10" fill={color} rx="2"/>
                <text x="35" y={y + 8} fill="#D1D5DB" fontSize="10">{type}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};