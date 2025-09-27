import React, { useState, useEffect } from 'react';
import { Play, Square, Wrench, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

const PumpCard = ({ pump, onStatusChange, translations }) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(pump.isRunning || false);
  const [hoursToday, setHoursToday] = useState(pump.hoursToday || 0);
  const [hoursWeek, setHoursWeek] = useState(pump.hoursWeek || 0);
  const [lastStartTime, setLastStartTime] = useState(null);

  // Calculate running time
  useEffect(() => {
    let interval;
    if (isRunning && lastStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(lastStartTime);
        const diffHours = (now - start) / (1000 * 60 * 60);
        setHoursToday(prev => Math.round((prev + diffHours) * 10) / 10);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isRunning, lastStartTime]);

  const handleStartStop = async () => {
    const action = isRunning ? 'stop' : 'start';
    const timestamp = new Date().toISOString();
    
    try {
      // Update local state immediately
      setIsRunning(!isRunning);
      
      if (!isRunning) {
        setLastStartTime(timestamp);
      } else {
        // Calculate session hours when stopping
        if (lastStartTime) {
          const sessionHours = (new Date() - new Date(lastStartTime)) / (1000 * 60 * 60);
          setHoursToday(prev => Math.round((prev + sessionHours) * 10) / 10);
          setHoursWeek(prev => Math.round((prev + sessionHours) * 10) / 10);
        }
        setLastStartTime(null);
      }

      // Save to offline queue
      await syncService.savePumpData(pump.id, action, {
        timestamp,
        previousState: isRunning,
        newState: !isRunning,
        sessionStart: !isRunning ? timestamp : lastStartTime,
        sessionEnd: isRunning ? timestamp : null
      });

      // Update parent component
      onStatusChange?.(pump.id, {
        isRunning: !isRunning,
        hoursToday: hoursToday,
        hoursWeek: hoursWeek,
        lastAction: action,
        lastActionTime: timestamp
      });

      toast({
        title: action === 'start' ? 'पंप शुरू किया गया' : 'पंप बंद किया गया',
        description: `${pump.name} - ${timestamp.split('T')[1].slice(0, 5)}`,
      });

    } catch (error) {
      console.error('Error updating pump status:', error);
      // Revert state on error
      setIsRunning(isRunning);
      
      toast({
        title: 'त्रुटि',
        description: 'पंप स्थिति अपडेट नहीं हो सकी',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = () => {
    if (pump.status === 'faulty') return 'bg-status-faulty';
    if (pump.status === 'maintenance') return 'bg-status-maintenance';
    if (isRunning) return 'bg-status-working';
    return 'bg-status-offline';
  };

  const getStatusText = () => {
    if (pump.status === 'faulty') return translations.operator.faulty;
    if (pump.status === 'maintenance') return translations.operator.maintenance;
    if (isRunning) return translations.operator.working;
    return 'बंद';
  };

  return (
    <Card className="p-4 shadow-card hover:shadow-soft transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{pump.name}</h3>
        <Badge className={`${getStatusColor()} text-white text-sm px-3 py-1`}>
          {getStatusText()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <div>
            <div>{translations.operator.hoursToday}: {hoursToday}h</div>
            <div>{translations.operator.hoursWeek}: {hoursWeek}h</div>
          </div>
        </div>
        
        {pump.lastMaintenance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="w-4 h-4" />
            <div>
              <div>{translations.operator.lastMaintenance}:</div>
              <div>{new Date(pump.lastMaintenance).toLocaleDateString('hi-IN')}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStartStop}
          disabled={pump.status === 'faulty' || pump.status === 'maintenance'}
          className={`btn-touch flex-1 ${
            isRunning 
              ? 'bg-alert hover:bg-alert-hover' 
              : 'bg-secondary hover:bg-secondary-hover'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-5 h-5 mr-2" />
              {translations.operator.stop}
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {translations.operator.start}
            </>
          )}
        </Button>

        {pump.status === 'faulty' && (
          <Button
            variant="outline"
            size="sm"
            className="btn-touch"
            onClick={() => {
              // Handle maintenance report
              toast({
                title: 'मरम्मत रिपोर्ट',
                description: 'रिपोर्ट सुविधा जल्द आएगी'
              });
            }}
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PumpCard;