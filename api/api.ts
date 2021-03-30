import express from 'express';
import validate from './security/validation';
import bookingScript from './schema/bookingScript';

let API = express.Router();

API.all('*', async (req, res, next) => {
  if (typeof req.headers['x-api-key'] !== 'string' || typeof req.headers['application-source'] !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  const status = await validate(req.headers['x-api-key'], req.headers['application-source']);

  if (!status) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized!'
    });
  }

  next();
});

API.all('/', (_req, res) => res.status(200).send('Hallo!'));

API.get('/bookings', async (_req, res) => {
  const allBooks = await bookingScript.find();
  if (allBooks.length < 1) {
    return res.status(200).json({
      success: true,
      message: 'No bookings found!'
    });
  } else {
    return res.status(200).json({
      success: true,
      bookings: allBooks,
      message: 'Bookings found!'
    });
  }
});

API.post('/bookings', async (req, res) => {
  const cid = req.body.cid;
  const pos = req.body.pos;
  const from = req.body.from;
  const till = req.body.till;

  if (!cid || !pos || !from || !till) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  const newBooking = new bookingScript({
    cid,
    pos,
    from,
    till,
    ver: (await bookingScript.find()).length
  });

  await newBooking.save().catch((err) => {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!'
    });
  });

  return res.status(200).json({
    success: true
  });
});

API.delete('/bookings', async (req, res) => {
  const ver = req.body.ver;

  if (typeof ver !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  const bookCheck = await bookingScript.findOne({
    ver
  });

  if (!bookCheck) return res.status(200).json({
    success: false,
    message: 'Booking not found...'
  });

  await bookingScript.findOneAndRemove({
    ver
  }).catch((err) => {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!'
    });
  });

  return res.status(200).json({
    success: true
  });
});

API.patch('/bookings', async (req, res) => {
  const ver = req.body.ver;
  const cid = req.body.cid;
  const pos = req.body.pos;
  const from = req.body.from;
  const till = req.body.till;

  if (!cid || !pos || !from || !till || typeof ver !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  const bookCheck = await bookingScript.findOne({
    ver
  });

  if (!bookCheck) return res.status(200).json({
    success: false,
    message: 'Booking not found...'
  });

  await bookingScript.findOneAndUpdate({
    ver
  }, {
    cid,
    pos,
    from,
    till
  }, {
    upsert: false
  }).catch((err) => {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!'
    });
  });

  return res.status(200).json({
    success: true
  });
});

export default API;