// routes/tickets.js - Ticket management + QR validation

const express = require('express');
const router = express.Router();

// GET /api/tickets - List all tickets (for admin dashboard)
router.get('/', async (req, res) => {
  const { bus_id, status } = req.query;
  let query = req.supabase.from('tickets').select('*').order('created_at', { ascending: false });

  if (bus_id) query = query.eq('bus_id', bus_id);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tickets/:id - Get single ticket (for QR scan)
router.get('/:id', async (req, res) => {
  const { data, error } = await req.supabase
    .from('tickets')
    .select('*, buses(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Ticket not found' });
  res.json(data);
});

// POST /api/tickets/validate - Conductor scans QR
router.post('/validate', async (req, res) => {
  const { ticketId, conductorId, busId } = req.body;

  const { data: ticket, error } = await req.supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error || !ticket) {
    return res.status(404).json({ valid: false, error: 'Ticket not found' });
  }

  if (ticket.status !== 'CONFIRMED') {
    return res.json({ valid: false, error: `Ticket status is ${ticket.status}, not CONFIRMED` });
  }

  if (ticket.boarded) {
    return res.json({ 
      valid: false, 
      error: 'ALREADY BOARDED',
      boardedAt: ticket.boarded_at,
      seat: ticket.seat_number
    });
  }

  if (ticket.bus_id !== busId) {
    return res.json({ valid: false, error: `Wrong bus. Ticket is for ${ticket.bus_id}` });
  }

  // Mark as boarded
  const { data: updated } = await req.supabase
    .from('tickets')
    .update({ 
      boarded: true, 
      boarded_at: new Date().toISOString(),
      conductor_id: conductorId 
    })
    .eq('id', ticketId)
    .select()
    .single();

  console.log(`✅ BOARDED: Seat ${ticket.seat_number} - ${ticket.passenger_name} on ${busId}`);

  res.json({
    valid: true,
    message: 'VALID - BOARDING CONFIRMED',
    ticket: updated,
    passenger: ticket.passenger_name,
    seat: ticket.seat_number
  });
});

// POST /api/tickets - Create ticket manually (for testing)
router.post('/', async (req, res) => {
  const { data, error } = await req.supabase.from('tickets').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
