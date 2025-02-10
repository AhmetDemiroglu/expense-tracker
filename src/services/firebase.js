import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBG9aJhu2-DA3Dd4Jb0I3OGelapIpThcjs",
  authDomain: "expense-tracker-1dc73.firebaseapp.com",
  databaseURL: "https://expense-tracker-1dc73-default-rtdb.firebaseio.com",
  projectId: "expense-tracker-1dc73",
  storageBucket: "expense-tracker-1dc73.firebasestorage.app",
  messagingSenderId: "523163959305",
  appId: "1:523163959305:web:d034cbfd632658f572b8d8",
  measurementId: "G-GX1V6DFQ9K"
}

// Firebase'i başlat
const app = initializeApp(firebaseConfig)

// Realtime Database ve Auth servislerini al
const db = getDatabase(app)
const auth = getAuth(app)

// Persistence ayarı
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error)
  })

export { db, auth } 