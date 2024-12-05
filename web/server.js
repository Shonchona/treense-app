const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Supabase setup
const supabaseUrl = 'https://zjvbmahavecgovtgjkch.supabase.co';
const supabaseKey = '<YOUR_SUPABASE_KEY>';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('password', password);

  if (error || data.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login successful' });
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const { error } = await supabase
    .from('admins')
    .insert([{ name, email, password }]);

  if (error) return res.status(400).json({ message: 'Signup failed' });

  res.json({ message: 'Signup successful' });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
