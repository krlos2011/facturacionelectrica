const Joi = require('joi');
const fastCsv = require("fast-csv");
const Hour = require('../models/hour.model');

const hourSchema = Joi.object({
  date: Joi.date().required(),
  consumption: Joi.number().required().min(0),
  price: Joi.number().required().min(0),
  cost: Joi.number().required().min(0)
});

module.exports = {
  clean,
  paginate,
  insert,
  put,
  remove,
  importFromCsv,
}

async function clean() {
  return await Hour.deleteMany({});
}

async function paginate(page, limit, sort, order) {
  page = page || 1;
  limit = limit || 10;
  const offset = (page - 1) * limit;
  const sortParams = {};
  if (sort) {
    sortParams[sort] = order === 'asc' ? 1 : -1;
  }
  else {
    sortParams.date = -1;
  }
  return await Hour.paginate({}, { offset, limit, sort: sortParams });
}

async function insert(hour) {
  hour = await Joi.validate(hour, hourSchema, { abortEarly: false });
  return await new Promise((resolve, reject) => {
    const hourModel = new Hour(hour);
    hourModel.save()
      .then(() => {
        resolve(hourModel);
      })
      .catch((err) => {
        if (err) {
          console.error(err);
        }
        if (err.code === 11000) {
          console.info('Duplicate key entry for', hour.date, 'updating data');
          Hour.updateOne({ date: hour.date }, hour)
            .then(doc => {
              resolve(doc);
            })
            .catch(err => {
              console.error('Error on update', err);
              reject(error);
            })
        }
        else {
          resolve();
        }
      });
  });
}

async function put(id, hour) {
  delete hour._id;
  delete hour.__v;
  hour = await Joi.validate(hour, hourSchema, { abortEarly: false });
  return await new Promise((resolve, reject) => {
    Hour.findOneAndUpdate({ _id: id }, hour, { new: true }, (err, doc) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(doc);
      }
    });
  });
}

async function remove(id) {
  return await Hour.findByIdAndDelete(id);
}

async function importFromCsv(csvfilePath) {
  return await new Promise((resolve, reject) => {

    const promises = [];

    fastCsv.fromPath(csvfilePath, { headers: true, trim: true })
      .on('data', (data) => {
        if (data.Fecha) {
          const date = new Date(data.Fecha);
          date.setHours(data.Hora);
          promises.push(
            insert({
              date: date,
              consumption: data['Consumo (Wh)'],
              price: data['Precio (€/kWh)'],
              cost: data['Coste por hora (€)']
            })
          );
        }
      })
      .on('error', err => {
        console.error(err);
        reject(err);
      })
      .on('end', () => {
        Promise.all(promises)
        .then(() => resolve())
        .catch(() => reject());
        console.log('end fastCsv from path');
      });
  });
}
