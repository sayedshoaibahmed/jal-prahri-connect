import React, { useState, useRef } from 'react';
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  Upload, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { syncService } from '@/services/syncService';

const ReportModal = ({ isOpen, onClose, pumps, translations }) => {
  const { toast } = useToast();
  const [selectedPump, setSelectedPump] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          toast({
            title: 'स्थान प्राप्त',
            description: 'आपका स्थान सफलतापूर्वक प्राप्त हो गया'
          });
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            title: 'स्थान त्रुटि',
            description: 'स्थान प्राप्त करने में समस्या हुई',
            variant: 'destructive'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      toast({
        title: 'स्थान समर्थित नहीं',
        description: 'आपका डिवाइस GPS का समर्थन नहीं करता',
        variant: 'destructive'
      });
    }
  };

  // Start voice recording - Mock implementation
  const startRecording = async () => {
    try {
      // Mock recording since actual MediaRecorder needs proper setup
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: 'रिकॉर्डिंग शुरू',
        description: 'आवाज रिकॉर्ड करना शुरू हो गया'
      });

      // TODO: Implement actual voice recording
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // mediaRecorderRef.current = new MediaRecorder(stream);
      // Setup recording logic...
      
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'रिकॉर्डिंग त्रुटि',
        description: 'आवाज रिकॉर्ड करने में समस्या हुई',
        variant: 'destructive'
      });
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    
    // Mock audio URL - in real app, get from MediaRecorder
    const mockAudioUrl = `data:audio/wav;base64,mock_audio_${Date.now()}`;
    setAudioUrl(mockAudioUrl);
    
    toast({
      title: 'रिकॉर्डिंग बंद',
      description: `${recordingTime} सेकंड की आवाज रिकॉर्ड हुई`
    });
    
    // TODO: Stop actual recording and create blob URL
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit report
  const handleSubmit = async () => {
    if (!selectedPump && !description.trim() && !audioUrl) {
      toast({
        title: 'अधूरी जानकारी',
        description: 'कृपया पंप चुनें या विवरण दर्ज करें',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reportData = {
        pumpId: selectedPump || null,
        description: description.trim(),
        audioUrl: audioUrl,
        location: location,
        reportType: 'voice_report',
        priority: 'normal',
        timestamp: new Date().toISOString()
      };

      // Save to offline queue
      await syncService.saveVoiceReport(reportData);
      
      toast({
        title: 'रिपोर्ट जमा',
        description: 'आपकी रिपोर्ट सफलतापूर्वक जमा हो गई'
      });

      // Reset form
      setSelectedPump('');
      setDescription('');
      setAudioUrl(null);
      setLocation(null);
      setRecordingTime(0);
      
      onClose();
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'जमा करने में त्रुटि',
        description: 'रिपोर्ट जमा करने में समस्या हुई',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {translations.operator.addReport}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pump Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              पंप चुनें (वैकल्पिक)
            </label>
            <Select value={selectedPump} onValueChange={setSelectedPump}>
              <SelectTrigger className="btn-touch">
                <SelectValue placeholder="पंप चुनें या सामान्य क्षेत्र रिपोर्ट करें" />
              </SelectTrigger>
              <SelectContent>
                {pumps.map(pump => (
                  <SelectItem key={pump.id} value={pump.id}>
                    {pump.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Recording */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">आवाज रिकॉर्ड करें</h3>
            
            {!isRecording && !audioUrl && (
              <Button
                onClick={startRecording}
                className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
              >
                <Mic className="w-5 h-5 mr-2" />
                रिकॉर्डिंग शुरू करें
              </Button>
            )}

            {isRecording && (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
                </div>
                
                <Button
                  onClick={stopRecording}
                  className="btn-touch-lg bg-alert hover:bg-alert-hover"
                >
                  <Square className="w-5 h-5 mr-2" />
                  रिकॉर्डिंग बंद करें
                </Button>
              </div>
            )}

            {audioUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    रिकॉर्डिंग तैयार ({formatTime(recordingTime)})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAudioUrl(null);
                      setRecordingTime(0);
                    }}
                  >
                    दोबारा रिकॉर्ड करें
                  </Button>
                </div>
                
                {/* Mock audio player - in real app, use actual audio element */}
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Play className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    ऑडियो फ़ाइल तैयार
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Text Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              लिखित विवरण (वैकल्पिक)
            </label>
            <Textarea
              placeholder="समस्या का विवरण लिखें..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20"
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">स्थान</label>
              <Button
                size="sm"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isSubmitting}
              >
                <MapPin className="w-4 h-4 mr-1" />
                स्थान प्राप्त करें
              </Button>
            </div>
            
            {location && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                अक्षांश: {location.lat.toFixed(6)}, देशांतर: {location.lng.toFixed(6)}
                <br />
                सटीकता: {Math.round(location.accuracy)} मीटर
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 btn-touch"
            >
              रद्द करें
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 btn-touch bg-primary hover:bg-primary-hover"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  जमा हो रहा है...
                </>
              ) : (
                'रिपोर्ट भेजें'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;