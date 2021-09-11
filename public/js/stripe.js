const stripe = Stripe(
  'pk_test_51JYRhODix4r2vkMx3Jp8rrWXaOKpo3K6IBMC6kmKC0zbs3swNbklUrr2cr5BQZd2ElNq7jK2mAln6p8RoFD6pYnP00ZUT67RrP'
);
export const bookTour = async tourId => {
  try {
    const session = await fetch(
      `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`,
      {
        method: 'GET'
      }
    );
    const sessionJSON = await session.json();
    const sessionId = sessionJSON.session.id;
    await stripe.redirectToCheckout({
      sessionId
    });
  } catch (err) {
    console.log(err);
  }
};
