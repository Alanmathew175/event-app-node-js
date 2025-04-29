const cron = require("node-cron");
const moment = require("moment");
const twilio = require("twilio");
const Users = require("../models/user.model");
const { google } = require("googleapis");
const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
    process.env.AUTH_REDIRCT_URL
);

const handleCall = async (name, phone) => {
    try {
        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_TOKEN;
        const client = twilio(accountSid, authToken);
        const call = await client.calls.create({
            to: `+91${phone}`,
            from: process.env.TWILIO_PHONE,
            twiml: `<Response><Say>Hello ${name}, you have an event scheduled in the next 5 minutes. Please be prepared.</Say></Response>`, // Basic TwiML
        });
        console.log(`Call initiated: ${call.sid}`);
    } catch (error) {
        console.log(error, "error while calling");
    }
};
cron.schedule("*/5 * * * *", async () => {
    console.log("Running this task every 5 minute");
    const users = await Users.find({ refresh_token: { $ne: null } });
    for (const user of users) {
        if (!user?.phone) {
            return;
        }
        try {
            oauth2Client.setCredentials({ refresh_token: user.refresh_token });

            const calendar = google.calendar({
                version: "v3",
                auth: oauth2Client,
            });

            const now = moment.utc(); // current UTC time
            const inFiveMins = moment.utc().add(5, "minutes");

            const events = await calendar.events.list({
                calendarId: "primary",
                timeMin: now.toISOString(),
                timeMax: inFiveMins.toISOString(),
                singleEvents: true,
                orderBy: "startTime",
            });

            const upcomingEvents = events.data.items;

            console.log("Found events:", upcomingEvents);

            if (upcomingEvents.length) {
                await handleCall(user.name, user.phone);
            }
        } catch (error) {
            console.log(error);
        }
    }
});
