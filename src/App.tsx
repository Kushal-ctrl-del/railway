import React, { useState, useEffect } from 'react';
import { KPIHeader } from './components/Dashboard/KPIHeader';
import { TrainList } from './components/TrainMovement/TrainList';
import { LiveTrainMap } from './components/TrainMovement/LiveTrainMap';
import { AIRecommendations } from './components/Decisions/AIRecommendations';
import { WhatIfPanel } from './components/Simulation/WhatIfPanel';
import { PerformanceCharts } from './components/Analytics/PerformanceCharts';
import { TrainMapVisual } from './components/Explanation/TrainMapVisual';
import { 
  mockTrains, 
  mockTracks, 
  mockRecommendations, 
  mockKPIs 
} from './utils/mockData';
import { Train, AIRecommendation, KPIData } from './types/train';

function App() {
  const [trains, setTrains] = useState<Train[]>(mockTrains);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockRecommendations);
  const [kpis, setKPIs] = useState<KPIData>(mockKPIs);
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update train positions and speeds slightly
      setTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          currentSpeed: Math.max(0, train.currentSpeed + (Math.random() - 0.5) * 10),
          delay: Math.max(0, train.delay + (Math.random() - 0.7) * 2),
          position: (train.position + (train.currentSpeed / 100)) % 100
        }))
      );

      // Update KPIs
      setKPIs(prev => ({
        ...prev,
        averageDelay: Math.max(0, prev.averageDelay + (Math.random() - 0.6) * 1),
        throughput: Math.max(0, prev.throughput + (Math.random() - 0.5) * 2),
        utilization: Math.min(100, Math.max(0, prev.utilization + (Math.random() - 0.5) * 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, isAccepted: true } : rec
      )
    );
  };

  const handleRejectRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, isAccepted: false } : rec
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with KPIs */}
      <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-6 py-2">
        <KPIHeader data={kpis} />
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
        >
          {showExplanation ? 'Hide' : 'Show'} How It Works
        </button>
      </div>
      
      {/* Explanation Panel */}
      {showExplanation && (
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <TrainMapVisual />
        </div>
      )}
      
      {/* Main Layout */}
      <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Left Sidebar - Train List */}
        <div className="col-span-3">
          <TrainList
            trains={trains}
            selectedTrain={selectedTrain}
            onSelectTrain={setSelectedTrain}
          />
        </div>
        
        {/* Center - Track Map */}
        <div className="col-span-6">
          <LiveTrainMap
            selectedTrain={selectedTrain}
            onSelectTrain={setSelectedTrain}
          />
        </div>
        
        {/* Right Sidebar - Simulation Panel */}
        <div className="col-span-3">
          <WhatIfPanel trains={trains} />
        </div>
        
        {/* Bottom Panel - AI Recommendations */}
        <div className="col-span-8">
          <AIRecommendations
            recommendations={recommendations}
            trains={trains}
            onAcceptRecommendation={handleAcceptRecommendation}
            onRejectRecommendation={handleRejectRecommendation}
          />
        </div>
        
        {/* Bottom Right - Analytics */}
        <div className="col-span-4">
          <PerformanceCharts />
        </div>
      </div>
    </div>
  );
}

export default App;