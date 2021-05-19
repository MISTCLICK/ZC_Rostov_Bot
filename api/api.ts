import express from 'express';
import validate from './security/validation';
import bookingScript from './schema/bookingScript';
import axios from 'axios';

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
  const allBooks = await bookingScript.find().sort({ ver: 1 });
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

  //Arbitrary vars and actions
  let myArr: any[] = [];
  (await bookingScript.find()).forEach(booking => myArr.push(booking.ver));
  let thisBookingVer = myArr.length > 0 ? Math.max.apply(null, myArr) + 1 : 1;
  let VATSIMmemberData = await axios.get(`https://api.vatsim.net/api/ratings/${cid}`);
  let bookingDate = from.split(' ');
  let bookingDateData = bookingDate[0].split('.');
  let bookingStartTime = bookingDate[1].split(':');
  let bookingEndTime = till.split(' ')[1].split(':');

  let vatbookData = await axios.post(`http://vatbook.euroutepro.com/atc/insert.asp?Local_URL=noredir&Local_ID=${thisBookingVer}&b_day=${bookingDateData[0]}&b_month=${bookingDateData[1]}&b_year=${bookingDateData[2]}&Controller=${VATSIMmemberData.data.name_first} ${VATSIMmemberData.data.name_last}&Position=${pos}&sTime=${bookingStartTime[0] + bookingStartTime[1]}&eTime=${bookingEndTime[0] + bookingEndTime[1]}&T=0&E=0&voice=1&cid=${cid}`);

  const newBooking = new bookingScript({
    cid,
    pos,
    from,
    till,
    ver: thisBookingVer,
    vatbook_id: `${vatbookData.data.split('\n')[2].split('=')[1]}`
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

  await axios.post(`http://vatbook.euroutepro.com/atc/delete.asp?Local_URL=noredir&Local_ID=${ver}&EU_ID=${bookCheck.vatbook_id}`);

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

export default API;