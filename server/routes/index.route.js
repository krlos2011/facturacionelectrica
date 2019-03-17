const express = require('express');
// const expressPaginate = require('express-paginate');
const hourRoutes = require('./hour.route');
const statsRoutes = require('./stats.route');

const router = express.Router(); // eslint-disable-line new-cap

// app.use(expressPaginate.middleware(10, 50));

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/hour', hourRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
