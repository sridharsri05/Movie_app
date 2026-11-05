import { useEffect, useState } from "react";

const useGreeting = () => {
  const [greeting, setGreeting] = useState("");
  const [showGreeting, setShowGreeting] = useState(false); // Initially set to false

  const getTimeOfDay = () => {
    // Local hour in the browser's own time zone (same result as moment-timezone's guessed zone).
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 12) {
      setGreeting("Good morning ☀️");
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting("Good afternoon 🌞");
    } else if (currentHour >= 18 && currentHour < 24) {
      setGreeting("Good evening 🌙");
    } else {
      setGreeting("Good night 🌚");
    }
  };

  useEffect(() => {
    getTimeOfDay(); // Initial greeting on component mount

    const isLoggedInPreviously = sessionStorage.getItem("isLoggedIn");

    // If not logged in previously, set the flag to true and show the greeting
    if (!isLoggedInPreviously) {
      setShowGreeting(true);
      sessionStorage.setItem("isLoggedIn", "true");
    }

    // Update the greeting every minute (adjust as needed)
    const interval = setInterval(getTimeOfDay, 60000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Hide the greeting after a specified duration (adjust as needed)
    const timeout = setTimeout(() => {
      setShowGreeting(false);
    }, 6000);

    // Cleanup the timeout on component unmount
    return () => clearTimeout(timeout);
  }, []);

  return { greeting, showGreeting };
};

export default useGreeting;
