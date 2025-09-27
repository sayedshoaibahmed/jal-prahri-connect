import React, { useEffect, useState } from 'react';
import { MapPin, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock map component - In real app, use Leaflet or Google Maps
const PumpMap = ({ pumps, reports }) => {
  const [selectedPump, setSelectedPump] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });

  // Calculate map bounds to show all pumps
  useEffect(() => {
    if (pumps.length > 0) {
      const avgLat = pumps.reduce((sum, pump) => sum + pump.location.lat, 0) / pumps.length;
      const avgLng = pumps.reduce((sum, pump) => sum + pump.location.lng, 0) / pumps.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [pumps]);

  const getPumpIcon = (pump) => {
    if (pump.status === 'faulty') return '🔴';
    if (pump.isRunning) return '🟢';
    return '🟡';
  };

  const getReportIcon = (report) => {
    if (report.priority === 'high') return '⚠️';
    if (report.type === 'water_quality') return '🧪';
    return '📢';
  };

  const getPumpStatusColor = (pump) => {
    if (pump.status === 'faulty') return 'bg-status-faulty';
    if (pump.isRunning) return 'bg-status-working';
    return 'bg-status-offline';
  };

  return (
    <div className="space-y-4">
      {/* Mock Map Container */}
      <div className="relative bg-muted rounded-lg h-64 overflow-hidden">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 opacity-50"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '20px 20px'
             }}>
        </div>

        {/* Pump Markers */}
        {pumps.map((pump, index) => (
          <div
            key={pump.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + (index % 2) * 40}%`
            }}
            onClick={() => setSelectedPump(selectedPump === pump.id ? null : pump.id)}
          >
            {/* Pump Marker */}
            <div className={`w-8 h-8 rounded-full ${getPumpStatusColor(pump)} flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform`}>
              {pump.name.slice(-1)}
            </div>
            
            {/* Pump Label */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
              {pump.name}
            </div>
          </div>
        ))}

        {/* Report Markers */}
        {reports.map((report, index) => {
          const pump = pumps.find(p => p.id === report.pumpId);
          if (!pump) return null;
          
          return (
            <div
              key={report.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${22 + pumps.findIndex(p => p.id === report.pumpId) * 25}%`,
                top: `${20 + (pumps.findIndex(p => p.id === report.pumpId) % 2) * 40}%`
              }}
            >
              <div className="w-4 h-4 bg-alert rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                !
              </div>
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-lg">
          <div className="text-xs font-medium mb-1">स्थिति:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-status-working"></div>
              चालू
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-status-offline"></div>
              बंद
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-status-faulty"></div>
              खराब
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-alert"></div>
              अलर्ट
            </div>
          </div>
        </div>

        {/* Zoom Controls Mock */}
        <div className="absolute top-4 right-4 bg-white rounded shadow-lg">
          <button className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
          <div className="border-t border-gray-200"></div>
          <button className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
        </div>
      </div>

      {/* Pump Details */}
      {selectedPump && (
        <Card className="p-4">
          {(() => {
            const pump = pumps.find(p => p.id === selectedPump);
            const pumpReports = reports.filter(r => r.pumpId === selectedPump);
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {pump.name}
                  </h3>
                  
                  <Badge className={getPumpStatusColor(pump)}>
                    {pump.status === 'working' && pump.isRunning ? 'चालू' :
                     pump.status === 'working' ? 'बंद' :
                     pump.status === 'faulty' ? 'खराब' : 'मरम्मत'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">आज के घंटे</div>
                    <div className="font-medium">{pump.hoursToday}h</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">सप्ताह के घंटे</div>
                    <div className="font-medium">{pump.hoursWeek}h</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-muted-foreground">स्थान</div>
                  <div className="text-sm font-mono">
                    {pump.location.lat.toFixed(6)}, {pump.location.lng.toFixed(6)}
                  </div>
                </div>

                {pumpReports.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">हाल की रिपोर्ट्स</div>
                    {pumpReports.slice(0, 2).map(report => (
                      <div key={report.id} className="text-sm p-2 bg-muted rounded mb-1">
                        <div className="flex items-center justify-between">
                          <span>{report.type === 'water_quality' ? 'जल गुणवत्ता' : 'आवाज रिपोर्ट'}</span>
                          <Badge size="sm" variant={
                            report.priority === 'high' ? 'destructive' :
                            report.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {report.priority === 'high' ? 'उच्च' :
                             report.priority === 'medium' ? 'मध्यम' : 'कम'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(report.timestamp).toLocaleString('hi-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}

      {/* Map Instructions */}
      <div className="text-sm text-muted-foreground text-center">
        <p>📍 पंप मार्करों पर क्लिक करें विस्तृत जानकारी के लिए</p>
        <p className="text-xs mt-1">
          वास्तविक ऐप में यहां Leaflet/Google Maps होगा
        </p>
      </div>
    </div>
  );
};

export default PumpMap;