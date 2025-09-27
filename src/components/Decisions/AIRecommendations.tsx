import React from 'react';
import { Bot, CheckCircle, X, Clock, Route, Zap, AlertTriangle } from 'lucide-react';
import { AIRecommendation, Train } from '../../types/train';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  trains: Train[];
  onAcceptRecommendation: (id: string) => void;
  onRejectRecommendation: (id: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  trains,
  onAcceptRecommendation,
  onRejectRecommendation
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'Hold':
        return <Clock className="w-4 h-4" />;
      case 'Reroute':
        return <Route className="w-4 h-4" />;
      case 'Speed':
        return <Zap className="w-4 h-4" />;
      case 'Priority':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hold':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'Reroute':
        return 'text-blue-400 bg-blue-500/20';
      case 'Speed':
        return 'text-green-400 bg-green-500/20';
      case 'Priority':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrainName = (trainId: string) => {
    return trains.find(t => t.id === trainId)?.name || trainId;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">AI Active</span>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-lg border transition-all ${
              rec.isAccepted === true
                ? 'border-green-500/50 bg-green-500/10'
                : rec.isAccepted === false
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${getTypeColor(rec.type)}`}>
                  {getRecommendationIcon(rec.type)}
                </div>
                <div>
                  <span className="font-medium text-white">{rec.type}</span>
                  <span className="text-gray-400 ml-2">→ {getTrainName(rec.trainId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Confidence:</span>
                <span className="text-xs font-medium text-white">{rec.confidence}%</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-green-400">{rec.impact}</span>
              {rec.estimatedDelay > 0 && (
                <span className="text-xs text-yellow-400">
                  +{rec.estimatedDelay}min delay
                </span>
              )}
            </div>

            {rec.isAccepted === undefined && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAcceptRecommendation(rec.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={() => onRejectRecommendation(rec.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Override
                </button>
              </div>
            )}

            {rec.isAccepted === true && (
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Accepted & Implemented
              </div>
            )}

            {rec.isAccepted === false && (
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <X className="w-4 h-4" />
                Overridden by Controller
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};