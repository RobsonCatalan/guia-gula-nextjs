import fs from 'fs'
import path from 'path'
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK once, using service account JSON or default credentials
if (!getApps().length) {
  let appConfig: Parameters<typeof initializeApp>[0]
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (process.env.FIREBASE_CONFIG) {
    const raw = process.env.FIREBASE_CONFIG.replace(/^'+|'+$/g, '')
    const sa = JSON.parse(raw)
    appConfig = { credential: cert(sa), projectId: sa.project_id }
  } else {
    const keyPath = path.join(process.cwd(), 'gulaapp-5be3b-5c4c42fad535.json')
    if (fs.existsSync(keyPath)) {
      const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
      appConfig = { credential: cert(sa), projectId: sa.project_id }
    } else {
      appConfig = { credential: applicationDefault(), projectId }
    }
  }

  initializeApp(appConfig)
}

// Export Firestore instance
export const db = getFirestore()
export const bucket = null
