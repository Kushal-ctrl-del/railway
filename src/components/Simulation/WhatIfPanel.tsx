import React, { useState } from 'react';
import { Play, RotateCcw, Settings, TrendingUp } from 'lucide-react';
import { Train } from '../../types/train';

interface WhatIfPanelProps {
  trains: Train[];
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({ trains }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('delay');
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [delayAmount, setDelayAmount] = useState<number>(15);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const scenarios = [
    { id: 'delay', name: 'Train Delay', description: 'Add delay to specific train' },
    { id: 'maintenance', name: 'Track Closure', description: 'Close track for maintenance' },
    { id: 'priority', name: 'Priority Change', description: 'Change train priority' },
    { id: 'weather', name: 'Weather Impact', description: 'Simulate weather conditions' }
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Simulate processing time
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">What-If Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* Scenario Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scenario Type
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-cyan-500 focus:outline-none"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {scenarios.find(s => s.id === selectedScenario)?.description}
          </p>
        </div>

        {/* Train Selection */}
        {(selectedScenario === 'delay' || selectedScenario === 'priority') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Train
            </label>
            <select
              value={selectedTrain}
              onChange={(e) => setSelectedTrain(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Choose a train...</option>
              {trains.map((train) => (
                <option key={train.id} value={train.id}>
                  {train.name} ({train.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Parameters */}
        {selectedScenario === 'delay' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delay Amount (minutes)
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={delayAmount}
              onChange={(e) => setDelayAmount(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5min</span>
              <span className="text-white font-medium">{delayAmount}min</span>
              <span>60min</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || (selectedScenario !== 'weather' && selectedScenario !== 'maintenance' && !selectedTrain)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? 'Running...' : 'Run Simulation'}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Results Preview */}
        {isSimulating && (
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-cyan-400 font-medium">Processing Simulation...</span>
            </div>
            <p className="text-xs text-gray-400">
              Analyzing impact on {trains.length} trains and 4 track segments...
            </p>
          </div>
        )}

        {/* Impact Summary */}
        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Expected Impact</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-400">
              Avg Delay: <span className="text-red-400 font-medium">+3.2min</span>
            </div>
            <div className="text-gray-400">
              Throughput: <span className="text-yellow-400 font-medium">-8%</span>
            </div>
            <div className="text-gray-400">
              Affected Trains: <span className="text-white font-medium">6</span>
            </div>
            <div className="text-gray-400">
              Recovery Time: <span className="text-cyan-400 font-medium">22min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};