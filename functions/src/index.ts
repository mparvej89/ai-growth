// v3 - switched to Gemini (free tier)
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const db = admin.firestore();

// Automatically create user doc on sign up
export const onCreateUser = functions.auth.user().onCreate(async (user: functions.auth.UserRecord) => {
  try {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      plan: 'free',
      credits: 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Created profile for user: ${user.uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Callable function to generate marketing content
export const generateContent = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // 1. Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to generate content.');
  }

  const uid = context.auth.uid;
  const { business, offer, location } = data;

  // 1b. Check API Keys
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: Gemini API Key is missing!');
    throw new functions.https.HttpsError('internal', 'Server configuration error: API Key missing.');
  }

  if (!business || !offer || !location) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide business, offer, and location.');
  }

  // 2. Check / create credits
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.log(`Auto-creating profile for user: ${uid}`);
    await userRef.set({
      uid: uid,
      email: context.auth.token.email || '',
      plan: 'free',
      credits: 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    const userData = userDoc.data();
    if (!userData || userData.credits <= 0) {
      throw new functions.https.HttpsError('resource-exhausted', 'Not enough credits. Please upgrade your plan.');
    }
  }

  // 3. Call Gemini AI
  const prompt = `
Business: ${business}
Offer: ${offer}
City: ${location}

Write:
- Instagram caption (max 20 words)
- WhatsApp message (max 15 words)
- CTA (max 6 words)
- Poster copy (catchy headline and subheadline for a physical poster)
- 5 hashtags

Return JSON only in this exact format with no extra text:
{
 "instagram": "",
 "whatsapp": "",
 "cta": "",
 "poster": "",
 "hashtags": ["", "", "", "", ""]
}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    const parsedContent = JSON.parse(jsonMatch[0]);

    // Generate Poster Image URL using a free AI image generator (Pollinations AI) based on Gemini's output
    const imagePrompt = `A high quality promotional poster for a business. Business type: ${business}. Offer: ${offer}. Location: ${location}. Poster text: ${parsedContent.poster || ''}`;
    const posterImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`;
    console.log('Generated Poster Image URL:', posterImageUrl);

    parsedContent.posterImage = posterImageUrl;

    // 4. Deduct credit
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1)
    });

    return parsedContent;

  } catch (error: any) {
    console.error('Gemini Error:', error);
    const errorMsg = error?.message || 'Unknown error';
    console.error('Error Message:', errorMsg);
    throw new functions.https.HttpsError('internal', `AI Error: ${errorMsg}`);
  }
});
