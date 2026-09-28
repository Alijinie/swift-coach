// routes/airtel.js - Airtel Money Integration
// Docs: https://openapiuat.airtel.africa/

const express = require('express');
const axios = require('axios');
const router = express.Router();

let airtelToken = null;
let tokenExpiry = 0;

async function getAirtelToken() {
  if (airtelToken && Date.now() < tokenExpiry) return airtelToken;

  const response = await axios.post(
    `https://openapiuat.airtel.africa/auth/oauth2/token`,
    {
      client_id: process.env.AIRTEL_CLIENT_ID,
      client_secret: process.env.AIRTEL_CLIENT_SECRET,
      grant_type: 'client_credentials'
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  airtelToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
  return airtelToken;
}

router.post('/pay', async (req, res) => {
  try {
    const { amount, phone, seat, busId, passengerName } = req.body;

    let cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '256' + cleanPhone.slice(1);
    if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1);

    const token = await getAirtelToken();
    const referenceId = 'AT-' + Date.now();

    await axios.post(
      `https://openapiuat.airtel.africa/merchant/v1/payments/`,
      {
        reference: referenceId,
        subscriber: {
          country: 'UG',
          currency: 'UGX',
          msisdn: cleanPhone
        },
        transaction: {
          amount: amount,
          country: 'UG',
          currency: 'UGX',
          id: referenceId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Country': 'UG',
          'X-Currency': 'UGX'
        }
      }
    );

    const { data: ticket } = await req.supabase.from('tickets').insert({
      id: referenceId,
      bus_id: busId,
      seat_number: seat,
      passenger_name: passengerName,
      phone: cleanPhone,
      amount: amount,
      payment_method: 'Airtel',
      payment_reference: referenceId,
      status: 'PENDING',
      route: 'Ibanda-Kampala'
    }).select().single();

    console.log(`📲 Airtel Money request to ${cleanPhone} Seat ${seat}`);

    res.json({ success: true, message: 'Airtel Money prompt sent', referenceId });

  } catch (error) {
    console.error('Airtel Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Airtel payment failed', details: error.response?.data });
  }
});

router.get('/status/:referenceId', async (req, res) => {
  // Similar status check for Airtel
  res.json({ status: 'PENDING', message: 'Check Airtel dashboard for real status in sandbox' });
});

module.exports = router;
