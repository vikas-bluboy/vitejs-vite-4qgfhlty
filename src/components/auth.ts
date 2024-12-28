/**
 * This represents some generic auth provider API, like Firebase.
 */
export const fakeAuthProvider = {
  isAuthenticated: false,
  user: null,
  otpVerified: false,

  signin(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = true;
    setTimeout(callback, 100);
  },

  verifyOtp(otp: string, callback: (success: boolean) => void) {
    // Simulate OTP verification logic
    const isValidOtp = otp === "1234"; // Example OTP validation logic
    if (isValidOtp) {
      fakeAuthProvider.isAuthenticated = true;
      fakeAuthProvider.otpVerified = true;
      callback(true);
    } else {
      callback(false);
    }
  },

  signout(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = false;
    fakeAuthProvider.otpVerified = false;
    setTimeout(callback, 100);
  },
};


