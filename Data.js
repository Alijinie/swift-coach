// data.js - SINGLE SOURCE OF TRUTH
// We use localStorage to simulate a real database for the MVP
const DB = {
  // --- Buses for Kampala ↔ Ibanda route ---
  buses: [
    { id: 'UBQ-412P', name: 'Zhongtong Global Executive', time: '06:30 AM', from: 'Ibanda', to: 'Kampala', price: 50000, driver: 'K. Asilimwe', status: 'Departed', bookedSeats: [9,10,11,14,15,26,27,28,36,37,38,39,40,49,50,51,52,53] },
    { id: 'UBQ-721J', name: 'Zhongtong Bus', time: '09:00 AM', from: 'Ibanda', to: 'Kampala', price: 50000, driver: 'P. Tumusime', status: 'En Route', bookedSeats: [9,10,14,15,20,26,27,28,29,30,36,37,38,39,40,49,50,51,52,53] },
    { id: 'UBQ-993K', name: 'SwiftLink Executive', time: '12:30 PM', from: 'Kampala', to: 'Ibanda', price: 50000, driver: 'R. Nansamba', status: 'Scheduled', bookedSeats: [26,27,28,36,37,38] },
    { id: 'UBQ-556L', name: 'CityLink Express', time: '03:00 PM', from: 'Ibanda', to: 'Kampala', price: 50000, driver: 'D. Kato', status: 'Scheduled', bookedSeats: [26,27] },
    { id: 'UBQ-128M', name: 'Zhongtong Global', time: '06:00 PM', from: 'Kampala', to: 'Ibanda', price: 50000, driver: 'T. Okello', status: 'Pending', bookedSeats: [] },
  ],

  // Load or init tickets from localStorage
  getTickets() {
    return JSON.parse(localStorage.getItem('swiftlink_tickets') || '[]');
  },
  saveTickets(tickets) {
    localStorage.setItem('swiftlink_tickets', JSON.stringify(tickets));
  },
  getSelectedBus() {
    return JSON.parse(localStorage.getItem('selected_bus') || 'null');
  },
  setSelectedBus(bus) {
    localStorage.setItem('selected_bus', JSON.stringify(bus));
  },
  getSelectedSeat() {
    return parseInt(localStorage.getItem('selected_seat') || '0');
  },
  setSelectedSeat(seat) {
    localStorage.setItem('selected_seat', seat);
  }
};
