import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// 🔹 Config padrão
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// 🔹 Inicializa o app principal
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 🔹 Instâncias principais
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// 🔹 Instância secundária (pra criar usuários sem deslogar o atual)
export const secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = secondaryApp.auth();

export default firebase;
