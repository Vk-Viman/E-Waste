const RoutePlan = require('./model');

async function listRoutes(_req, res) {
  const routes = await RoutePlan.find().sort({ createdAt: -1 });
  res.json(routes);
}

async function createRoute(req, res) {
  const route = await RoutePlan.create(req.body || {});
  res.status(201).json(route);
}

async function optimizeRoutes(req, res) {
  // Placeholder: in real system, call optimization engine here
  res.json({ ok: true, message: 'Optimization requested', payload: req.body || {} });
}

module.exports = { listRoutes, createRoute, optimizeRoutes };
