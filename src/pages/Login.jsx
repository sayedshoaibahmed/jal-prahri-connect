import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import translations from '@/locales/hi.json';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'pin', 'setPin'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canUseOffline, setCanUseOffline] = useState(false);

  useEffect(() => {
    // Check if user can login offline
    const storedPin = localStorage.getItem('waterSupply_pin');
    const storedUser = localStorage.getItem('waterSupply_user');
    setCanUseOffline(storedPin && storedUser);

    // Check if already authenticated
    if (authService.checkAuth()) {
      const role = authService.getUserRole();
      navigate(role === 'operator' ? '/operator' : '/gp');
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया 10 अंकों का फोन नंबर दर्ज करें',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.loginWithPhone(`+91${phone}`);
      
      if (result.success) {
        setVerificationId(result.verificationId);
        setStep('otp');
        toast({
          title: 'ओटीपी भेजा गया',
          description: `+91${phone} पर ओटीपी भेजा गया है`
        });
      } else {
        throw new Error(result.error || 'OTP send failed');
      }
    } catch (error) {
      toast({
        title: 'त्रुटि',
        description: 'ओटीपी भेजने में समस्या हुई',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया 6 अंकों का ओटीपी दर्ज करें',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP(verificationId, otp);
      
      if (result.success) {
        if (result.needsPin) {
          setStep('setPin');
        } else {
          const role = result.user.role;
          navigate(role === 'operator' ? '/operator' : '/gp');
        }
        
        toast({
          title: 'सफल लॉगिन',
          description: 'आपका खाता सत्यापित हो गया है'
        });
      } else {
        throw new Error(result.error || 'OTP verification failed');
      }
    } catch (error) {
      toast({
        title: 'त्रुटि',
        description: 'गलत ओटीपी दर्ज किया गया',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPIN = async () => {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया 4 अंकों का पिन दर्ज करें',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.setPIN(pin);
      
      if (result.success) {
        const role = authService.getUserRole();
        navigate(role === 'operator' ? '/operator' : '/gp');
        
        toast({
          title: 'पिन सेट हो गया',
          description: 'अब आप ऑफ़लाइन लॉगिन कर सकते हैं'
        });
      } else {
        throw new Error(result.error || 'PIN setup failed');
      }
    } catch (error) {
      toast({
        title: 'त्रुटि',
        description: 'पिन सेट करने में समस्या हुई',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePINLogin = async () => {
    if (!pin || pin.length !== 4) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया 4 अंकों का पिन दर्ज करें',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.loginWithPIN(pin);
      
      if (result.success) {
        const role = result.user.role;
        navigate(role === 'operator' ? '/operator' : '/gp');
        
        toast({
          title: 'ऑफ़लाइन लॉगिन सफल',
          description: 'आपका खाता सत्यापित हो गया है'
        });
      } else {
        throw new Error(result.error || 'PIN login failed');
      }
    } catch (error) {
      toast({
        title: 'त्रुटि',
        description: 'गलत पिन दर्ज किया गया',
        variant: 'destructive'
      });
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-water flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-soft">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            जल आपूर्ति निगरानी
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-status-working" />
            ) : (
              <WifiOff className="w-4 h-4 text-status-offline" />
            )}
            <span className="text-sm text-muted-foreground">
              {isOnline ? translations.status.online : translations.status.offline}
            </span>
          </div>
        </div>

        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {translations.auth.phone}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="rounded-l-none"
                  disabled={loading}
                />
              </div>
            </div>
            
            <Button
              onClick={handleSendOTP}
              disabled={loading || !isOnline}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'भेजा जा रहा है...' : translations.auth.sendOtp}
            </Button>

            {/* Offline Login Option */}
            {!isOnline && canUseOffline && (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-3">या</div>
                <Button
                  onClick={() => setStep('pin')}
                  variant="outline"
                  className="w-full btn-touch"
                >
                  {translations.auth.offlineLogin}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {translations.auth.otp}
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-wider"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                +91{phone} पर भेजा गया ओटीपी दर्ज करें
              </p>
            </div>
            
            <Button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'सत्यापित हो रहा है...' : translations.auth.verify}
            </Button>

            <Button
              onClick={() => setStep('phone')}
              variant="outline"
              className="w-full btn-touch"
              disabled={loading}
            >
              वापस जाएं
            </Button>
          </div>
        )}

        {/* Set PIN Step */}
        {step === 'setPin' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {translations.auth.setPin}
              </label>
              <Input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-xl tracking-wider"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ऑफ़लाइन लॉगिन के लिए 4 अंकों का पिन सेट करें
              </p>
            </div>
            
            <Button
              onClick={handleSetPIN}
              disabled={loading}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'सेट हो रहा है...' : 'पिन सेट करें'}
            </Button>
          </div>
        )}

        {/* PIN Login Step */}
        {step === 'pin' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {translations.auth.pin}
              </label>
              <Input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-xl tracking-wider"
                disabled={loading}
              />
            </div>
            
            <Button
              onClick={handlePINLogin}
              disabled={loading}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'लॉगिन हो रहा है...' : translations.auth.login}
            </Button>

            <Button
              onClick={() => setStep('phone')}
              variant="outline"
              className="w-full btn-touch"
              disabled={loading}
            >
              वापस जाएं
            </Button>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>डेमो:</strong> ओटीपी के रूप में 123456 या कोई भी 6 अंक दर्ज करें।<br/>
            ऑपरेटर: 1 से शुरू होने वाला ओटीपी | GP: अन्य संख्या
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;