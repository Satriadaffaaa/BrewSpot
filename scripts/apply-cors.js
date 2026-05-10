const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Setup authentication using current environment variables
const sa = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
};

const storage = new Storage({
  credentials: sa,
  projectId: sa.project_id
});

async function configureCors() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  
  if (!bucketName) {
    console.error('❌ Error: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in .env.local');
    return;
  }

  try {
    const corsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'cors.json'), 'utf8'));
    
    console.log(`⏳ Applying CORS rules to bucket: ${bucketName}...`);
    await storage.bucket(bucketName).setCorsConfiguration(corsConfig);
    console.log('✅ CORS configuration applied successfully!');
    console.log('🌟 Anda sekarang bisa mengunggah file dari localhost!');
  } catch (error) {
    console.error('❌ Failed to apply CORS configuration:');
    if (error.message.includes('bucket does not exist')) {
        console.error('ALASAN: Bucket tidak ditemukan. Anda harus klik "Get Started" di menu Storage pada Firebase Console terlebih dahulu!');
    } else {
        console.error(error.message);
    }
  }
}

configureCors();
