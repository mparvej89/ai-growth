const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Wait, they might not have a serviceAccountKey.json

admin.initializeApp();
const db = admin.firestore();

async function addCredits() {
  const snapshot = await db.collection('users').get();
  for (const doc of snapshot.docs) {
    await doc.ref.update({ credits: 100 });
    console.log(`Updated credits for ${doc.id}`);
  }
}
addCredits();
