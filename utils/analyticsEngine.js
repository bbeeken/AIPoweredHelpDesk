function calculateMTTR(tickets) {
  const durations = (tickets || [])
    .filter(t => t.status === 'closed')
    .map(t => {
      const created = (t.history || []).find(h => h.action === 'created');
      const closed = (t.history || []).find(h => h.action === 'status' && h.to === 'closed');
      if (!created || !closed) return null;
      return new Date(closed.date).getTime() - new Date(created.date).getTime();
    })
    .filter(d => d !== null);
  if (!durations.length) return 0;
  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  return avg / 3600000; // hours
}

function predictTicketVolume(tickets, days = 7) {
  const counts = {};
  (tickets || []).forEach(t => {
    const created = (t.history || []).find(h => h.action === 'created');
    if (!created) return;
    const d = new Date(created.date).toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const avg = Object.keys(counts).length ? total / Object.keys(counts).length : 0;
  return avg * days;
}

function generateInsights(tickets, assets = []) {
  const ticketStats = {
    open: (tickets || []).filter(t => t.status === 'open').length,
    waiting: (tickets || []).filter(t => t.status === 'waiting').length,
    closed: (tickets || []).filter(t => t.status === 'closed').length,
  };

  return {
    tickets: ticketStats,
    forecast: predictTicketVolume(tickets, 7),
    mttr: calculateMTTR(tickets),
    assets: { total: assets.length },
  };
}

module.exports = { calculateMTTR, predictTicketVolume, generateInsights };
