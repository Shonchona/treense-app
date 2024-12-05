const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const port = 3000;

// Supabase configuration
const supabaseUrl = 'https://zjvbmahavecgovtgjkch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdmJtYWhhdmVjZ292dGdqa2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMDM0MDQsImV4cCI6MjA0ODY3OTQwNH0.s6D59MWDEeEAKUnAco7_RSoLjbkRbivqhJaMmVpttpQ'; // Replace with your actual Supabase key
const supabase = createClient(supabaseUrl, supabaseKey);

// Enable CORS for mobile app
app.use(cors());

// Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enable JSON parsing for POST request
app.use(express.json());

// Endpoint to upload the image and save classification & location
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, classification } = req.body; // Access location and classification from request body
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    if (!classification) {
      console.log("Warning: Classification is missing!");
      return res.status(400).send('Classification is missing.');
    }

    // Upload image to Supabase storage
    const { data, error } = await supabase.storage
      .from('plant-images') // Your Supabase bucket name
      .upload(`uploads/${Date.now()}_${file.originalname}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Generate public URL
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/plant-images/${data.path}`;

    // Insert metadata into the database (classifications table)
    const { error: insertError } = await supabase
      .from('plant_classifications')
      .insert([{
        image_url: imageUrl,
        classification: classification,
        location: `Latitude: ${latitude}, Longitude: ${longitude}`,
      }]);

    if (insertError) throw insertError;

    res.status(200).send({
      message: 'File uploaded and classified successfully',
      filePath: data.path,
      classification,
      location: { latitude, longitude },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'File upload failed' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://192.168.68.108:${port}`); // Replace with your computer's local IP
});
