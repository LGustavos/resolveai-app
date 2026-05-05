import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { firebaseClientConfig } from "@/lib/firebase/config";

let firebaseClientApp: FirebaseApp | null = null;

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!firebaseClientConfig) {
    return null;
  }

  if (firebaseClientApp) {
    return firebaseClientApp;
  }

  firebaseClientApp = getApps().length
    ? getApp()
    : initializeApp(firebaseClientConfig);

  return firebaseClientApp;
}
