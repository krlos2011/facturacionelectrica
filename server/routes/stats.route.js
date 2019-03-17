const express = require('express');
const asyncHandler = require('express-async-handler');
const statsCtrl = require('../controllers/stats.controller');

const router = express.Router();
module.exports = router;

router.route('/summary')
  .get(asyncHandler(getSummary));

  router.route('/hour/:field/:operation')
  .get(asyncHandler(getStatsByHour));

router.route('/daysOfWeek/:field/:operation')
  .get(asyncHandler(getStatsByDayOfWeek));

router.route('/months/:field/:operation')
  .get(asyncHandler(getStatsByMonth));


async function getSummary(req, res) {
  const summary = await statsCtrl.getSummary();
  res.json(summary);
}

async function getStatsByHour(req, res) {
  const stats = await statsCtrl.getStatsByHour(req.params.field, req.params.operation);
  res.json(stats);
}

async function getStatsByDayOfWeek(req, res) {
  const stats = await statsCtrl.getStatsByDayOfWeek(req.params.field, req.params.operation);
  res.json(stats);
}

async function getStatsByMonth(req, res) {
  const stats = await statsCtrl.getStatsByMonth(req.params.field, req.params.operation);
  res.json(stats);
}

