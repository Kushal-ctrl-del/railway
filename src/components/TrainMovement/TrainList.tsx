import React, { useState } from 'react';
import { Brain as TrainIcon, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Train } from '../../types/train';

interface TrainListProps {
  trains: Train[];
  selectedTrain?: string;
  onSelectTrain: (trainId: string) => void;
}

export const TrainList: React.FC<TrainListProps> = ({ 
  trains, 
  selectedTrain, 
  onSelectTrain 
}) => {
  const [filter, setFilter] = useState<string>('All');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Time':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Delayed':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Express':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Freight':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Local':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTrains = filter === 'All' 
    ? trains 
    : trains.filter(train => train.type === filter);

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrainIcon className="w-5 h-5" />
          Active Trains
        </h3>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="All">All Types</option>
          <option value="Express">Express</option>
          <option value="Freight">Freight</option>
          <option value="Local">Local</option>
        </select>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTrains.map((train) => (
          <div
            key={train.id}
            onClick={() => onSelectTrain(train.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-700/50 ${
              selectedTrain === train.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 bg-gray-700/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{train.name}</span>
                {getStatusIcon(train.status)}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getTypeColor(train.type)}`}>
                {train.type}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
              <div>Speed: <span className="text-white">{train.currentSpeed} km/h</span></div>
              <div>Delay: <span className={train.delay > 10 ? 'text-red-400' : 'text-white'}>{train.delay}min</span></div>
              <div>Track: <span className="text-white">{train.currentTrack}</span></div>
              <div>Priority: <span className="text-white">{train.priority}/10</span></div>
            </div>
            
            <div className="mt-2 text-xs text-gray-400">
              → {train.destination}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};