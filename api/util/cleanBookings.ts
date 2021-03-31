import bookingScript from "../schema/bookingScript";

export default async function cleanBooks() {
  let allBooks = await bookingScript.find();
  
  for (const userBooking of allBooks) {
    const bookingExpiryFullTime  = userBooking.till.split(' ');
    const bookingExpiryDate = bookingExpiryFullTime[0].split('.');

    const thisDay = new Date().getUTCDate();
    const thisMonth = new Date().getUTCMonth() + 1;
    const thisYear = new Date().getUTCFullYear();
    
    if (
      parseInt(bookingExpiryDate[2]) < thisYear ||
      (parseInt(bookingExpiryDate[1]) < thisMonth && parseInt(bookingExpiryDate[2]) === thisYear) ||
      (parseInt(bookingExpiryDate[0]) < thisDay && parseInt(bookingExpiryDate[1]) === thisMonth)
    ) {
      await bookingScript.findByIdAndRemove(userBooking.id);
    }
  }
}