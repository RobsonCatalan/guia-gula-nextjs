import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccountPath = path.join(process.cwd(), 'gulaapp-5be3b-5c4c42fad535.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });
}

export const db = getFirestore();
export const bucket = getStorage().bucket();
