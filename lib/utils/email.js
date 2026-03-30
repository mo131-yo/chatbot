import emailjs from '@emailjs/browser';

export const sendConfirmationEmail = async (user, cartItems, totalPrice) => {
  const templateParams = {
    email: user.primaryEmailAddress.emailAddress,
    order_id: `ORD-${Math.floor(Math.random() * 1000000)}`, 
    
    orders: cartItems.map((item) => ({
      name: item.name,
      image_url: item.image, 
      units: item.quantity || 1,
      price: item.price.toLocaleString(),
    })),

    cost: {
      shipping: "5,000",
      tax: "0",
      total: totalPrice.toLocaleString(),
    },
  };

  try {
    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (error) {
    console.error("EmailJS Error:", error);
    return false;
  }
};