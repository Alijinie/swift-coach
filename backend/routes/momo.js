// routes/momo.js - MTN Mobile Money Integration
// Docs: https://momodeveloper.mtn.com/docs/services/collection/

const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Cache for access token
let momoToken = null;
let tokenExpiry = 0;

/**
 * STEP 1: Get MTN Access Token
 * This token is valid for 1 hour
 */
async function getMtnToken() {
  if (momoToken && Date.now() < tokenExpiry) return momoToken;

  const response = await axios.post(
    `https://proxy.momoapi.mtn.com/collection/token/`,
    {},
    {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
        'Authorization': `Basic ${Buffer.from(`${process.env.MTN_API_USER_ID}:${process.env.MTN_API_KEY}`).toString('base64')}`
      }
    }
  );

  momoToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min early
  return momoToken;
}

/**
 * POST /api/momo/pay
 * Frontend calls this when user clicks "Pay Now"
 * Body: { amount, phone, seat, busId, passengerName }
 */
router.post('/pay', async (req, res) => {
  try {
    const { amount, phone, seat, busId, passengerName } = req.body;

    // Validate Ugandan phone: 07xxxxxxxx or +2567xxxxxxxx
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^0?7\d{8}$|^\+2567\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Invalid Ugandan number. Use 07XXXXXXXX' });
    }

    // Format to 256 format required by MTN
    let mtnPhone = cleanPhone;
    if (mtnPhone.startsWith('0')) mtnPhone = '256' + mtnPhone.slice(1);
    if (mtnPhone.startsWith('+')) mtnPhone = mtnPhone.slice(1);

    const referenceId = uuidv4(); // This is your transaction ID
    const token = await getMtnToken();

    // --- THIS IS THE REAL MTN REQUEST ---
    await axios.post(
      `https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: 'UGX',
        externalId: referenceId.slice(0, 20),
        payer: {
          partyIdType: 'MSISDN',
          partyId: mtnPhone
        },
        payerMessage: `SwiftLink Bus Seat ${seat} Kampala-Ibanda`,
        payeeNote: `Ticket for ${passengerName}`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save as pending ticket in Supabase
    const { data: ticket } = await req.supabase.from('tickets').insert({
      id: referenceId,
      bus_id: busId,
      seat_number: seat,
      passenger_name: passengerName,
      phone: mtnPhone,
      amount: amount,
      payment_method: 'MTN',
      payment_reference: referenceId,
      status: 'PENDING',
      route: 'Ibanda-Kampala'
    }).select().single();

    console.log(`📲 MTN MoMo request sent to ${mtnPhone} for Seat ${seat} - Ref: ${referenceId}`);

    res.json({
      success: true,
      message: 'MTN MoMo prompt sent. Ask passenger to enter PIN.',
      referenceId,
      ticketId: ticket?.id || referenceId
    });

  } catch (error) {
    console.error('MTN Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'MTN payment failed',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * GET /api/momo/status/:referenceId
 * Frontend polls this every 3s after Pay Now
 */
router.get('/status/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;
    const token = await getMtnToken();

    const response = await axios.get(
      `https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY
        }
      }
    );

    const status = response.data.status; // PENDING, SUCCESSFUL, FAILED

    // If successful, update ticket to CONFIRMED
    if (status === 'SUCCESSFUL') {
      await req.supabase.from('tickets')
        .update({ status: 'CONFIRMED', paid_at: new Date().toISOString() })
        .eq('payment_reference', referenceId);
    }

    res.json({ status, data: response.data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/momo/callback
 * MTN calls this when payment completes (set this URL in MTN dashboard)
 */
router.post('/callback', async (req, res) => {
  console.log('MTN Callback:', req.body);
  const { externalId, status } = req.body;
  // Update DB based on callback
  res.sendStatus(200);
});

module.exports = router;
