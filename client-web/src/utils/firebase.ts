import firebase from 'firebase/app';
import 'firebase/database';

export { firebase };
export const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyASn87_RfpvD9FV5mvWn18yuQ8ANlQhXak',
  authDomain: 'thesis-2f57b.firebaseapp.com',
  databaseURL: 'https://thesis-2f57b-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'thesis-2f57b',
  storageBucket: 'thesis-2f57b.appspot.com',
  messagingSenderId: '446264849148',
  appId: '1:446264849148:web:e8b9c002cae50f18d21d79',
  measurementId: 'G-WWW4REJ16T',
});
export default firebaseApp;
