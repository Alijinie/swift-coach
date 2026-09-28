// server.js - Main Express Server for SwiftLink Bus
// Handles MTN MoMo + Airtel Money + Tickets

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Make supabase available to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// --- ROUTES ---
app.get('/', (req, res) => {
  res.json({ 
    message: 'SwiftLink Bus API - Kampala ↔ Ibanda',
    endpoints: ['/api/momo/pay', '/api/airtel/pay', '/api/tickets']
  });
});

app.use('/api/momo', require('./routes/momo'));
app.use('/api/airtel', require('./routes/airtel'));
app.use('/api/tickets', require('./routes/tickets'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚌 SwiftLink Backend running on http://localhost:${PORT}`);
  console.log(`📍 Route: Kampala ↔ Ibanda (336km)`);
  console.log(`💰 MTN Env: ${process.env.MTN_ENVIRONMENT} | Airtel Env: ${process.env.AIRTEL_ENVIRONMENT}\n`);
});
