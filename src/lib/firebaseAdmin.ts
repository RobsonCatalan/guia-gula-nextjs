import fs from 'fs'
import path from 'path'
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

let bucketName: string | undefined
let appConfig: Parameters<typeof initializeApp>[0]

// Try loading local service account
try {
  const serviceAccountPath = path.join(process.cwd(), 'gulaapp-5be3b-5c4c42fad535.json')
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
  bucketName = `${serviceAccount.project_id}.appspot.com`
  appConfig = {
    credential: cert(serviceAccount),
    storageBucket: bucketName,
  }
} catch {
  // Fallback: parse FIREBASE_CONFIG or use GOOGLE_CLOUD_PROJECT
  if (process.env.FIREBASE_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_CONFIG)
      bucketName = config.storageBucket
    } catch {}
  }
  if (!bucketName && process.env.GOOGLE_CLOUD_PROJECT) {
    bucketName = `${process.env.GOOGLE_CLOUD_PROJECT}.appspot.com`
  }
  appConfig = {
    credential: applicationDefault(),
    ...(bucketName ? { storageBucket: bucketName } : {}),
  }
}

// Initialize the app once
if (!getApps().length) {
  initializeApp(appConfig)
}

export const db = getFirestore()
// Explicitly pass bucketName or undefined
export const bucket = bucketName ? getStorage().bucket(bucketName) : undefined
