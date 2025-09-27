import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Plus, 
  Mic, 
  TestTube, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PumpCard from '@/components/PumpCard';
import ReportModal from '@/components/ReportModal';
import WaterQualityModal from '@/components/WaterQualityModal';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';
import translations from '@/locales/hi.json';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pumps, setPumps] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock pump data - in real app, fetch from API
  useEffect(() => {
    const mockPumps = [
      {
        id: 'pump_001',
        name: 'मुख्य पंप 1',
        status: 'working',
        isRunning: false,
        hoursToday: 4.5,
        hoursWeek: 28.5,
        location: { lat: 28.6139, lng: 77.2090 },
        lastMaintenance: '2024-01-15'
      },
      {
        id: 'pump_002', 
        name: 'बैकअप पंप 2',
        status: 'working',
        isRunning: true,
        hoursToday: 6.2,
        hoursWeek: 35.8,
        location: { lat: 28.6129, lng: 77.2100 },
        lastMaintenance: '2024-01-10'
      },
      {
        id: 'pump_003',
        name: 'रिजर्व पंप 3', 
        status: 'faulty',
        isRunning: false,
        hoursToday: 0,
        hoursWeek: 12.3,
        location: { lat: 28.6149, lng: 77.2080 },
        lastMaintenance: '2024-01-20'
      }
    ];
    
    setPumps(mockPumps);
    setCurrentUser(authService.getCurrentUser());
    updateSyncStatus();
  }, []);

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = async () => {
    const status = await syncService.getSyncStatus();
    setSyncStatus(status);
  };

  const handlePumpStatusChange = (pumpId, newStatus) => {
    setPumps(prev => prev.map(pump => 
      pump.id === pumpId ? { ...pump, ...newStatus } : pump
    ));
  };

  const handleManualSync = async () => {
    try {
      await syncService.syncPendingData();
      await updateSyncStatus();
      
      toast({
        title: 'सिंक पूर्ण',
        description: 'सभी डेटा सफलतापूर्वक सिंक हो गया'
      });
    } catch (error) {
      toast({
        title: 'सिंक त्रुटि',
        description: 'डेटा सिंक करने में समस्या हुई',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    toast({
      title: 'लॉगआउट सफल',
      description: 'आपका सत्र समाप्त हो गया है'
    });
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const activePumps = pumps.filter(p => p.status === 'working').length;
  const runningPumps = pumps.filter(p => p.isRunning).length;
  const faultyPumps = pumps.filter(p => p.status === 'faulty').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{translations.operator.dashboard}</h1>
            <p className="text-sm opacity-90">नमस्ते, {currentUser.phone}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sync Status */}
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <Wifi className="w-4 h-4 text-status-working" />
              ) : (
                <WifiOff className="w-4 h-4 text-status-offline" />
              )}
              
              {syncStatus.pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {syncStatus.pendingCount} लंबित
                </Badge>
              )}
              
              {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManualSync}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  सिंक
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-primary">{pumps.length}</div>
            <div className="text-xs text-muted-foreground">कुल पंप</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-status-working">{runningPumps}</div>
            <div className="text-xs text-muted-foreground">चालू पंप</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-status-faulty">{faultyPumps}</div>
            <div className="text-xs text-muted-foreground">खराब पंप</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={() => setShowReportModal(true)}
            className="btn-touch-lg bg-primary hover:bg-primary-hover shadow-button"
          >
            <Mic className="w-5 h-5 mr-3" />
            {translations.operator.addReport}
          </Button>
          
          <Button
            onClick={() => setShowQualityModal(true)}
            className="btn-touch-lg bg-secondary hover:bg-secondary-hover shadow-button"
          >
            <TestTube className="w-5 h-5 mr-3" />
            {translations.operator.waterQuality}
          </Button>
        </div>

        {/* Pump List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {translations.operator.pumpList}
          </h2>
          
          {pumps.map(pump => (
            <PumpCard
              key={pump.id}
              pump={pump}
              onStatusChange={handlePumpStatusChange}
              translations={translations}
            />
          ))}
        </div>

        {/* Sync Status Card */}
        {syncStatus.pendingCount > 0 && (
          <Card className="p-4 bg-muted">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">डेटा सिंक</h3>
                <p className="text-sm text-muted-foreground">
                  {syncStatus.pendingCount} आइटम सिंक के लिए बाकी हैं
                </p>
              </div>
              
              {syncStatus.isSyncing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  सिंक हो रहा है...
                </div>
              ) : syncStatus.isOnline ? (
                <Button
                  size="sm"
                  onClick={handleManualSync}
                  className="btn-touch"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  अभी सिंक करें
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  ऑनलाइन होने पर सिंक होगा
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        pumps={pumps}
        translations={translations}
      />
      
      <WaterQualityModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        pumps={pumps}
        translations={translations}
      />
    </div>
  );
};

export default OperatorDashboard;