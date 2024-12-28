import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import styles from "./Login.module.css";

export function VerifyOTP() {
    const [otp, setOtp] = useState("");  // OTP state
    const [error, setError] = useState(null);  // Error state
    const navigate = useNavigate();  // Navigation hook from react-router
    const location = useLocation();  // Location hook to get state
    const { verifyOtp, user } = useAuth();  // Use verifyOtp from context

    // Retrieve playerId from location state
    const playerId = location.state?.playerId;

    // Handle OTP input change
    const handleOTPChange = (event) => {
        setOtp(event.target.value);
    };

    // Handle OTP submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!otp) {  // Check if OTP is entered
            setError("Please enter the OTP.");
            return;
        }

        try {
            // Call your backend API to verify OTP
            const response = await fetch("http://localhost:8080/api/v1/auth/verify_otp?tenantName=bluboy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ player_id: playerId, otp }),  // Pass player ID and OTP
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // OTP verified successfully
                // Use the context method to set OTP verified state
                console.log(data);
                console.log(data.auth_key);
                verifyOtp(otp, (success) => {
                    if (success) {
                        // Navigate to dynamic page if OTP verified
                        const pageTitle = "player_new";  // You can make this dynamic if needed
                        navigate(`/dynamic-table/${pageTitle}`, { replace: true });
                    } else {
                        setError("Error verifying OTP. Please try again.");
                    }
                });
            } else {
                // Show error message if OTP verification fails
                setError(data.message || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError("An error occurred. Please try again later.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2>Verify OTP</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            <input
                                type="text"
                                value={otp}
                                onChange={handleOTPChange}
                                placeholder="Enter your OTP"
                                className={styles.input}
                            />
                        </label>
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error messages */}
                    <button type="submit" className={styles.button} >
                        Submit OTP
                    </button>
                </form>
            </div>
        </div>
    );
}