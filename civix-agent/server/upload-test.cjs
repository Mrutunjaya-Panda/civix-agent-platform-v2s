require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const https = require('https');
const http = require('http');

// Download a pothole image
const file = fs.createWriteStream('./test-pothole.jpg');
https.get('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400', (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close(async () => {
      try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream('./test-pothole.jpg'));
        form.append('upload_preset', process.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const response = await fetch(uploadUrl, { method: 'POST', body: form });
        const data = await response.json();
        console.log('Cloudinary URL:', data.secure_url);
        fs.unlinkSync('./test-pothole.jpg');
        process.exit(0);
      } catch (err) {
        console.error('Upload failed:', err.message);
        process.exit(1);
      }
    });
  });
});
