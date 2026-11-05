// Firebase is loaded on demand (dynamic import) so it stays out of the initial bundle.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6n01OwDioyaNzaht4CFjKVv8AhBcamf4",
  authDomain: "moviehub-e304c.firebaseapp.com",
  projectId: "moviehub-e304c",
  storageBucket: "moviehub-e304c.appspot.com",
  messagingSenderId: "921116256",
  appId: "1:921116256:web:bf3a46dd8d3c83dfd42d05",
};

let appPromise;

// Resolves to the initialised Firebase app; loads the SDK on first call and caches it.
export const getFirebase = () => {
  if (!appPromise) {
    appPromise = import("firebase/app")
      .then(({ initializeApp }) => initializeApp(firebaseConfig))
      .catch((err) => {
        appPromise = undefined; // allow a retry after a network failure
        throw err;
      });
  }
  return appPromise;
};

// Warm the SDK chunks (e.g. on hover/focus) so the click handler does not wait on the network.
export const preloadFirebaseAuth = () => {
  getFirebase().catch(() => {});
  import("firebase/auth").catch(() => {});
};
