// useAuthInitialization.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginFulfilled } from "../Redux/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuthInitialization = () => {
  const dispatch = useDispatch();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initializeAuthState = () => {
      try {
        // Check for an authentication token in local storage
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
          // Decode the token to get user information, including the role
          const decodedToken = jwtDecode(authToken);

          // Update the state with the user's information
          dispatch(
            loginFulfilled({ user: decodedToken.userId, role: decodedToken.userId.role })
          );
        }
      } catch (error) {
        // Handle decoding errors or other unexpected errors
        console.error("Error during auth initialization:", error);
      } finally {
        // Set isAuthReady to true to indicate that authentication state is initialized
        setIsAuthReady(true);
      }
    };

    initializeAuthState();
  }, [dispatch]);

  return { isAuthReady };
};

export default useAuthInitialization;
