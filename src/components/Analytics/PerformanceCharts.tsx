import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';

const performanceData = [
  { time: '00:00', delay: 5, throughput: 28, utilization: 65 },
  { time: '04:00', delay: 3, throughput: 15, utilization: 45 },
  { time: '08:00', delay: 12, throughput: 35, utilization: 85 },
  { time: '12:00', delay: 8, throughput: 32, utilization: 78 },
  { time: '16:00', delay: 15, throughput: 38, utilization: 92 },
  { time: '20:00', delay: 6, throughput: 24, utilization: 68 }
];

const trainTypeData = [
  { type: 'Express', count: 18, onTime: 85 },
  { type: 'Freight', count: 23, onTime: 72 },
  { type: 'Local', count: 15, onTime: 91 }
];

export const PerformanceCharts: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-bold text-white">82.4%</div>
          <div className="text-xs text-green-400">↑ 3.2% vs yesterday</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Avg Speed</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">67 km/h</div>
          <div className="text-xs text-blue-400">↑ 1.8% vs yesterday</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Incidents</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-white">3</div>
          <div className="text-xs text-red-400">↓ 2 vs yesterday</div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Delay Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Delay Trends (24h)</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="delay"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Train Type Performance */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Performance by Train Type</h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="onTime" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};