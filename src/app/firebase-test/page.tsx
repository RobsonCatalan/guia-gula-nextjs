export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Inicializa Firebase Admin SDK apenas uma vez
if (!getApps().length) {
  const keyPath = path.join(process.cwd(), 'gulaapp-5be3b-5c4c42fad535.json');
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });
}

export default async function Page() {
  const db = getFirestore();
  const bucket = getStorage().bucket();

  // Teste Firestore
  const snapshot = await db.collection('places').limit(1).get();
  const firstDoc = snapshot.docs[0];
  const placeData = firstDoc ? { id: firstDoc.id, ...firstDoc.data() } : { id: '', error: 'Nenhum documento encontrado' };

  // Teste Storage
  const [files] = await bucket.getFiles({ maxResults: 10 });
  const imgFile = files.find(f => /\.(jpe?g|png|gif|webp)$/i.test(f.name));
  let imgUrl = '';
  if (imgFile) {
    const [url] = await imgFile.getSignedUrl({ action: 'read', expires: Date.now() + 3600 * 1000 });
    imgUrl = url;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste Firebase Admin SDK</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">{`places/${placeData.id}`}</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(placeData, null, 2)}</pre>
      </section>
      {imgUrl ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Imagem de Teste</h2>
          <img src={imgUrl} alt={imgFile?.name} className="max-w-full h-auto rounded" />
        </section>
      ) : (
        <p className="text-gray-600">Nenhuma imagem encontrada no bucket.</p>
      )}
    </main>
  );
}
