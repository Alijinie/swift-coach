// admin.js - REVENUE + OCCUPANCY + MISSED QUEUE, black + yellow dark theme
const Admin = {
  render() {
    const tickets = DB.getTickets();
    const totalRevenue = tickets.reduce((s, t) => s + t.amount, 0);
    const mtn = tickets.filter(t => t.paymentMethod === 'MTN');
    const airtel = tickets.filter(t => t.paymentMethod === 'Airtel');
    const visa = tickets.filter(t => t.paymentMethod === 'Visa');

    const total = tickets.length || 1;
    const mtnPct = Math.round(mtn.length / total * 100) || 44;
    const airtelPct = Math.round(airtel.length / total * 100) || 35;
    const visaPct = Math.max(0, 100 - mtnPct - airtelPct);

    document.getElementById('view-admin').innerHTML = `
      <div class="rise bg-black rounded-3xl p-4 sm:p-6 text-zinc-100 shadow-app border border-zinc-800 overflow-hidden">
        <div class="flex flex-wrap justify-between items-start gap-3">
          <div class="min-w-0"><h2 class="text-lg sm:text-2xl font-extrabold tracking-tight text-white">Dashboard Overview</h2><p class="text-[11px] sm:text-sm text-zinc-400 mt-0.5">Ibanda ↔ Kampala • Today, 23 Sep 2026</p></div>
          <div class="flex gap-2 shrink-0">
            <button onclick="App.toast('Report export coming soon')" class="press bg-zinc-900 border border-zinc-700 active:bg-zinc-800 px-3.5 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold">↓ Export</button>
            <button onclick="Admin.render();App.toast('Dashboard refreshed')" class="press bg-[#FFD60A] text-black active:bg-[#FFCC00] px-3.5 py-2.5 min-h-[44px] rounded-xl text-[13px] font-extrabold">↻ Refresh</button>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
          <div class="bg-[#131316] rounded-2xl p-3.5 sm:p-4 border border-[#FFD60A]/40"><p class="text-[11px] text-[#FFD60A] font-bold">Total Revenue</p><p class="text-base sm:text-xl font-extrabold mt-1 text-white">${(totalRevenue || 4800000).toLocaleString()} <span class="text-[11px] font-semibold">UGX</span></p><p class="text-[11px] text-green-400 mt-1">↑ 12.4% vs last week</p></div>
          <div class="bg-[#131316] rounded-2xl p-3.5 sm:p-4 border border-zinc-800"><p class="text-[11px] text-zinc-400 font-semibold">Transactions</p><p class="text-base sm:text-xl font-extrabold mt-1 text-white">${tickets.length || 128}</p><p class="text-[11px] text-zinc-500 mt-1">MTN • Airtel • Visa</p></div>
          <div class="bg-[#131316] rounded-2xl p-3.5 sm:p-4 border border-zinc-800"><p class="text-[11px] text-zinc-400 font-semibold">Seat Occupancy</p><p class="text-base sm:text-xl font-extrabold mt-1 text-white">48 / 61</p><p class="text-[11px] text-[#FFD60A] mt-1">79% • Live</p></div>
          <div class="bg-[#131316] rounded-2xl p-3.5 sm:p-4 border border-zinc-800"><p class="text-[11px] text-zinc-400 font-semibold">Missed Queue</p><p class="text-base sm:text-xl font-extrabold mt-1 text-white">6 queued</p><p class="text-[11px] text-orange-400 mt-1">+2 from yesterday</p></div>
        </div>

        <div class="grid md:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-6">
          <div class="md:col-span-2 bg-[#131316] rounded-2xl p-4 sm:p-5 border border-zinc-800">
            <h3 class="font-bold text-[15px] text-white">Revenue — Payment Split</h3><p class="text-[11px] text-zinc-500 mt-0.5">Sept 2026 • ${(totalRevenue || 4800000).toLocaleString()} UGX</p>
            <div class="mt-4 space-y-3 text-[12px]">
              <div class="flex items-center gap-2.5"><span class="w-11 h-8 bg-[#FFD60A] rounded-lg flex items-center justify-center text-[11px] font-extrabold text-black shrink-0">MTN</span><div class="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden flex min-w-0"><div class="bg-[#FFD60A] h-7 shrink-0" style="width:${mtnPct}%"></div><div class="bg-zinc-700 h-7 flex-1 flex items-center justify-end pr-2 text-[11px] font-bold text-zinc-200">${mtnPct}%</div></div><span class="text-[11px] w-24 sm:w-32 text-right shrink-0 text-zinc-400">${(mtn.reduce((s, t) => s + t.amount, 0) || 2110000).toLocaleString()} • ${mtnPct}%</span></div>
              <div class="flex items-center gap-2.5"><span class="w-11 h-8 bg-red-500 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0">airtel</span><div class="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden min-w-0"><div class="bg-red-500 rounded-full h-7 flex items-center justify-end pr-3 text-[11px] font-bold text-white" style="width:${Math.max(airtelPct, 12)}%">${airtelPct}%</div></div><span class="text-[11px] w-24 sm:w-32 text-right shrink-0 text-zinc-400">${(airtel.reduce((s, t) => s + t.amount, 0) || 1680000).toLocaleString()} • ${airtelPct}%</span></div>
              <div class="flex items-center gap-2.5"><span class="w-11 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-[11px] font-bold text-black shrink-0">VISA</span><div class="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden min-w-0"><div class="bg-zinc-100 rounded-full h-7 flex items-center justify-end pr-3 text-[11px] font-bold text-black" style="width:${Math.max(visaPct, 12)}%">${visaPct}%</div></div><span class="text-[11px] w-24 sm:w-32 text-right shrink-0 text-zinc-400">${(visa.reduce((s, t) => s + t.amount, 0) || 1010000).toLocaleString()} • ${visaPct}%</span></div>
            </div>
            <p class="text-[11px] text-zinc-500 mt-4">Transactions: ${tickets.length || 128} total • MTN ${mtn.length || 56} • Airtel ${airtel.length || 45} • Visa ${visa.length || 27}</p>
          </div>

          <div class="bg-[#FFD60A] rounded-2xl p-4 text-black">
            <h3 class="font-extrabold text-[13px]">Live Seat Map — UBQ-721J</h3><p class="text-[11px] text-black/60 font-semibold">Ibanda → Kampala • 48/61 • Live</p>
            <div class="mt-3 bg-black/90 p-3 rounded-xl grid grid-cols-8 sm:grid-cols-10 gap-1 border border-black/20">
              ${Array.from({ length: 61 }, (_, i) => `<div class="aspect-square rounded-[4px] ${i < 48 ? 'bg-[#FFD60A]' : 'bg-zinc-700'}"></div>`).join('')}
            </div>
            <div class="flex gap-3 text-[10px] font-bold mt-2"><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-black"></span>Occupied</span><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-zinc-700 border border-black/30"></span>Available</span></div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-6">
          <div class="md:col-span-2 bg-[#131316] rounded-2xl p-4 sm:p-5 border border-zinc-800 overflow-hidden">
            <h3 class="font-bold text-[15px] text-white">Bus Schedules</h3>
            <div class="mt-3 -mx-4 sm:mx-0 overflow-x-auto no-scrollbar">
              <table class="w-full text-[12px] min-w-[560px] px-4 text-zinc-200">
                <thead><tr class="text-zinc-500 text-left"><th class="text-left p-2 font-semibold">TIME</th><th class="text-left font-semibold">BUS</th><th class="font-semibold">DRIVER</th><th class="font-semibold">STATUS</th><th class="font-semibold">BOOKED</th></tr></thead>
                <tbody>${DB.buses.map(b => `<tr class="border-t border-zinc-800"><td class="p-2.5 font-semibold whitespace-nowrap">${b.time}</td><td class="whitespace-nowrap">${b.id} • 61</td><td class="whitespace-nowrap">${b.driver}</td><td><span class="inline-block px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${b.status === 'Departed' ? 'bg-zinc-700 text-zinc-300' : b.status === 'En Route' ? 'bg-[#FFD60A] text-black' : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'}">${b.status}</span></td><td class="font-semibold">${b.bookedSeats.length}/61</td></tr>`).join('')}</tbody>
              </table>
            </div>
          </div>
          <div class="bg-[#131316] rounded-2xl p-4 sm:p-5 border border-zinc-800">
            <h3 class="font-bold text-[15px] text-white">Missed Queue</h3><p class="text-[11px] text-zinc-500">6 passengers • Not on board</p>
            <div class="mt-3 space-y-2 text-[12px] max-h-72 overflow-y-auto">
              ${['Jane Kobusingye', 'Peter Tugume', 'Sarah Nalweyiso', 'Moses Kato', 'Annet Birungi', 'James Mugisha'].map((name, i) => `<div class="flex justify-between items-center gap-2 bg-black border border-zinc-800 p-2.5 rounded-xl"><div class="min-w-0"><p class="font-bold truncate text-zinc-100">${name}</p><p class="text-[10px] text-zinc-500">07${i}***${i} • Missed 06:30</p></div><span class="text-[10px] font-bold px-2.5 py-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-[#FFD60A] text-black' : 'bg-zinc-800 text-zinc-400'}">${i === 0 ? 'Rebook' : 'Queued'}</span></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
