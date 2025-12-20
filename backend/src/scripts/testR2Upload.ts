import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure S3 client for Cloudflare R2
const endpoint = process.env.R2_ENDPOINT;
const accessKey = process.env.R2_ACCESS_KEY || '';
const secretKey = process.env.R2_SECRET_KEY || '';

console.log('Endpoint:', endpoint);
console.log('Access Key (first 4 chars):', accessKey.substring(0, 4) + '...');
console.log('Secret Key (length):', secretKey.length);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';
const publicUrl = process.env.R2_PUBLIC_URL || '';

/**
 * Test uploading a file to Cloudflare R2
 */
async function testUpload() {
  try {
    console.log('Testing Cloudflare R2 upload...');
    
    // Check if environment variables are set
    if (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET_NAME || !process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY) {
      console.error('Error: Missing R2 environment variables. Please check your .env file.');
      return;
    }
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for R2 upload.');
    
    // Read the test file
    const fileContent = fs.readFileSync(testFilePath);
    
    // Upload the file to R2
    const uniqueFilename = `test/test-file-${Date.now()}.txt`;
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: fileContent,
      ContentType: 'text/plain',
    };
    
    console.log(`Uploading to bucket: ${bucketName}`);
    console.log(`Using endpoint: ${process.env.R2_ENDPOINT}`);
    
    const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Upload successful:', uploadResult);
    console.log(`File URL: ${publicUrl}/${uniqueFilename}`);
    
    // List objects in the bucket to verify
    const listParams = {
      Bucket: bucketName,
      Prefix: 'test/',
    };
    
    const listResult = await s3Client.send(new ListObjectsV2Command(listParams));
    console.log('Objects in bucket:');
    listResult.Contents?.forEach(item => {
      console.log(` - ${item.Key} (${item.Size} bytes)`);
    });
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during R2 upload test:', error);
  }
}

// Run the test
testUpload();
