// ticket.js - QR TICKET, black + yellow dark theme
const Ticket = {
  render(ticketId = null) {
    const tickets = DB.getTickets();
    const view = document.getElementById('view-ticket');
    if (tickets.length === 0) {
      view.innerHTML = `
        <div class="rise max-w-md mx-auto bg-[#131316] rounded-3xl p-8 sm:p-12 text-center shadow-app border border-zinc-800">
          <p class="text-5xl mb-4">🎫</p>
          <h3 class="font-extrabold text-lg text-white">No ticket yet</h3>
          <p class="text-sm text-zinc-400 mt-1">Book a seat to get your QR ticket</p>
          <button onclick="App.navigate('booking')" class="press mt-5 bg-[#FFD60A] text-black px-8 py-3.5 min-h-[52px] rounded-full font-extrabold w-full sm:w-auto">Book Now</button>
        </div>`;
      return;
    }
    const ticket = ticketId ? tickets.find(t => t.id === ticketId) : tickets[tickets.length - 1];
    if (!ticket) return;

    const qrData = encodeURIComponent(JSON.stringify({ id: ticket.id, seat: ticket.seat, bus: ticket.busId }));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;

    view.innerHTML = `
      <div class="rise max-w-md mx-auto">
        <div class="bg-gradient-to-b from-[#FFD60A] to-[#b89600] rounded-t-[2rem] p-6 sm:p-8 text-center">
          <div class="w-14 h-14 sm:w-16 sm:h-16 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3"><span class="text-2xl sm:text-3xl text-black font-black">✓</span></div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">Ticket Confirmed!</h2>
          <p class="text-black/70 text-[13px] sm:text-sm mt-1 font-semibold">Show this QR to the conductor when boarding</p>
        </div>
        <div class="-mt-5 bg-[#131316] rounded-[1.75rem] shadow-app border border-zinc-800 p-5 sm:p-6 mx-1.5 sm:mx-2">
          <div class="flex justify-between items-center mb-4">
            <span class="text-[11px] bg-[#FFD60A] text-black px-3 py-1.5 rounded-full font-extrabold tracking-wide">● CONFIRMED</span>
            <span class="text-xl" aria-hidden="true">🚌</span>
          </div>
          <div class="flex justify-between gap-3">
            <div class="min-w-0"><h3 class="text-xl sm:text-2xl font-extrabold truncate text-white">${ticket.from}</h3><p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Depart • ${ticket.time} • ${ticket.date}</p></div>
            <div class="shrink-0 self-center text-[#FFD60A] font-black px-1">→</div>
            <div class="text-right min-w-0"><h3 class="text-xl sm:text-2xl font-extrabold truncate text-white">${ticket.to}</h3><p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Arrive • ~12:30 PM</p></div>
          </div>
          <div class="border-t-2 border-dashed border-zinc-700 my-4 sm:my-5 relative">
            <span class="absolute -left-8 -top-2.5 w-5 h-5 bg-[#09090B] rounded-full border border-zinc-800"></span>
            <span class="absolute -right-8 -top-2.5 w-5 h-5 bg-[#09090B] rounded-full border border-zinc-800"></span>
          </div>
          <div class="flex justify-between gap-3 text-sm">
            <div class="min-w-0"><p class="text-zinc-500 text-[11px] font-semibold uppercase tracking-wide">Bus</p><p class="font-bold text-[14px] truncate text-zinc-100">${ticket.busName} • ${ticket.busId}</p></div>
            <div class="text-right shrink-0"><p class="text-zinc-500 text-[11px] font-semibold uppercase tracking-wide">Seat</p><p class="font-extrabold text-2xl text-[#FFD60A]">${ticket.seat}</p></div>
          </div>
          <div class="flex justify-between gap-3 text-sm mt-3">
            <div><p class="text-zinc-500 text-[11px] font-semibold uppercase tracking-wide">Passenger</p><p class="font-bold text-[14px] text-zinc-100">${ticket.passenger}</p></div>
            <div class="text-right"><p class="text-zinc-500 text-[11px] font-semibold uppercase tracking-wide">Class</p><p class="font-bold text-[14px] text-zinc-100">Standard</p></div>
          </div>
          <div class="mt-5 text-center bg-white rounded-2xl p-4 border border-zinc-700">
            <img src="${qrUrl}" alt="Ticket QR code" loading="lazy" class="w-40 h-40 sm:w-44 sm:h-44 mx-auto rounded-xl bg-white" />
            <p class="text-[11px] font-bold mt-2 text-black">Scan to validate ticket</p>
            <p class="text-[10px] text-zinc-600 mt-0.5 font-mono break-all">${ticket.id}</p>
          </div>
          ${tickets.length > 1 ? `
          <div class="mt-4">
            <label for="ticket-switch" class="text-[11px] font-bold uppercase tracking-wide text-zinc-500">All tickets (${tickets.length})</label>
            <select id="ticket-switch" onchange="Ticket.render(this.value)" class="mt-1.5 w-full p-3 min-h-[48px] border border-zinc-700 rounded-xl bg-black text-zinc-100 font-semibold text-sm">
              ${[...tickets].reverse().map(t => `<option value="${t.id}" ${t.id === ticket.id ? 'selected' : ''}>Seat ${t.seat} • ${t.busId} • ${t.id}</option>`).join('')}
            </select>
          </div>` : ''}
        </div>
        <div class="mx-1.5 sm:mx-2 mt-3 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-2xl p-4 flex justify-between items-center gap-3">
          <div class="min-w-0"><div class="flex items-center gap-2"><div class="w-11 h-6 ${ticket.paymentMethod === 'MTN' ? 'bg-[#FFD60A] text-black' : 'bg-red-600 text-white'} rounded-md text-[11px] font-extrabold flex items-center justify-center px-1">${ticket.paymentMethod}</div><span class="text-[11px] font-semibold text-zinc-300">Paid</span></div><p class="text-[10px] text-zinc-500 mt-1 truncate">Txn: ${ticket.transactionId}</p></div>
          <p class="font-extrabold text-[#FFD60A] text-base sm:text-lg shrink-0">${ticket.amount.toLocaleString()} UGX</p>
        </div>
        <div class="mx-1.5 sm:mx-2 grid sm:grid-cols-2 gap-2.5 mt-3">
          <button onclick="window.print()" class="press w-full bg-[#FFD60A] active:bg-[#FFCC00] text-black py-3.5 min-h-[52px] rounded-2xl font-extrabold text-[15px]">⬇ Download</button>
          <button onclick="Ticket.share('${ticket.id}')" class="press w-full border-2 border-[#FFD60A] text-[#FFD60A] py-3.5 min-h-[52px] rounded-2xl font-bold text-[15px] bg-transparent">↗ Share</button>
        </div>
        <p class="text-[11px] text-center text-zinc-500 mt-3 px-4">Present this ticket & QR code to the conductor upon boarding</p>
      </div>
    `;
  },

  share(id) {
    const tickets = DB.getTickets();
    const t = tickets.find(x => x.id === id);
    const text = t ? `SwiftLink ${t.from}→${t.to} Seat ${t.seat} • ${t.id}` : id;
    if (navigator.share) navigator.share({ title: 'My Bus Ticket', text }).catch(() => {});
    else { try { navigator.clipboard.writeText(text); App.toast('Ticket ID copied'); } catch { alert('Ticket ID: ' + id); } }
  }
};
