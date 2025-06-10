import fs from 'fs'
import path from 'path'
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Load service account JSON from functions working directory
const serviceAccountPath = path.join(process.cwd(), 'gulaapp-5be3b-5c4c42fad535.json')
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
const bucketName = `${serviceAccount.project_id}.appspot.com`
const appConfig = {
  credential: cert(serviceAccount),
  storageBucket: bucketName,
  projectId: serviceAccount.project_id,
}

// Initialize the app once
if (!getApps().length) {
  initializeApp(appConfig)
}

export const db = getFirestore()
// Explicitly pass bucketName or undefined
export const bucket = bucketName ? getStorage().bucket(bucketName) : undefined
