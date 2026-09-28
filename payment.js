// payment.js - MTN MoMo & Airtel Money, black + yellow dark theme
const Payment = {
  method: 'MTN',

  render() {
    const bus = DB.getSelectedBus();
    const seat = DB.getSelectedSeat();
    if (!bus || !seat) { Booking.renderBusList(); return; }
    document.getElementById('seat-map-view').classList.add('hidden');
    document.getElementById('bus-list-view').classList.add('hidden');

    const mActive = this.method === 'MTN';
    const aActive = this.method === 'Airtel';
    const html = `
      <div class="rise max-w-md mx-auto">
        <button onclick="Booking.renderSeatMap(DB.getSelectedBus())" class="press mb-3 text-[13px] font-bold text-[#FFD60A] bg-[#131316] border border-zinc-700 px-4 py-2.5 min-h-[44px] rounded-full shadow-sm">← Change seat</button>
        <div class="bg-[#131316] rounded-3xl shadow-app border border-zinc-800 overflow-hidden">
          <div class="p-4 sm:p-6">
            <h2 class="font-extrabold text-lg sm:text-xl tracking-tight text-white">Payment</h2>
            <p class="text-xs text-zinc-400 mb-4">Secure Mobile Money checkout</p>
            <div class="bg-black rounded-2xl p-4 mb-5 border border-zinc-800">
              <p class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Trip Summary</p>
              <h3 class="font-bold text-white text-[15px] mt-1">${bus.name} • Wi-Fi • AC</h3>
              <div class="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div><p class="text-zinc-500 text-xs">Route</p><p class="font-bold text-[14px] text-zinc-100">${bus.from} → ${bus.to}</p><p class="text-[11px] text-zinc-500">336 km</p></div>
                <div><p class="text-zinc-500 text-xs">Departure</p><p class="font-bold text-[14px] text-zinc-100">${bus.time}</p><p class="text-[11px] text-zinc-500">Seat ${seat} • Standard</p></div>
              </div>
              <div class="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800 font-bold"><span class="text-sm text-zinc-300">Total to Pay</span><span class="text-[#FFD60A] text-lg">UGX 50,000</span></div>
            </div>

            <h3 class="font-bold text-[15px] mb-2.5 text-white">Payment Method</h3>
            <div class="space-y-2.5" role="radiogroup" aria-label="Payment method">
              <button onclick="Payment.setMethod('MTN')" role="radio" aria-checked="${mActive}" class="press w-full flex items-center gap-3 p-3.5 min-h-[68px] border-2 ${mActive ? 'border-[#FFD60A] bg-[#FFD60A]/10' : 'border-zinc-800 bg-black'} rounded-2xl text-left">
                <div class="w-12 h-9 bg-[#FFD60A] rounded-lg flex items-center justify-center font-black text-[13px] text-black shrink-0 shadow-sm">MTN</div>
                <div class="flex-1 min-w-0"><p class="font-bold text-[14px] text-white">MTN Mobile Money</p><p class="text-[11px] ${mActive ? 'text-[#FFD60A] font-semibold' : 'text-zinc-500'}">Recommended • Fast & Secure</p></div>
                <div class="w-6 h-6 rounded-full border-2 ${mActive ? 'bg-[#FFD60A] border-[#FFD60A] text-black' : 'border-zinc-600 text-transparent'} flex items-center justify-center text-xs font-bold shrink-0">✓</div>
              </button>
              <button onclick="Payment.setMethod('Airtel')" role="radio" aria-checked="${aActive}" class="press w-full flex items-center gap-3 p-3.5 min-h-[68px] border-2 ${aActive ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-black'} rounded-2xl text-left">
                <div class="w-12 h-9 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm">airtel</div>
                <div class="flex-1 min-w-0"><p class="font-bold text-[14px] text-white">Airtel Money</p><p class="text-[11px] text-zinc-500">Instant confirmation</p></div>
                <div class="w-6 h-6 rounded-full border-2 ${aActive ? 'bg-red-600 border-red-600 text-white' : 'border-zinc-600 text-transparent'} flex items-center justify-center text-xs font-bold shrink-0">✓</div>
              </button>
            </div>

            <div class="mt-5">
              <label for="pay-phone" class="font-semibold text-sm text-zinc-200">Phone Number</label>
              <input id="pay-phone" type="tel" inputmode="tel" autocomplete="tel" class="mt-2 w-full p-4 min-h-[52px] border-2 border-zinc-700 focus:border-[#FFD60A] rounded-2xl outline-none bg-black focus:bg-zinc-900 text-white transition placeholder:text-zinc-600" placeholder="07XX XXX XXX" value="0789462495" />
              <p class="text-[11px] text-zinc-500 mt-1.5">This number will receive the ${this.method} MoMo prompt</p>
            </div>

            <label class="flex gap-2.5 mt-4 text-[12px] text-zinc-400 leading-snug"><input type="checkbox" checked class="mt-0.5 w-4 h-4 accent-[#FFD60A] shrink-0"/> <span>No refunds if you miss the bus. You'll join the next-bus queue.</span></label>

            <button id="pay-btn" onclick="Payment.pay()" class="press w-full mt-5 bg-[#FFD60A] active:bg-[#FFCC00] text-black py-4 min-h-[56px] rounded-2xl font-extrabold text-[16px] shadow-app">Pay Now • UGX 50,000</button>
            <p class="text-[11px] text-center text-zinc-500 mt-3">🔒 Secured by ${this.method} MoMo. Enter your PIN when prompted.</p>
          </div>
        </div>
      </div>
    `;
    const pv = document.getElementById('payment-view');
    pv.innerHTML = html;
    pv.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setMethod(m) { this.method = m; this.render(); },

  pay() {
    const phoneEl = document.getElementById('pay-phone');
    const phone = (phoneEl.value || '').replace(/\s+/g, '');
    if (!phone || phone.length < 10 || !/^0[17]\d{8}$/.test(phone)) {
      App.toast('Enter a valid UG number (07… / 01…)');
      phoneEl.focus();
      phoneEl.classList.add('border-red-400');
      return;
    }
    const btn = document.getElementById('pay-btn');
    btn.innerHTML = `<span class="inline-block animate-pulse">⏳ Check your phone — ${this.method} prompt sent…</span>`;
    btn.disabled = true;
    btn.classList.add('opacity-80');

    setTimeout(() => {
      const bus = DB.getSelectedBus();
      const seat = DB.getSelectedSeat();
      const ticket = {
        id: 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        transactionId: this.method + '2409' + Math.floor(Math.random() * 10000000),
        busId: bus.id, busName: bus.name, from: bus.from, to: bus.to, time: bus.time,
        seat, passenger: 'John M.', phone,
        paymentMethod: this.method, amount: 50000,
        date: 'Tue, 23 Sep 2026', status: 'CONFIRMED', boarded: false,
        createdAt: new Date().toISOString()
      };
      const tickets = DB.getTickets();
      tickets.push(ticket);
      DB.saveTickets(tickets);
      const live = DB.buses.find(b => b.id === bus.id);
      if (live && !live.bookedSeats.includes(seat)) live.bookedSeats.push(seat);
      DB.setSelectedSeat(0);
      App.toast('✅ Payment successful!');
      setTimeout(() => { App.navigate('ticket'); Ticket.render(ticket.id); }, 350);
    }, 2200);
  }
};
