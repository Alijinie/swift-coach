// conductor.js - QR SCANNER + MANIFEST, fixed camera lifecycle, black + yellow theme
const Conductor = {
  currentBusId: 'ALL',
  filterBusId: 'ALL',
  _scanner: null,
  _starting: false,
  _scanCooldownUntil: 0,

  resolveDefaultBus() {
    const tickets = DB.getTickets();
    if (tickets.length) return tickets[tickets.length - 1].busId;
    const sel = DB.getSelectedBus();
    if (sel && sel.id) return sel.id;
    return 'UBQ-721J';
  },

  busInfo(busId) {
    const b = DB.buses.find(x => x.id === busId);
    return b || { id: busId, name: 'All buses', from: 'IBANDA', to: 'KAMPALA' };
  },

  render() {
    if (!this.currentBusId || this.currentBusId === 'ALL') {
      this.currentBusId = this.resolveDefaultBus();
      this.filterBusId = this.currentBusId;
    }
    const tickets = DB.getTickets();
    const visible = this.filterBusId === 'ALL' ? tickets : tickets.filter(t => t.busId === this.filterBusId);
    const boarded = visible.filter(t => t.boarded).length;
    const total = visible.length;
    const info = this.busInfo(this.filterBusId === 'ALL' ? this.currentBusId : this.filterBusId);
    const insecure = !window.isSecureContext;
    const libMissing = typeof Html5Qrcode === 'undefined';

    document.getElementById('view-conductor').innerHTML = `
      <div class="rise max-w-md md:max-w-2xl mx-auto">
        <div class="bg-[#131316] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-app border border-zinc-800">
          <div class="p-4 sm:p-5 text-center border-b border-zinc-800">
            <h2 class="font-extrabold text-lg sm:text-xl text-white">🛡️ Conductor App</h2>
            <div class="mt-2.5 flex flex-wrap justify-center items-center gap-2">
              <span class="text-[11px] font-bold bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30 px-3 py-1.5 rounded-full">● ACTIVE • LIVE</span>
              <select onchange="Conductor.switchBus(this.value)" aria-label="Select bus" class="text-[12px] font-bold bg-zinc-900 text-zinc-100 border border-zinc-700 px-3 py-1.5 rounded-full outline-none min-h-[36px] max-w-[180px]">
                <option value="ALL" ${this.filterBusId === 'ALL' ? 'selected' : ''}>All buses</option>
                ${DB.buses.map(b => `<option value="${b.id}" ${b.id === this.filterBusId ? 'selected' : ''}>${b.id}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="bg-black p-3.5 sm:p-4">
            <div class="border-2 border-[#FFD60A]/40 rounded-2xl p-3.5 sm:p-4 bg-[#0c0c0e]">
              <p class="text-[#FFD60A] text-[13px] font-bold text-center mb-1">● Ticket Scanner</p>
              <div id="scanner-status" class="text-center text-[12px] text-zinc-400 mb-2.5" aria-live="polite">Tap Start to enable the camera. Manual entry always works.</div>
              <div id="reader" class="bg-zinc-900 rounded-xl overflow-hidden min-h-[160px] border border-zinc-800"></div>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button id="scan-start-btn" onclick="Conductor.startScanner()" class="press bg-[#FFD60A] active:bg-[#FFCC00] text-black font-extrabold px-4 min-h-[48px] rounded-2xl text-[14px]">▶ Start scan</button>
                <button onclick="Conductor.stopScanner(true)" class="press bg-zinc-800 active:bg-zinc-700 text-zinc-100 font-bold px-4 min-h-[48px] rounded-2xl text-[14px] border border-zinc-700">■ Stop</button>
              </div>
              ${insecure ? `<p class="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-xl p-2.5 mt-3">⚠️ Camera needs HTTPS or localhost. You are on an insecure origin, so use manual entry or the demo button below.</p>` : ''}
              ${libMissing ? `<p class="text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mt-3">❌ Scanner library failed to load (network blocked). Manual entry still works.</p>` : ''}
            </div>
            <div class="mt-3 flex gap-2">
              <input id="manual-ticket" enterkeyhint="go" autocomplete="off" spellcheck="false" placeholder="Ticket ID (e.g. TKT-…)" class="flex-1 min-w-0 p-3.5 min-h-[52px] rounded-2xl text-sm bg-zinc-900 text-zinc-100 border border-zinc-700 outline-none focus:border-[#FFD60A] placeholder:text-zinc-500" />
              <button onclick="Conductor.validateManual()" class="press shrink-0 bg-[#FFD60A] active:bg-[#FFCC00] text-black font-extrabold px-5 min-h-[52px] rounded-2xl text-[14px]">Validate</button>
            </div>
            <button onclick="Conductor.demoScan()" class="press w-full mt-2 bg-zinc-900 border border-dashed border-zinc-700 text-zinc-300 font-semibold px-4 min-h-[48px] rounded-2xl text-[13px]">🎫 No camera? Tap to validate latest ticket (demo)</button>
          </div>

          <div id="validation-result" class="px-3.5 sm:px-4 bg-black pb-2" aria-live="polite"></div>

          <div class="p-3.5 sm:p-4 bg-[#09090B]">
            <div class="bg-[#1C1C1F] rounded-2xl p-4 border border-zinc-800">
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Bus Details</p>
              <p class="font-extrabold text-[15px] mt-0.5 text-white">${info.name} • ${this.filterBusId}</p>
              <p class="text-[11px] text-zinc-400 mt-0.5">${info.from || 'IBANDA'} → ${info.to || 'KAMPALA'}</p>
            </div>

            <div class="mt-3 bg-[#1C1C1F] rounded-2xl border border-zinc-800 overflow-hidden">
              <div class="p-4 flex justify-between items-center gap-2 border-b border-zinc-800">
                <h3 class="font-bold text-[15px] text-white">Passenger Manifest</h3>
                <span class="text-[11px] bg-[#FFD60A] text-black px-2.5 py-1 rounded-full font-extrabold shrink-0">${boarded}/${total || 0} Boarded</span>
              </div>
              <div class="h-1.5 bg-zinc-800"><div id="manifest-bar" class="h-full bg-[#FFD60A] transition-all" style="width:${total ? Math.round(boarded / total * 100) : 0}%"></div></div>
              <div id="manifest-list" class="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                ${total ? visible.map(t => `
                  <div class="p-3 flex justify-between items-center gap-2 ${t.boarded ? 'bg-[#FFD60A]/5' : ''}">
                    <div class="flex gap-3 items-center min-w-0">
                      <span class="w-9 h-9 rounded-full ${t.boarded ? 'bg-[#FFD60A] text-black' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center text-xs font-bold shrink-0">${t.boarded ? '✓' : '◷'}</span>
                      <div class="min-w-0"><p class="font-bold text-sm truncate text-zinc-100">${t.passenger}</p><p class="text-[11px] text-zinc-400">Seat ${t.seat} • ${t.busId} — ${t.boarded ? 'BOARDED' : 'Pending'}</p></div>
                    </div>
                    <span class="text-[11px] font-semibold text-zinc-400 shrink-0">${t.boarded && t.boardedAt ? new Date(t.boardedAt).toLocaleTimeString().slice(0, 5) : 'Pending'}</span>
                  </div>`).join('')
                : `<div class="p-8 text-center text-zinc-500 text-sm">No tickets ${this.filterBusId === 'ALL' ? 'yet' : 'for ' + this.filterBusId}.<br>Book in the <button class="text-[#FFD60A] font-bold underline" onclick="App.navigate('booking')">Book tab</button> to test scanning.</div>`}
              </div>
            </div>
            <div class="mt-3 bg-[#1C1C1F] rounded-2xl p-3.5 text-sm flex gap-2 items-center border border-zinc-800"><span>📞</span><span class="text-[13px] text-zinc-300"><b class="text-white">Admin:</b> 0789 462 495</span></div>
          </div>
        </div>
      </div>
    `;
    this.setStatus('Tap Start to enable the camera. Manual entry always works.');
  },

  setStatus(msg) {
    const el = document.getElementById('scanner-status');
    if (el) el.textContent = msg;
  },

  switchBus(id) {
    this.stopScanner();
    this.filterBusId = id;
    if (id !== 'ALL') this.currentBusId = id;
    this.render();
  },

  async stopScanner(silent) {
    try {
      if (this._scanner) {
        const s = this._scanner;
        this._scanner = null;
        try { await s.stop(); } catch {}
        try { await s.clear(); } catch {}
      }
    } catch {}
    this._starting = false;
    if (silent) this.setStatus('Scanner stopped. Manual entry still available.');
  },

  async startScanner() {
    if (this._starting || this._scanner) return;
    if (typeof Html5Qrcode === 'undefined') {
      this.setStatus('Scanner library not loaded. Use manual entry or demo button.');
      App.toast('Scanner offline — use manual entry');
      return;
    }
    if (!window.isSecureContext) {
      this.setStatus('Insecure origin — browser blocks camera. Use manual entry or demo.');
      App.toast('Camera needs HTTPS — use manual entry');
      return;
    }
    this._starting = true;
    this.setStatus('Requesting camera permission…');
    try {
      let cameras = [];
      try { cameras = await Html5Qrcode.getCameras(); } catch {}
      if (cameras && cameras.length === 0) {
        this._starting = false;
        this.setStatus('No camera found on this device. Use manual entry or demo.');
        return;
      }
      const readerEl = document.getElementById('reader');
      if (!readerEl) { this._starting = false; return; }
      const scanner = new Html5Qrcode('reader');
      this._scanner = scanner;
      const cameraIdOrConfig = cameras && cameras.length ? cameras[cameras.length - 1].id : { facingMode: 'environment' };
      await scanner.start(
        cameraIdOrConfig,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => this.onScan(decodedText),
        () => {}
      );
      this._starting = false;
      this.setStatus('Scanning… point camera at passenger QR.');
    } catch (e) {
      this._starting = false;
      this._scanner = null;
      const name = (e && e.name) || '';
      if (name === 'NotAllowedError') this.setStatus('Camera permission denied. Allow access in browser settings, or use manual entry.');
      else if (name === 'NotFoundError') this.setStatus('No camera found. Use manual entry or demo.');
      else if (name === 'NotReadableError') this.setStatus('Camera is busy (another tab?). Close it and tap Start again.');
      else this.setStatus('Could not start camera. Use manual entry or demo.');
    }
  },

  onScan(decodedText) {
    const now = Date.now();
    if (now < this._scanCooldownUntil) return;
    this._scanCooldownUntil = now + 2500;
    try { if (navigator.vibrate) navigator.vibrate(20); } catch {}
    this.validateTicket(decodedText, { keepScanner: true });
  },

  demoScan() {
    const tickets = DB.getTickets();
    const pool = this.filterBusId === 'ALL' ? tickets : tickets.filter(t => t.busId === this.filterBusId);
    if (!pool.length) { App.toast('No tickets yet — book one first'); return; }
    const latest = pool[pool.length - 1];
    const input = document.getElementById('manual-ticket');
    if (input) input.value = latest.id;
    this.validateTicket(latest.id);
  },

  validateManual() {
    const input = document.getElementById('manual-ticket');
    const raw = ((input && input.value) || '').trim();
    if (!raw) { App.toast('Enter a ticket ID first'); if (input) input.focus(); return; }
    let id = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') id = parsed.id || parsed.ticketId || raw;
    } catch {}
    this.validateTicket(id);
  },

  normalizeId(ticketIdOrJson) {
    let id = String(ticketIdOrJson || '').trim();
    try {
      const obj = JSON.parse(id);
      if (obj && typeof obj === 'object') id = String(obj.id || obj.ticketId || id).trim();
    } catch {}
    return id;
  },

  validateTicket(ticketIdOrJson, opts = {}) {
    const ticketId = this.normalizeId(ticketIdOrJson);
    const tickets = DB.getTickets();
    const ticket = tickets.find(t =>
      t.id === ticketId ||
      t.id === String(ticketIdOrJson || '').trim() ||
      t.id.toLowerCase() === ticketId.toLowerCase()
    );
    const resultEl = document.getElementById('validation-result');
    if (!resultEl) return;

    if (!ticket) {
      try { if (navigator.vibrate) navigator.vibrate([40, 40, 40]); } catch {}
      resultEl.innerHTML = `<div class="rise bg-red-500/10 border-2 border-red-500/60 text-red-200 p-4 rounded-2xl font-bold text-[14px]">❌ INVALID — ticket not found<br><span class="text-[11px] font-mono font-normal break-all text-red-300/80">${String(ticketIdOrJson).slice(0, 160)}</span><div class="mt-2 text-[12px] font-semibold text-zinc-400">Check the bus filter above, or book a ticket first.</div></div>`;
      return;
    }
    if (ticket.boarded) {
      resultEl.innerHTML = `<div class="rise bg-amber-400/10 border-2 border-amber-400/60 text-amber-200 p-4 rounded-2xl font-bold text-[14px]">⚠️ ALREADY BOARDED<br><span class="text-[12px] font-normal">Seat ${ticket.seat} • ${ticket.passenger} • ${ticket.busId}${ticket.boardedAt ? ' • ' + new Date(ticket.boardedAt).toLocaleTimeString() : ''}</span></div>`;
      return;
    }
    ticket.boarded = true;
    ticket.boardedAt = new Date().toISOString();
    DB.saveTickets(tickets);
    try { if (navigator.vibrate) navigator.vibrate(25); } catch {}
    resultEl.innerHTML = `<div class="rise bg-[#FFD60A] border-2 border-[#FFD60A] text-black p-4 rounded-2xl"><p class="font-extrabold text-[15px]">✓ VALID — BOARDING CONFIRMED</p><p class="text-[13px] font-semibold mt-0.5">${ticket.passenger} • Seat ${ticket.seat} • ${ticket.busId} • ${new Date().toLocaleTimeString()}</p></div>`;
    this.refreshManifestRow();
  },

  refreshManifestRow() {
    // Update counts + list without wiping the validation message or camera
    const tickets = DB.getTickets();
    const visible = this.filterBusId === 'ALL' ? tickets : tickets.filter(t => t.busId === this.filterBusId);
    const boarded = visible.filter(t => t.boarded).length;
    const list = document.getElementById('manifest-list');
    const bar = document.getElementById('manifest-bar');
    if (bar && visible.length) bar.style.width = Math.round(boarded / visible.length * 100) + '%';
    if (!list) return;
    const badge = list.closest('.bg-\\[\\#1C1C1F\\]')?.querySelector('span');
    if (badge) badge.textContent = `${boarded}/${visible.length || 0} Boarded`;
    if (!visible.length) return;
    list.innerHTML = visible.map(t => `
      <div class="p-3 flex justify-between items-center gap-2 ${t.boarded ? 'bg-[#FFD60A]/5' : ''}">
        <div class="flex gap-3 items-center min-w-0">
          <span class="w-9 h-9 rounded-full ${t.boarded ? 'bg-[#FFD60A] text-black' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center text-xs font-bold shrink-0">${t.boarded ? '✓' : '◷'}</span>
          <div class="min-w-0"><p class="font-bold text-sm truncate text-zinc-100">${t.passenger}</p><p class="text-[11px] text-zinc-400">Seat ${t.seat} • ${t.busId} — ${t.boarded ? 'BOARDED' : 'Pending'}</p></div>
        </div>
        <span class="text-[11px] font-semibold text-zinc-400 shrink-0">${t.boarded && t.boardedAt ? new Date(t.boardedAt).toLocaleTimeString().slice(0, 5) : 'Pending'}</span>
      </div>`).join('');
  }
};
