import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './firebase.config';

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([])
  ]
};