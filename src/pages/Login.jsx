import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
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
        title: t('common.error'),
        description: 'Please enter a 10-digit phone number',
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
          title: 'OTP Sent',
          description: `OTP sent to +91${phone}`
        });
      } else {
        throw new Error(result.error || 'OTP send failed');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Error sending OTP',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: t('common.error'),
        description: 'Please enter a 6-digit OTP',
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
          title: t('common.success'),
          description: 'Account verified successfully'
        });
      } else {
        throw new Error(result.error || 'OTP verification failed');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Invalid OTP entered',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPIN = async () => {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: t('common.error'),
        description: 'Please enter a 4-digit PIN',
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
          title: 'PIN Set Successfully',
          description: 'You can now login offline'
        });
      } else {
        throw new Error(result.error || 'PIN setup failed');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Error setting PIN',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePINLogin = async () => {
    if (!pin || pin.length !== 4) {
      toast({
        title: t('common.error'),
        description: 'Please enter a 4-digit PIN',
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
          title: 'Offline Login Successful',
          description: 'Account verified successfully'
        });
      } else {
        throw new Error(result.error || 'PIN login failed');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Invalid PIN entered',
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
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageSelector />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('app.title')}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-status-working" />
            ) : (
              <WifiOff className="w-4 h-4 text-status-offline" />
            )}
            <span className="text-sm text-muted-foreground">
              {isOnline ? t('status.online') : t('status.offline')}
            </span>
          </div>
        </div>

        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('auth.phone')}
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
              {loading ? t('common.loading') : t('auth.sendOtp')}
            </Button>

            {/* Offline Login Option */}
            {!isOnline && canUseOffline && (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-3">OR</div>
                <Button
                  onClick={() => setStep('pin')}
                  variant="outline"
                  className="w-full btn-touch"
                >
                  {t('auth.offlineLogin')}
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
                {t('auth.otp')}
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
                Enter OTP sent to +91{phone}
              </p>
            </div>
            
            <Button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'Verifying...' : t('auth.verify')}
            </Button>

            <Button
              onClick={() => setStep('phone')}
              variant="outline"
              className="w-full btn-touch"
              disabled={loading}
            >
              Back
            </Button>
          </div>
        )}

        {/* Set PIN Step */}
        {step === 'setPin' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('auth.setPin')}
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
                Set a 4-digit PIN for offline login
              </p>
            </div>
            
            <Button
              onClick={handleSetPIN}
              disabled={loading}
              className="w-full btn-touch-lg bg-primary hover:bg-primary-hover"
            >
              {loading ? 'Setting...' : t('auth.setPin')}
            </Button>
          </div>
        )}

        {/* PIN Login Step */}
        {step === 'pin' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('auth.pin')}
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
              {loading ? 'Logging in...' : t('auth.login')}
            </Button>

            <Button
              onClick={() => setStep('phone')}
              variant="outline"
              className="w-full btn-touch"
              disabled={loading}
            >
              Back
            </Button>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Demo:</strong> Enter 123456 or any 6 digits as OTP.<br/>
            Operator: OTP starting with 1 | GP: Other numbers
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;