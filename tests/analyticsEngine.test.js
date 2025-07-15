const assert = require('assert');
const { calculateMTTR, predictTicketVolume, generateInsights } = require('../utils/analyticsEngine');
const mock = require('../data/mockData');

const mttr = calculateMTTR(mock.tickets);
assert.ok(typeof mttr === 'number');
assert.ok(mttr >= 0);

const forecast = predictTicketVolume(mock.tickets, 5);
assert.ok(typeof forecast === 'number');
assert.ok(forecast >= 0);

const insights = generateInsights(mock.tickets, mock.assets);
assert.ok(insights.tickets.open >= 0);
assert.ok(typeof insights.forecast === 'number');
assert.ok(typeof insights.mttr === 'number');

console.log('Analytics engine tests passed');
