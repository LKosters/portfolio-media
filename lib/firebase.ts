import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with error handling
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
  // Only initialize if we have the API key
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn('Firebase API key is missing. Firebase services will not be available.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Interface for high score entries
export interface HighScoreEntry {
  name: string;
  score: number;
  timestamp: Date;
}

// Add a high score to the leaderboard
export async function addHighScore(name: string, score: number): Promise<void> {
  if (!db) {
    console.error('Firebase is not initialized');
    throw new Error('Firebase is not initialized');
  }
  
  try {
    await addDoc(collection(db, "leaderboard"), {
      name,
      score,
      timestamp: new Date()
    });
    console.log("High score added to leaderboard");
  } catch (error) {
    console.error("Error adding high score:", error);
    throw error;
  }
}

// Get top high scores from the leaderboard
export async function getTopHighScores(maxResults: number = 10): Promise<HighScoreEntry[]> {
  if (!db) {
    console.error('Firebase is not initialized');
    return [];
  }
  
  try {
    const leaderboardQuery = query(
      collection(db, "leaderboard"), 
      orderBy("score", "desc"), 
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(leaderboardQuery);
    const highScores: HighScoreEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      highScores.push({
        name: data.name,
        score: data.score,
        timestamp: data.timestamp.toDate()
      });
    });
    
    return highScores;
  } catch (error) {
    console.error("Error getting high scores:", error);
    return [];
  }
} 