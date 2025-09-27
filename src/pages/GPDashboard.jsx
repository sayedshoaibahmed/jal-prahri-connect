import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PumpMap from '@/components/PumpMap';
import AlertsPanel from '@/components/AlertsPanel';
import SimpleChart from '@/components/SimpleChart';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';
import translations from '@/locales/hi.json';

const GPDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [pumps, setPumps] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({});

  // Initialize data
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock data - in real app, fetch from API/local storage
    const mockPumps = [
      {
        id: 'pump_001',
        name: 'मुख्य पंप 1',
        status: 'working',
        isRunning: true,
        location: { lat: 28.6139, lng: 77.2090 },
        hoursToday: 6.5,
        hoursWeek: 42.3,
        lastMaintenance: '2024-01-15'
      },
      {
        id: 'pump_002',
        name: 'बैकअप पंप 2', 
        status: 'working',
        isRunning: false,
        location: { lat: 28.6129, lng: 77.2100 },
        hoursToday: 4.2,
        hoursWeek: 28.7,
        lastMaintenance: '2024-01-10'
      },
      {
        id: 'pump_003',
        name: 'रिजर्व पंप 3',
        status: 'faulty', 
        isRunning: false,
        location: { lat: 28.6149, lng: 77.2080 },
        hoursToday: 0,
        hoursWeek: 8.5,
        lastMaintenance: '2024-01-20'
      }
    ];

    const mockReports = [
      {
        id: 'report_001',
        type: 'voice_report',
        pumpId: 'pump_003',
        description: 'पंप से अजीब आवाज आ रही है',
        timestamp: '2024-01-25T10:30:00Z',
        location: { lat: 28.6149, lng: 77.2080 },
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'report_002',
        type: 'water_quality',
        pumpId: 'pump_001',
        parameters: { ph: 8.9, turbidity: 2.1 },
        timestamp: '2024-01-25T09:15:00Z',
        status: 'viewed',
        priority: 'medium'
      }
    ];

    const mockAlerts = [
      {
        id: 'alert_001',
        type: 'pump_failure',
        pumpId: 'pump_003',
        message: 'पंप 3 में खराबी - तुरंत जांच की जरूरत',
        timestamp: '2024-01-25T10:30:00Z',
        severity: 'critical',
        status: 'new'
      },
      {
        id: 'alert_002', 
        type: 'water_quality',
        pumpId: 'pump_001',
        message: 'पानी की गुणवत्ता चेतावनी स्तर पर',
        timestamp: '2024-01-25T09:15:00Z',
        severity: 'warning',
        status: 'acknowledged'
      }
    ];

    const mockAnalytics = {
      totalRunningHours: 156.7,
      avgDailyHours: 22.4,
      maintenanceAlerts: 3,
      qualityChecks: 15,
      weeklyData: [
        { day: 'सोम', hours: 20.5 },
        { day: 'मंगल', hours: 22.1 },
        { day: 'बुध', hours: 24.2 },
        { day: 'गुरु', hours: 19.8 },
        { day: 'शुक्र', hours: 23.7 },
        { day: 'शनि', hours: 21.4 },
        { day: 'रवि', hours: 25.0 }
      ]
    };

    setPumps(mockPumps);
    setReports(mockReports);
    setAlerts(mockAlerts);
    setAnalytics(mockAnalytics);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    toast({
      title: 'लॉगआउट सफल',
      description: 'आपका सत्र समाप्त हो गया है'
    });
  };

  const handleReportAction = (reportId, action) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action === 'view' ? 'viewed' : 'resolved' }
        : report
    ));
    
    toast({
      title: action === 'view' ? 'रिपोर्ट देखी गई' : 'कार्रवाई पूर्ण',
      description: 'रिपोर्ट की स्थिति अपडेट हो गई'
    });
  };

  const handleAlertAction = (alertId, action) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action }
        : alert
    ));
    
    toast({
      title: 'अलर्ट अपडेट',
      description: 'अलर्ट की स्थिति अपडेट हो गई'
    });
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const totalPumps = pumps.length;
  const workingPumps = pumps.filter(p => p.status === 'working').length;
  const runningPumps = pumps.filter(p => p.isRunning).length;
  const faultyPumps = pumps.filter(p => p.status === 'faulty').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{translations.gp.dashboard}</h1>
            <p className="text-sm opacity-90">नमस्ते, {currentUser.phone}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-primary">{totalPumps}</div>
            <div className="text-xs text-muted-foreground">{translations.gp.totalPumps}</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-status-working">{runningPumps}</div>
            <div className="text-xs text-muted-foreground">चालू पंप</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-status-faulty">{faultyPumps}</div>
            <div className="text-xs text-muted-foreground">{translations.gp.faultyPumps}</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-alert">{newAlerts}</div>
            <div className="text-xs text-muted-foreground">नए अलर्ट</div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">अवलोकन</TabsTrigger>
            <TabsTrigger value="map">नक्शा</TabsTrigger>
            <TabsTrigger value="alerts">अलर्ट</TabsTrigger>
            <TabsTrigger value="reports">रिपोर्ट्स</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Analytics Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                साप्ताहिक पंप उपयोग
              </h3>
              <SimpleChart data={analytics.weeklyData} />
            </Card>

            {/* Pump Status Grid */}
            <div className="grid gap-3">
              <h3 className="font-semibold">{translations.gp.pumpOverview}</h3>
              {pumps.map(pump => (
                <Card key={pump.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        pump.status === 'working' && pump.isRunning ? 'bg-status-working' :
                        pump.status === 'working' ? 'bg-muted' :
                        pump.status === 'faulty' ? 'bg-status-faulty' :
                        'bg-status-maintenance'
                      }`}></div>
                      
                      <div>
                        <h4 className="font-medium">{pump.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {pump.isRunning ? 'चालू' : 'बंद'} • 
                          आज: {pump.hoursToday}घं • 
                          सप्ताह: {pump.hoursWeek}घं
                        </div>
                      </div>
                    </div>

                    <Badge variant={
                      pump.status === 'working' ? 'default' :
                      pump.status === 'faulty' ? 'destructive' :
                      'secondary'
                    }>
                      {pump.status === 'working' ? 'कार्यरत' :
                       pump.status === 'faulty' ? 'खराब' : 'मरम्मत'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                पंप स्थान और रिपोर्ट्स
              </h3>
              <PumpMap pumps={pumps} reports={reports} />
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsPanel 
              alerts={alerts} 
              onAlertAction={handleAlertAction}
              translations={translations}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-3">
            <h3 className="font-semibold">सभी रिपोर्ट्स</h3>
            
            {reports.map(report => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        report.priority === 'high' ? 'destructive' :
                        report.priority === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {report.priority === 'high' ? 'उच्च' :
                         report.priority === 'medium' ? 'मध्यम' : 'कम'}
                      </Badge>
                      
                      <span className="text-sm text-muted-foreground">
                        {new Date(report.timestamp).toLocaleString('hi-IN')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mb-1">
                      {pumps.find(p => p.id === report.pumpId)?.name || 'सामान्य क्षेत्र'}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground">
                      {report.description || 
                       (report.type === 'water_quality' ? 'जल गुणवत्ता रिपोर्ट' : 'आवाज रिपोर्ट')}
                    </p>
                    
                    {report.parameters && (
                      <div className="text-xs text-muted-foreground mt-1">
                        पीएच: {report.parameters.ph} • 
                        टर्बिडिटी: {report.parameters.turbidity}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {report.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'resolve')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    {report.status === 'viewed' && (
                      <Badge variant="secondary">देखा गया</Badge>
                    )}
                    
                    {report.status === 'resolved' && (
                      <Badge variant="default">हल किया गया</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GPDashboard;