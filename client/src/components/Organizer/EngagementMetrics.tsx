import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../utils/api';

interface EventMetric {
  id: number;
  title: string;
  date_time: string;
  created_at: string;
  unique_views: number;
  rsvp_count: number;
}

interface MetricsSummary {
  totalEvents: number;
  totalViews: number;
  totalRsvps: number;
  avgViewsPerEvent: number;
  avgRsvpsPerEvent: number;
}

interface EngagementMetricsProps {
  onClose: () => void;
}

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<EventMetric[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await eventsAPI.getEngagementMetrics();
      setMetrics(response.events);
      setSummary(response.summary);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateEngagementRate = (views: number, rsvps: number) => {
    if (views === 0) return 0;
    return ((rsvps / views) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="metrics-modal">
        <div className="metrics-content">
          <div className="loading">Loading metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-modal">
        <div className="metrics-content">
          <div className="metrics-header">
            <h3>📊 Engagement Metrics</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-modal">
      <div className="metrics-content">
        <div className="metrics-header">
          <h3>📊 Engagement Metrics</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {summary && (
          <div className="metrics-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <div className="card-number">{summary.totalEvents}</div>
                  <div className="card-label">Total Events</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-icon">👀</div>
                <div className="card-content">
                  <div className="card-number">{summary.totalViews}</div>
                  <div className="card-label">Total Views</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-icon">💾</div>
                <div className="card-content">
                  <div className="card-number">{summary.totalRsvps}</div>
                  <div className="card-label">Total Saves</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-icon">📈</div>
                <div className="card-content">
                  <div className="card-number">{summary.avgViewsPerEvent}</div>
                  <div className="card-label">Avg Views/Event</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="metrics-table-container">
          <h4>Event Performance</h4>
          {metrics.length === 0 ? (
            <div className="no-metrics">
              <p>No events created yet. Create your first event to see engagement metrics!</p>
            </div>
          ) : (
            <div className="metrics-table">
              <div className="table-header">
                <div className="header-cell">Event</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Views</div>
                <div className="header-cell">Saves</div>
                <div className="header-cell">Rate</div>
              </div>
              
              {metrics.map((event) => (
                <div key={event.id} className="table-row">
                  <div className="table-cell event-title-cell">
                    <div className="event-title-truncated">{event.title}</div>
                  </div>
                  <div className="table-cell">{formatDate(event.date_time)}</div>
                  <div className="table-cell">
                    <span className="metric-badge views">{event.unique_views}</span>
                  </div>
                  <div className="table-cell">
                    <span className="metric-badge saves">{event.rsvp_count}</span>
                  </div>
                  <div className="table-cell">
                    <span className="metric-badge rate">
                      {calculateEngagementRate(event.unique_views, event.rsvp_count)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="metrics-footer">
          <p className="metrics-note">
            💡 <strong>Tip:</strong> Views are counted once per unique student. 
            Saves represent students who clicked "I'm Interested".
          </p>
        </div>
      </div>
    </div>
  );
};

export default EngagementMetrics;
