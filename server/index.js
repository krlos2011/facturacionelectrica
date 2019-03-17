// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
require('./config/mongoose');

const hourCtrl = require('./controllers/hour.controller');
const statsCtrl = require('./controllers/stats.controller');

async function cleanAndImport() {
  console.info('Cleaning hour collection');
  await hourCtrl.clean();
  console.info('Importing data');
  await hourCtrl.importFromCsv(__dirname + '/../docs/consumo-2018-12.csv');
  await hourCtrl.importFromCsv(__dirname + '/../docs/consumo-2019-01.csv');
  // await hourCtrl.importFromCsv(__dirname + '/../docs/consumo-2019-02.csv');
  console.info('Imported data successfully');
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // Clean hour collection and import from default file
  cleanAndImport();
  
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
  });
}

module.exports = app;
