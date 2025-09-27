import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AlertsPanel = ({ alerts, onAlertAction, translations }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-status-faulty';
      case 'warning': return 'bg-status-maintenance';
      case 'info': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical': return 'गंभीर';
      case 'warning': return 'चेतावनी';
      case 'info': return 'जानकारी';
      default: return 'सामान्य';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'नया';
      case 'acknowledged': return 'स्वीकार किया';
      case 'resolved': return 'हल किया';
      default: return status;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'pump_failure': return '⚙️';
      case 'water_quality': return '🧪';
      case 'maintenance': return '🔧';
      case 'leak': return '💧';
      default: return '⚠️';
    }
  };

  const sortedAlerts = alerts.sort((a, b) => {
    // Sort by severity (critical first) then by timestamp (newest first)
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    
    if (severityDiff !== 0) return severityDiff;
    
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-status-working mx-auto mb-3" />
        <h3 className="font-medium text-foreground mb-1">कोई अलर्ट नहीं</h3>
        <p className="text-sm text-muted-foreground">सभी सिस्टम सामान्य रूप से काम कर रहे हैं</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">सभी अलर्ट ({alerts.length})</h3>
        
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-faulty"></div>
            <span>गंभीर</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-maintenance"></div>
            <span>चेतावनी</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>जानकारी</span>
          </div>
        </div>
      </div>

      {sortedAlerts.map(alert => (
        <Card key={alert.id} className={`p-4 border-l-4 ${
          alert.severity === 'critical' ? 'border-l-status-faulty' :
          alert.severity === 'warning' ? 'border-l-status-maintenance' :
          'border-l-primary'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                
                <Badge className={`text-white ${getSeverityColor(alert.severity)}`}>
                  {getSeverityText(alert.severity)}
                </Badge>
                
                <Badge variant="outline">
                  {getStatusText(alert.status)}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString('hi-IN')}
                </span>
              </div>

              <h4 className="font-medium text-foreground mb-1">
                {alert.type === 'pump_failure' ? 'पंप खराबी' :
                 alert.type === 'water_quality' ? 'जल गुणवत्ता अलर्ट' :
                 alert.type === 'maintenance' ? 'मरम्मत आवश्यक' :
                 alert.type === 'leak' ? 'लीकेज रिपोर्ट' :
                 'सामान्य अलर्ट'}
              </h4>

              <p className="text-sm text-muted-foreground mb-2">
                {alert.message}
              </p>

              {alert.pumpId && (
                <div className="text-xs text-muted-foreground">
                  पंप आईडी: {alert.pumpId}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 ml-3">
              {alert.status === 'new' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAlertAction(alert.id, 'acknowledged')}
                    className="h-8 px-3"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    देखा
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAlertAction(alert.id, 'resolved')}
                    className="h-8 px-3 bg-primary hover:bg-primary-hover"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    हल करें
                  </Button>
                </>
              )}

              {alert.status === 'acknowledged' && (
                <Button
                  size="sm"
                  onClick={() => onAlertAction(alert.id, 'resolved')}
                  className="h-8 px-3 bg-primary hover:bg-primary-hover"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  हल करें
                </Button>
              )}

              {alert.status === 'resolved' && (
                <div className="text-xs text-status-working text-center">
                  ✓ हल किया गया
                </div>
              )}
            </div>
          </div>

          {/* Time since alert */}
          <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {(() => {
              const diffMs = Date.now() - new Date(alert.timestamp).getTime();
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMins / 60);
              
              if (diffMins < 60) {
                return `${diffMins} मिनट पहले`;
              } else if (diffHours < 24) {
                return `${diffHours} घंटे पहले`;
              } else {
                const diffDays = Math.floor(diffHours / 24);
                return `${diffDays} दिन पहले`;
              }
            })()}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AlertsPanel;