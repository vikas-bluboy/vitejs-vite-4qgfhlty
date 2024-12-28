import * as React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import styles from "./Login.module.css";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const mobile = formData.get("mobile");

    // Make API call to verify if the user exists
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login?tenantName=bluboy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: 0,
          mobile,
          location: {
            lat: "1.234",
            long: "2.345"
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", response.status, errorText);
        alert("Login failed. Please check your credentials and try again.");
        return;
      }

      const data = await response.json();
      console.log("Server Response:", data); // Log server response

      if (data.success) {
        // Mock user object based on the response
        const user = {
          player_id: data.player_id,
          mobile,
          auth_key: data.auth_key
        };
        console.log("Signing in with user:", user); // Log user data

        auth.signin(user, () => {
          navigate("/verifyOtp", { replace: true, state: { playerId: data.player_id } });
        });
      } else {
        alert(data.message || "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      alert("An error occurred while connecting to the server. Please try again.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <p>You must log in to view the page at {from}</p>

        <form onSubmit={handleSubmit}>
          <label className={styles.title}>
            Mobile: <input name="mobile" type="text" className={styles.input} />
          </label>{" "}
          <button type="submit" className={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}