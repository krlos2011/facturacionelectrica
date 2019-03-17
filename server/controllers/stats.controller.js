const moment = require('moment-timezone');
const Hour = require('../models/hour.model');

module.exports = {
  getSummary,
  getStatsByHour,
  getStatsByDayOfWeek,
  getStatsByMonth,
}

async function getSummary() {

  const stats = await Hour.aggregate([
    {
      $group: {
        _id: null,
        minDate: { $min: '$date' },
        maxDate: { $max: '$date' },
        minConsumption: { $min: '$consumption' },
        maxConsumption: { $max: '$consumption' },
        avgConsumption: { $avg: '$consumption' },
        sumConsumption: { $sum: '$consumption' },
        minprice: { $min: '$price' },
        maxprice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        minCost: { $min: '$cost' },
        maxCost: { $max: '$cost' },
        avgCost: { $avg: '$cost' },
        sumCost: { $sum: '$cost' },
      }
    }
  ]);
  return stats[0];

}

/**
 * 
 * @param {*} operation 'sum' | 'avg' | 'max' | 'min' | ... 
 * @param {*} field any numeric field in Hour model
 */
async function getStatsByHour(field, operation) {

  const group = {
    _id: { $hour: { date: '$date', timezone: moment.tz.guess() } }
  };
  group.y = {};
  group.y['$' + operation] = '$' + field;

  return await Hour.aggregate([
    { $group: group },
    {
      $project: {
        _id: null,
        x: '$_id',
        y: '$y'
      }
    },
    {
      $sort: {
        x: 1,
      }
    }
  ]);

}

/**
 * 
 * @param {*} operation 'sum' | 'avg' | 'max' | 'min' | ...
 * @param {*} field any numeric field in Hour model
 */
async function getStatsByDayOfWeek(field, operation) {

  const group = {
    _id: '$_id.dayOfWeek'
  };
  group.y = {};
  group.y['$' + operation] = '$sum';

  return await Hour.aggregate([
    // Sum in days before for get day relative avg stats
    {
      $group: {
        _id: {
          year: { $year: { date: '$date', timezone: moment.tz.guess() } },
          month: { $month: { date: '$date', timezone: moment.tz.guess() } },
          dayOfMonth: { $dayOfMonth: { date: '$date', timezone: moment.tz.guess() } },
          dayOfWeek: { $dayOfWeek: { date: '$date', timezone: moment.tz.guess() } },
        },
        sum: { $sum: '$' + field }
      },
    },
    { $group: group },
    {
      $project: {
        _id: null,
        x: '$_id',
        y: '$y'
      }
    },
    {
      $sort: {
        x: 1
      }
    }
  ]);

}

/**
 * 
 * @param {*} operation 'sum' | 'avg' | 'max' | 'min' | ...
 * @param {*} field any numeric field in Hour model
 */
async function getStatsByMonth(field, operation) {

  const group = {
    _id: {
      year: { $year: { date: '$date', timezone: moment.tz.guess() } },
      month: { $month: { date: '$date', timezone: moment.tz.guess() } }
    }
  };
  group.y = {};
  group.y['$' + operation] = '$' + field;

  return await Hour.aggregate([
    { $group: group },
    {
      $project: {
        _id: null,
        x: { $dateFromParts: { year: '$_id.year', month: '$_id.month', timezone: moment.tz.guess() } },
        y: '$y'
      }
    },
    {
      $sort: {
        x: 1,
      }
    }
  ]);

}