const express = require('express');
const asyncHandler = require('express-async-handler');
const hourCtrl = require('../controllers/hour.controller');

const router = express.Router();
module.exports = router;

router.route('/')
  .get(asyncHandler(getAll))
  .post(asyncHandler(insert));

router.route('/:id')
  .put(asyncHandler(put))
  .delete(asyncHandler(remove));

router.route('/import')
  .post(asyncHandler(importFromFile));

async function getAll(req, res) {
  const hours = await hourCtrl.paginate(parseInt(req.query.page), parseInt(req.query.limit), req.query.sort, req.query.order);
  res.set('X-Total-Count', hours.total);
  res.set('X-Total-Pages', Math.ceil(hours.total / hours.limit));
  res.json(hours.docs);
}

async function insert(req, res) {
  const hour = await hourCtrl.insert(req.body);
  res.json(hour);
}

async function put(req, res) {
  const hour = await hourCtrl.put(req.params.id, req.body);
  res.json(hour);
}

async function remove(req, res) {
  const hour = await hourCtrl.remove(req.params.id);
  res.json(hour);
}

async function sleep(ms){
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function importFromFile(req, res) {
  console.log(req.files.file);
  if(req.files.file){
    // TODO: should I wait to file is in server?
    await sleep(1000);
    await hourCtrl.importFromCsv(req.files.file.tempFilePath);
    res.status(202);
    res.json({});
  }
  else {
    res.status(400);
    res.json({
      message: 'File required'
    });
  }
}
