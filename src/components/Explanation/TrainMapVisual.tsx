import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const TrainMapVisual: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [trainPosition, setTrainPosition] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setTrainPosition(prev => (prev + 2) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const resetAnimation = () => {
    setTrainPosition(0);
    setIsAnimating(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        How Live Train Map Works - Visual Explanation
      </h2>

      {/* Step 1: Railway Network */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">Step 1: Railway Network</h3>
        <div className="bg-gray-900 rounded-lg p-4 relative" style={{ height: '200px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 150">
            {/* Cities */}
            <circle cx="50" cy="75" r="8" fill="#3B82F6" />
            <text x="50" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Delhi</text>
            
            <circle cx="200" cy="75" r="8" fill="#3B82F6" />
            <text x="200" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Jaipur</text>
            
            <circle cx="350" cy="75" r="8" fill="#3B82F6" />
            <text x="350" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Ahmedabad</text>
            
            <circle cx="500" cy="75" r="8" fill="#3B82F6" />
            <text x="500" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Mumbai</text>

            {/* Railway Lines */}
            <line x1="58" y1="75" x2="192" y2="75" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="208" y1="75" x2="342" y2="75" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="358" y1="75" x2="492" y2="75" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5,5" />
            
            <text x="300" y="50" textAnchor="middle" fill="#F59E0B" fontSize="14" fontWeight="bold">
              Railway Track: Delhi → Jaipur → Ahmedabad → Mumbai
            </text>
          </svg>
        </div>
      </div>

      {/* Step 2: Train Placement and Movement */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-400 mb-4">Step 2: Train Movement Animation</h3>
        <div className="bg-gray-900 rounded-lg p-4 relative" style={{ height: '200px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 150">
            {/* Cities */}
            <circle cx="50" cy="75" r="8" fill="#3B82F6" />
            <text x="50" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Delhi</text>
            
            <circle cx="550" cy="75" r="8" fill="#3B82F6" />
            <text x="550" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="12">Mumbai</text>

            {/* Railway Line */}
            <line x1="58" y1="75" x2="542" y2="75" stroke="#F59E0B" strokeWidth="4" />
            
            {/* Moving Train */}
            <g transform={`translate(${58 + (484 * trainPosition / 100)}, 75)`}>
              <rect x="-12" y="-8" width="24" height="16" fill="#EF4444" rx="4" />
              <polygon points="-12,-2 -18,0 -12,2" fill="white" />
              <text x="0" y="-15" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">
                🚂 Express Train
              </text>
            </g>

            {/* Position Indicator */}
            <text x="300" y="30" textAnchor="middle" fill="#10B981" fontSize="14">
              Position: {trainPosition.toFixed(1)}% along track
            </text>
            
            {/* Speed Indicator */}
            <text x="300" y="130" textAnchor="middle" fill="#F3F4F6" fontSize="12">
              Speed: 85 km/h | Direction: East → West
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isAnimating 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Pause' : 'Start'} Animation
          </button>
          <button
            onClick={resetAnimation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Step 3: Multiple Trains */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Step 3: Multiple Trains on Network</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-medium">Express Trains</span>
              </div>
              <ul className="text-gray-300 space-y-1">
                <li>• High speed (100-120 km/h)</li>
                <li>• Passenger service</li>
                <li>• Priority routing</li>
                <li>• Long distance</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">Freight Trains</span>
              </div>
              <ul className="text-gray-300 space-y-1">
                <li>• Slower speed (60-80 km/h)</li>
                <li>• Cargo transport</li>
                <li>• Lower priority</li>
                <li>• Heavy loads</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-blue-400 font-medium">Local Trains</span>
              </div>
              <ul className="text-gray-300 space-y-1">
                <li>• Medium speed (70-90 km/h)</li>
                <li>• Regional service</li>
                <li>• Frequent stops</li>
                <li>• Short to medium distance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Real-time Updates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Step 4: Real-time Data Updates</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">What Updates Every 500ms:</h4>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Train positions (lat/lng coordinates)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Speed and direction
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Delay status
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Track occupancy
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">User Interactions:</h4>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Click train → Show details popup
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Search → Find and zoom to train
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  Filter → Show/hide train types
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  Cluster → Group nearby trains
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          🎯 The Complete Picture
        </h3>
        <div className="text-gray-300 text-center space-y-2">
          <p>
            <strong className="text-blue-400">500 virtual trains</strong> moving along 
            <strong className="text-yellow-400"> real Indian railway routes</strong>
          </p>
          <p>
            Updated <strong className="text-green-400">every 500 milliseconds</strong> to create 
            <strong className="text-purple-400"> smooth, realistic movement</strong>
          </p>
          <p>
            Interactive features allow you to <strong className="text-cyan-400">search, filter, and track</strong> any train in real-time
          </p>
          <p className="text-sm text-gray-400 mt-4">
            It's like having a live satellite view of India's entire railway network! 🛰️🚂
          </p>
        </div>
      </div>
    </div>
  );
};