import * as React from "react";
import { Navigate, useLocation } from "react-router";
import { fakeAuthProvider } from "./auth";

const SESSION_DURATION = 1 * 60 * 1000; // 0.5 minute in milliseconds

let AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [isSessionExpired, setIsSessionExpired] = React.useState(false);
  const [loading, setLoading] = React.useState(true); // Loading state for initialization

  const resetSessionExpiry = () => {
    const now = new Date();
    const expiry = now.getTime() + SESSION_DURATION;
    const storedSession = localStorage.getItem("userSession");

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      sessionData.expiry = expiry;
      localStorage.setItem("userSession", JSON.stringify(sessionData));
    }
  };
  const clearPaginationState = () => {
    const pageKey = window.location.pathname; // Use the current page path as the key
    localStorage.removeItem(`paginationState_${pageKey}`);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      const storedSession = localStorage.getItem("userSession");
      if (storedSession) {
        const { user: storedUser, expiry } = JSON.parse(storedSession);
        const currentTime = new Date().getTime();

        if (currentTime < expiry) {
          setUser(storedUser);
          setOtpVerified(true);
          setIsSessionExpired(false);
        } else {
          localStorage.removeItem("userSession");
          clearPaginationState(); // Clear pagination state on session expiry
          localStorage.removeItem('paginationState');
          setUser(null);
          setOtpVerified(false);
          setIsSessionExpired(true);
        }
      }
      setLoading(false); // Initialization complete
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "userSession") {
        const storedSession = event.newValue
          ? JSON.parse(event.newValue)
          : null;

        if (storedSession) {
          const { user: storedUser, expiry } = storedSession;
          const currentTime = new Date().getTime();

          if (currentTime < expiry) {
            setUser(storedUser);
            setOtpVerified(true);
            setIsSessionExpired(false);
          } else {
            setUser(null);
            setOtpVerified(false);
            setIsSessionExpired(true);
          }
        } else {
          setUser(null);
          setOtpVerified(false);
          setIsSessionExpired(true);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  React.useEffect(() => {
    const events = ["mousemove", "keydown", "click"];
    const handleUserActivity = () => {
      resetSessionExpiry();
    };

    events.forEach((event) => window.addEventListener(event, handleUserActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
    };
  }, []);

  // **Sign in function**
  const signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      setOtpVerified(false); // Reset OTP verification
      setIsSessionExpired(false);
      callback();
    });
  };

  // **Verify OTP function**
  const verifyOtp = (otp, callback) => {
    return fakeAuthProvider.verifyOtp(otp, (success) => {
      if (success) {
        const now = new Date();
        const expiry = now.getTime() + SESSION_DURATION;

        setOtpVerified(true);
        setIsSessionExpired(false); // Reset session expiry state
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            user,
            expiry,
            loggedInAt: now.toISOString(),
          })
        );

        callback(true);
      } else {
        callback(false);
      }
    });
  };

  // **Sign out function**
  const signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      setOtpVerified(false);
      localStorage.removeItem("userSession");
      setIsSessionExpired(true);
      callback();
    });
  };

  const value = {
    user,
    otpVerified,
    signin,
    verifyOtp,
    signout,
    isSessionExpired,
    loading, // Expose the loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // Show a loading indicator or blank screen during initialization
  if (auth.loading) {
    return <div>Loading...</div>; // Replace with a spinner or loading indicator if desired
  }

  // Redirect to login page if session expired or user is not authenticated
  if (!auth.user || auth.isSessionExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // **Redirect to verify OTP page if OTP is not verified**
  if (!auth.otpVerified && location.pathname !== "/verifyOtp") {
    return <Navigate to="/verifyOtp" state={{ from: location }} replace />;
  }

  return children;
}