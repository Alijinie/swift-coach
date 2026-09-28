// app.js - MAIN ROUTER - black + yellow dark theme, scanner lifecycle safe
const App = {
  currentView: 'booking',

  init() {
    this.navigate('booking', { silent: true });
    Booking.renderBusList();
    Ticket.render();
    console.log('SwiftLink Bus App Initialized - Kampala ↔ Ibanda (dark)');
  },

  navigate(view, opts = {}) {
    // Always release camera before switching views (fixes locked-camera bug)
    try {
      if (view !== 'conductor' && typeof Conductor !== 'undefined' && Conductor.stopScanner) {
        Conductor.stopScanner();
      }
    } catch {}
    this.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById('view-' + view);
    if (el) el.classList.remove('hidden');

    // Desktop pills (gold active)
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('bg-[#FFD60A]', 'text-black', 'font-bold');
      btn.classList.add('bg-white/10');
    });
    const active = document.getElementById('nav-' + view);
    if (active) {
      active.classList.remove('bg-white/10');
      active.classList.add('bg-[#FFD60A]', 'text-black', 'font-bold');
    }

    // Mobile tabs (gold active)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('text-[#FFD60A]', 'font-bold');
      btn.classList.add('text-zinc-500', 'font-semibold');
    });
    const tab = document.getElementById('tab-' + view);
    if (tab) {
      tab.classList.remove('text-zinc-500', 'font-semibold');
      tab.classList.add('text-[#FFD60A]', 'font-bold');
    }

    try { if (!opts.silent && navigator.vibrate) navigator.vibrate(8); } catch {}
    window.scrollTo({ top: 0, behavior: opts.silent ? 'auto' : 'smooth' });

    if (view === 'booking' && !opts.keepState) Booking.renderBusList();
    if (view === 'ticket') Ticket.render();
    if (view === 'conductor') Conductor.render();
    if (view === 'admin') Admin.render();
  },

  toast(msg, ms = 2200) {
    const wrap = document.getElementById('toast');
    if (!wrap) { alert(msg); return; }
    wrap.firstElementChild.textContent = msg;
    wrap.classList.remove('hidden');
    clearTimeout(this._t);
    this._t = setTimeout(() => wrap.classList.add('hidden'), ms);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
