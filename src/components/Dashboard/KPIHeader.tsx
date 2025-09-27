import React from 'react';
import { Brain as Train, Clock, Activity, Gauge } from 'lucide-react';
import { KPIData } from '../../types/train';

interface KPIHeaderProps {
  data: KPIData;
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({ data }) => {
  const kpiItems = [
    {
      icon: Train,
      label: 'Total Trains',
      value: data.totalTrains,
      unit: '',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Clock,
      label: 'Avg Delay',
      value: data.averageDelay,
      unit: 'min',
      color: data.averageDelay > 10 ? 'text-red-400' : 'text-yellow-400',
      bgColor: data.averageDelay > 10 ? 'bg-red-500/20' : 'bg-yellow-500/20'
    },
    {
      icon: Activity,
      label: 'Throughput',
      value: data.throughput,
      unit: '/hr',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: Gauge,
      label: 'Utilization',
      value: data.utilization,
      unit: '%',
      color: data.utilization > 80 ? 'text-orange-400' : 'text-cyan-400',
      bgColor: data.utilization > 80 ? 'bg-orange-500/20' : 'bg-cyan-500/20'
    }
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Rail Control Center</h1>
            <p className="text-sm text-gray-400">Live System Status</p>
          </div>
        </div>
        
        <div className="flex gap-8">
          {kpiItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-lg font-bold text-white">
                    {item.value}{item.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">System Online</span>
        </div>
      </div>
    </div>
  );
};