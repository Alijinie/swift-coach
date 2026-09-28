// booking.js - BUS LIST + 61-SEAT MAP (3+2), black + yellow dark theme
const Booking = {
  renderBusList() {
    const buses = DB.buses;
    const html = `
      <div class="rise">
        <div class="flex flex-wrap items-end justify-between gap-2 mb-3 sm:mb-5">
          <div class="min-w-0">
            <h2 class="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">Kampala ↔ Ibanda</h2>
            <p class="text-xs sm:text-sm text-zinc-400">Today • ${buses.length} departures • Tap a bus to pick a seat</p>
          </div>
          <span class="shrink-0 text-[11px] sm:text-xs font-bold bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#FFD60A] animate-pulse"></span>Live seats</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          ${buses.map(bus => {
            const available = 61 - bus.bookedSeats.length;
            const low = available <= 10;
            return `
            <article class="press bg-[#131316] rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-800 cursor-pointer hover:border-[#FFD60A]/50" onclick="Booking.selectBus('${bus.id}')" role="button" tabindex="0" onkeypress="if(event.key==='Enter')Booking.selectBus('${bus.id}')">
              <div class="flex justify-between items-center gap-2 mb-2.5">
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${bus.status === 'En Route' ? 'bg-[#FFD60A] text-black' : bus.status === 'Departed' ? 'bg-zinc-800 text-zinc-400' : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'}">${bus.status}</span>
                <span class="text-[11px] text-zinc-500 font-medium truncate">${bus.id} • 61 seats</span>
              </div>
              <h3 class="font-bold text-white text-[15px] sm:text-base leading-snug">${bus.name}</h3>
              <p class="text-[13px] text-zinc-400 mt-0.5">${bus.from} → ${bus.to} • ${bus.time} • ${bus.driver}</p>
              <div class="flex justify-between items-end mt-3">
                <div><span class="font-extrabold text-[#FFD60A] text-[15px]">UGX ${bus.price.toLocaleString()}</span><span class="text-[11px] text-zinc-500"> / seat</span></div>
                <div class="text-right"><div class="text-sm font-bold ${low ? 'text-orange-400' : 'text-[#FFD60A]'}">${available} left</div><div class="text-[11px] text-zinc-500">${bus.bookedSeats.length} booked</div></div>
              </div>
              <div class="h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden"><div class="h-full rounded-full ${low ? 'bg-orange-500' : 'bg-[#FFD60A]'}" style="width:${Math.round(bus.bookedSeats.length / 61 * 100)}%"></div></div>
              <button class="mt-3 w-full bg-[#FFD60A] active:bg-[#FFCC00] text-black py-3 min-h-[48px] rounded-xl font-extrabold text-[15px]">Select Bus</button>
            </article>`;
          }).join('')}
        </div>
      </div>
    `;
    document.getElementById('bus-list-view').innerHTML = html;
    document.getElementById('bus-list-view').classList.remove('hidden');
    document.getElementById('seat-map-view').classList.add('hidden');
    document.getElementById('payment-view').classList.add('hidden');
  },

  selectBus(busId) {
    const bus = DB.buses.find(b => b.id === busId);
    DB.setSelectedBus(bus);
    DB.setSelectedSeat(0);
    this.renderSeatMap(bus);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderSeatMap(bus) {
    document.getElementById('bus-list-view').classList.add('hidden');
    document.getElementById('payment-view').classList.add('hidden');
    const selected = DB.getSelectedSeat();
    const available = 61 - bus.bookedSeats.length;

    let rowsHtml = '';
    for (let rowStart = 1; rowStart <= 61; rowStart += 5) {
      const rowSeats = [];
      for (let k = 0; k < 5 && rowStart + k <= 61; k++) rowSeats.push(rowStart + k);
      const left = rowSeats.slice(0, 3), right = rowSeats.slice(3);
      const btn = (i) => {
        const isBooked = bus.bookedSeats.includes(i);
        const isSel = selected === i;
        const color = isSel
          ? 'bg-[#FFD60A] text-black ring-2 ring-[#FFD60A]/60 shadow-md'
          : isBooked ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700/60 text-zinc-100 border border-zinc-600/50 active:bg-zinc-600';
        return `<button ${isBooked ? 'disabled' : ''} onclick="Booking.selectSeat(${i})" aria-label="Seat ${i}${isBooked ? ' booked' : ''}" class="seat w-full aspect-square max-h-12 sm:max-h-14 rounded-t-xl rounded-b-lg font-bold text-[13px] sm:text-sm flex items-center justify-center ${color}">${i}</button>`;
      };
      rowsHtml += `<div class="grid grid-cols-[1fr_1fr_1fr_14px_1fr_1fr] sm:grid-cols-[1fr_1fr_1fr_24px_1fr_1fr] gap-1.5 sm:gap-2">
        ${left.map(btn).join('')}<div></div>${right.map(btn).join('')}${right.length === 1 ? '<div></div>' : ''}
      </div>`;
    }

    const html = `
      <div class="rise max-w-md md:max-w-2xl mx-auto bg-[#131316] rounded-3xl shadow-app border border-zinc-800 overflow-hidden">
        <div class="bg-zinc-900/80 border-b border-zinc-800 p-3.5 sm:p-4 flex justify-between items-center gap-3">
          <div class="flex gap-2.5 items-center min-w-0">
            <span class="text-xl sm:text-2xl shrink-0">🚌</span>
            <div class="min-w-0"><h3 class="font-bold text-white text-[15px] sm:text-base truncate">${bus.name}</h3><p class="text-[11px] sm:text-xs text-zinc-400 truncate">${bus.from} → ${bus.to} • Today ${bus.time} • 3+2 Layout</p></div>
          </div>
          <button onclick="Booking.renderBusList()" class="press shrink-0 text-[13px] font-bold text-[#FFD60A] bg-zinc-900 border border-zinc-700 px-3 py-2 min-h-[40px] rounded-full">← Buses</button>
        </div>
        <div class="p-3.5 sm:p-6">
          <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] sm:text-sm mb-4 font-medium text-zinc-300">
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 bg-zinc-600 border border-zinc-500 rounded-t-md"></span> Available ${available}</span>
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 bg-zinc-800 rounded-t-md"></span> Booked ${bus.bookedSeats.length}</span>
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 bg-[#FFD60A] rounded-t-md"></span> Selected ${selected ? 1 : 0}</span>
          </div>
          <p class="text-[10px] sm:text-xs text-center text-zinc-500 mb-3 tracking-widest font-semibold">— FRONT • DRIVER ↑ —</p>
          <div class="bg-black rounded-2xl p-3 sm:p-6 space-y-1.5 sm:space-y-2 border border-zinc-800">${rowsHtml}</div>
          <div class="sticky-action mt-4 p-3.5 sm:p-4 bg-[#FFD60A] text-black rounded-2xl shadow-app flex justify-between items-center gap-3">
            <span class="text-[13px] sm:text-sm font-bold leading-snug">${selected ? `Seat <b>${selected}</b> • UGX 50,000` : 'Select a seat above'}</span>
            <button ${!selected ? 'disabled' : ''} onclick="Payment.render()" class="press shrink-0 bg-black disabled:bg-zinc-700 disabled:text-zinc-400 text-[#FFD60A] px-5 py-3 min-h-[48px] rounded-full font-extrabold text-[14px]">Continue →</button>
          </div>
        </div>
      </div>
    `;
    const seatView = document.getElementById('seat-map-view');
    seatView.innerHTML = html;
    seatView.classList.remove('hidden');
  },

  selectSeat(seatNum) {
    try { if (navigator.vibrate) navigator.vibrate(10); } catch {}
    DB.setSelectedSeat(seatNum);
    this.renderSeatMap(DB.getSelectedBus());
  }
};
