const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Make a phone call using Twilio
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message to be read during the call
 * @returns {Promise} - Twilio call response
 */
const makePhoneCall = async (phoneNumber, message) => {
  try {
    console.log(
      process.env.TWILIO_ACCOUNT_SID,
      "sid",
      process.env.TWILIO_AUTH_TOKEN,
      "tok"
    );

    // Make the call
    const call = await client.calls.create({
      twiml: `<Response><Say> ${message}</Say></Response>`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log(`Call initiated with SID: ${call.sid}`);
    return call;
  } catch (error) {
    console.error("Error making Twilio call:", error);
    throw error;
  }
};

module.exports = {
  makePhoneCall,
};
