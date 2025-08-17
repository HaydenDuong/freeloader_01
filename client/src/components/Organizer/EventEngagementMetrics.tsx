import React, { useState, useEffect } from 'react';
import { engagementAPI } from '../../utils/api';
import './Organizer.css';

interface EngagementMetrics {
  totalViews: number;
  totalSaves: number;
  recentViews: number;
  recentSaves: number;
}

interface EventEngagementMetricsProps {
  eventId: number;
}

const EventEngagementMetrics: React.FC<EventEngagementMetricsProps> = ({ eventId }) => {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, [eventId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await engagementAPI.getMetrics(eventId);
      setMetrics(response.metrics);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired, handled by interceptor
        return;
      }
      setError('Failed to load engagement metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getEngagementRate = (): string => {
    if (!metrics || metrics.totalViews === 0) return '0.0';
    return ((metrics.totalSaves / metrics.totalViews) * 100).toFixed(1);
  };

  const getEngagementRateNumber = (): number => {
    if (!metrics || metrics.totalViews === 0) return 0;
    return (metrics.totalSaves / metrics.totalViews) * 100;
  };

  if (loading) {
    return (
      <div className="engagement-metrics">
        <div className="metrics-header">
          <h3>📊 Event Analytics</h3>
        </div>
        <div className="metrics-loading">
          <div className="loading-spinner"></div>
          <span>Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="engagement-metrics">
        <div className="metrics-header">
          <h3>📊 Event Analytics</h3>
        </div>
        <div className="metrics-error">
          <p>{error}</p>
          <button onClick={fetchMetrics} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="engagement-metrics">
      <div className="metrics-header">
        <h3>📊 Event Analytics</h3>
        <button onClick={fetchMetrics} className="refresh-button" title="Refresh metrics">
          🔄
        </button>
      </div>

      <div className="metrics-overview">
        <div className="metric-card primary">
          <div className="metric-icon">👁️</div>
          <div className="metric-content">
            <div className="metric-value">{formatNumber(metrics.totalViews)}</div>
            <div className="metric-label">Total Views</div>
            {metrics.recentViews > 0 && (
              <div className="metric-recent">+{metrics.recentViews} this week</div>
            )}
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">💾</div>
          <div className="metric-content">
            <div className="metric-value">{formatNumber(metrics.totalSaves)}</div>
            <div className="metric-label">Total Saves</div>
            {metrics.recentSaves > 0 && (
              <div className="metric-recent">+{metrics.recentSaves} this week</div>
            )}
          </div>
        </div>

        <div className="metric-card accent">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">{getEngagementRate()}%</div>
            <div className="metric-label">Save Rate</div>
            <div className="metric-description">Saves ÷ Views</div>
          </div>
        </div>
      </div>

      <div className="metrics-insights">
        <h4>💡 Insights</h4>
        <div className="insights-list">
          {metrics.totalViews === 0 && (
            <div className="insight">
              <span className="insight-icon">🚀</span>
              <span>Your event hasn't been viewed yet. Share it to get more visibility!</span>
            </div>
          )}
          
          {metrics.totalViews > 0 && metrics.totalSaves === 0 && (
            <div className="insight">
              <span className="insight-icon">💡</span>
              <span>People are viewing but not saving. Consider highlighting your free goods!</span>
            </div>
          )}
          
          {getEngagementRateNumber() >= 20 && (
            <div className="insight success">
              <span className="insight-icon">🎉</span>
              <span>Great engagement! {getEngagementRate()}% of viewers are saving your event.</span>
            </div>
          )}
          
          {metrics.recentViews > metrics.recentSaves * 3 && metrics.recentViews > 5 && (
            <div className="insight">
              <span className="insight-icon">📅</span>
              <span>Many recent views! Consider updating your event details to encourage saves.</span>
            </div>
          )}
          
          {metrics.totalViews > 50 && getEngagementRateNumber() < 10 && (
            <div className="insight">
              <span className="insight-icon">🎯</span>
              <span>Consider improving your event description or adding more attractive free goods.</span>
            </div>
          )}
        </div>
      </div>

      <div className="metrics-footer">
        <small>
          📊 Analytics track unique student interactions
          <br />
          📈 Updated in real-time as students engage with your event
        </small>
      </div>
    </div>
  );
};

export default EventEngagementMetrics;
