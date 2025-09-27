// Mock Authentication Service - Replace with Firebase Auth
class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.userRole = null;
  }

  // Mock phone login - Replace with Firebase Auth
  async loginWithPhone(phoneNumber) {
    // Mock implementation - in real app, use Firebase
    console.log('Sending OTP to:', phoneNumber);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          verificationId: 'mock_verification_id',
          message: 'OTP sent successfully'
        });
      }, 1000);
    });
  }

  // Mock OTP verification
  async verifyOTP(verificationId, otp) {
    // Mock verification - always succeeds for demo
    if (otp === '123456' || otp.length === 6) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isAuthenticated = true;
          this.currentUser = {
            phone: '+91-9876543210',
            id: 'mock_user_id',
            role: otp.startsWith('1') ? 'operator' : 'gp' // Mock role assignment
          };
          this.userRole = this.currentUser.role;
          
          // Store in localStorage for offline access
          localStorage.setItem('waterSupply_user', JSON.stringify(this.currentUser));
          localStorage.setItem('waterSupply_isAuth', 'true');
          
          resolve({
            success: true,
            user: this.currentUser,
            needsPin: !localStorage.getItem('waterSupply_pin')
          });
        }, 1000);
      });
    }
    
    return { success: false, error: 'Invalid OTP' };
  }

  // Set PIN for offline access
  async setPIN(pin) {
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
      localStorage.setItem('waterSupply_pin', pin);
      return { success: true };
    }
    return { success: false, error: 'PIN must be 4 digits' };
  }

  // Offline PIN login
  async loginWithPIN(pin) {
    const storedPin = localStorage.getItem('waterSupply_pin');
    const storedUser = localStorage.getItem('waterSupply_user');
    
    if (storedPin === pin && storedUser) {
      this.isAuthenticated = true;
      this.currentUser = JSON.parse(storedUser);
      this.userRole = this.currentUser.role;
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, error: 'Invalid PIN' };
  }

  // Check if user is authenticated
  checkAuth() {
    const isAuth = localStorage.getItem('waterSupply_isAuth');
    const user = localStorage.getItem('waterSupply_user');
    
    if (isAuth === 'true' && user) {
      this.isAuthenticated = true;
      this.currentUser = JSON.parse(user);
      this.userRole = this.currentUser.role;
      return true;
    }
    
    return false;
  }

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.userRole = null;
    localStorage.removeItem('waterSupply_isAuth');
    // Keep PIN for offline access
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user role
  getUserRole() {
    return this.userRole;
  }
}

export const authService = new AuthService();
