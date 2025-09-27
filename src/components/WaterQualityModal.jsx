import React, { useState } from 'react';
import { X, Camera, Loader2, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { syncService } from '@/services/syncService';

const WaterQualityModal = ({ isOpen, onClose, pumps, translations }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    pumpId: '',
    ph: '',
    turbidity: '',
    chlorine: '',
    temperature: '',
    testImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Water quality thresholds
  const getQualityStatus = (parameter, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    switch (parameter) {
      case 'ph':
        if (numValue >= 6.5 && numValue <= 8.5) return 'normal';
        if (numValue >= 6.0 && numValue < 6.5 || numValue > 8.5 && numValue <= 9.0) return 'warning';
        return 'critical';
      
      case 'turbidity':
        if (numValue <= 1) return 'normal';
        if (numValue <= 5) return 'warning';
        return 'critical';
      
      case 'chlorine':
        if (numValue >= 0.2 && numValue <= 2.0) return 'normal';
        if (numValue >= 0.1 && numValue < 0.2 || numValue > 2.0 && numValue <= 4.0) return 'warning';
        return 'critical';
      
      case 'temperature':
        if (numValue >= 15 && numValue <= 35) return 'normal';
        if (numValue >= 10 && numValue < 15 || numValue > 35 && numValue <= 45) return 'warning';
        return 'critical';
      
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-status-working';
      case 'warning': return 'text-status-maintenance';
      case 'critical': return 'text-status-faulty';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return translations.waterQuality.normal;
      case 'warning': return translations.waterQuality.warning;
      case 'critical': return translations.waterQuality.critical;
      default: return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mock image capture - in real app, use camera
  const handleImageCapture = async () => {
    try {
      // Mock image capture - in real app, use camera API
      const mockImageData = {
        url: `data:image/jpeg;base64,mock_image_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'test_kit_photo'
      };
      
      setFormData(prev => ({
        ...prev,
        testImage: mockImageData
      }));

      toast({
        title: 'फोटो कैप्चर',
        description: 'टेस्ट किट की फोटो सफलतापूर्वक ली गई'
      });

      // TODO: Implement actual camera capture
      // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Setup camera capture logic...
      
    } catch (error) {
      console.error('Image capture error:', error);
      toast({
        title: 'कैमरा त्रुटि',
        description: 'फोटो लेने में समस्या हुई',
        variant: 'destructive'
      });
    }
  };

  const validateForm = () => {
    if (!formData.pumpId) {
      toast({
        title: 'पंप चुनें',
        description: 'कृपया पंप का चयन करें',
        variant: 'destructive'
      });
      return false;
    }

    const hasValues = formData.ph || formData.turbidity || formData.chlorine || formData.temperature;
    if (!hasValues) {
      toast({
        title: 'डेटा दर्ज करें',
        description: 'कम से कम एक पैरामीटर दर्ज करें',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const qualityData = {
        pumpId: formData.pumpId,
        parameters: {
          ph: formData.ph ? parseFloat(formData.ph) : null,
          turbidity: formData.turbidity ? parseFloat(formData.turbidity) : null,
          chlorine: formData.chlorine ? parseFloat(formData.chlorine) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null
        },
        testImage: formData.testImage,
        timestamp: new Date().toISOString(),
        operatorId: 'current_operator_id' // TODO: Get from auth service
      };

      // Calculate overall status
      const statuses = Object.entries(qualityData.parameters)
        .filter(([_, value]) => value !== null)
        .map(([param, value]) => getQualityStatus(param, value));
      
      const hasCritical = statuses.includes('critical');
      const hasWarning = statuses.includes('warning');
      
      qualityData.overallStatus = hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal';

      // Save to offline queue
      await syncService.saveWaterQuality(qualityData);
      
      toast({
        title: 'गुणवत्ता डेटा सेव',
        description: 'जल गुणवत्ता डेटा सफलतापूर्वक सेव हो गया'
      });

      // Reset form
      setFormData({
        pumpId: '',
        ph: '',
        turbidity: '',
        chlorine: '',
        temperature: '',
        testImage: null
      });
      
      onClose();
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'सेव करने में त्रुटि',
        description: 'डेटा सेव करने में समस्या हुई',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            {translations.operator.waterQuality}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pump Selection */}
          <div>
            <Label className="text-sm font-medium">
              पंप चुनें *
            </Label>
            <Select value={formData.pumpId} onValueChange={(value) => handleInputChange('pumpId', value)}>
              <SelectTrigger className="btn-touch">
                <SelectValue placeholder="पंप का चयन करें" />
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

          {/* pH */}
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              {translations.waterQuality.ph} (6.5-8.5)
              {formData.ph && (
                <span className={`text-xs ${getStatusColor(getQualityStatus('ph', formData.ph))}`}>
                  {getStatusText(getQualityStatus('ph', formData.ph))}
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="14"
              placeholder="7.0"
              value={formData.ph}
              onChange={(e) => handleInputChange('ph', e.target.value)}
              className="btn-touch"
              disabled={isSubmitting}
            />
          </div>

          {/* Turbidity */}
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              {translations.waterQuality.turbidity} (≤1 NTU)
              {formData.turbidity && (
                <span className={`text-xs ${getStatusColor(getQualityStatus('turbidity', formData.turbidity))}`}>
                  {getStatusText(getQualityStatus('turbidity', formData.turbidity))}
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.5"
              value={formData.turbidity}
              onChange={(e) => handleInputChange('turbidity', e.target.value)}
              className="btn-touch"
              disabled={isSubmitting}
            />
          </div>

          {/* Free Chlorine */}
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              {translations.waterQuality.chlorine} (0.2-2.0 mg/L)
              {formData.chlorine && (
                <span className={`text-xs ${getStatusColor(getQualityStatus('chlorine', formData.chlorine))}`}>
                  {getStatusText(getQualityStatus('chlorine', formData.chlorine))}
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.5"
              value={formData.chlorine}
              onChange={(e) => handleInputChange('chlorine', e.target.value)}
              className="btn-touch"
              disabled={isSubmitting}
            />
          </div>

          {/* Temperature */}
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              {translations.waterQuality.temperature} (15-35°C)
              {formData.temperature && (
                <span className={`text-xs ${getStatusColor(getQualityStatus('temperature', formData.temperature))}`}>
                  {getStatusText(getQualityStatus('temperature', formData.temperature))}
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              placeholder="25"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              className="btn-touch"
              disabled={isSubmitting}
            />
          </div>

          {/* Test Kit Photo */}
          <div>
            <Label className="text-sm font-medium">
              {translations.waterQuality.testImage} (वैकल्पिक)
            </Label>
            
            {!formData.testImage ? (
              <Button
                onClick={handleImageCapture}
                variant="outline"
                className="w-full btn-touch"
                disabled={isSubmitting}
              >
                <Camera className="w-5 h-5 mr-2" />
                टेस्ट किट की फोटो लें
              </Button>
            ) : (
              <div className="p-3 bg-muted rounded text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">फोटो कैप्चर हो गई</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInputChange('testImage', null)}
                  className="mt-2"
                >
                  दोबारा लें
                </Button>
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
                  सेव हो रहा है...
                </>
              ) : (
                translations.waterQuality.submit
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaterQualityModal;