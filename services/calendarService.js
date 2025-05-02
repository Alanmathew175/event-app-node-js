const { google } = require("googleapis");
const User = require("../models/User");
const { makePhoneCall } = require("./twilioService");
const moment = require("moment-timezone");

/**
 * Create a Google OAuth2 client using user's tokens
 * @param {Object} user - User document from the database
 * @returns {Object} - Google OAuth2 client
 */
const createGoogleClient = (user) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        // access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });

    return oauth2Client;
};

/**
 * Get upcoming events from Google Calendar
 * @param {Object} auth - Authenticated Google OAuth2 client
 * @returns {Promise<Array>} - List of upcoming events
 */
const getUpcomingEvents = async (auth) => {
    const calendar = google.calendar({ version: "v3", auth });

    // Get events that start in the next 5 minutes
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    const oneHourFromNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    // console.log(now.toISOString(), fiveMinutesFromNow.toISOString());
    // const now = moment.utc(); // current time in UTC
    // const fiveMinutesFromNow = moment.utc().add(5, "minutes");

    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: now.toISOString(),
            timeMax: oneHourFromNow.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 1,
        });

        return response.data.items || [];
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

/**
 * Check for upcoming events and trigger call notifications
 */
const checkUpcomingEvents = async () => {
    try {
        // Get all users with phone numbers and valid tokens
        const users = await User.find({
            phoneNumber: { $exists: true, $ne: "" },
        });
        console.log(users);

        console.log(`Checking calendar events for ${users.length} users`);

        for (const user of users) {
            try {
                const auth = createGoogleClient(user);
                const events = await getUpcomingEvents(auth);
                console.log(events);

                if (events.length > 0) {
                    console.log(
                        `Found ${events.length} upcoming events for ${user.email}`
                    );

                    // Process each event
                    //   for (const event of events) {
                    //     const eventTitle = event.summary || "Upcoming event";
                    //     const eventTime = new Date(
                    //       event.start.dateTime || event.start.date
                    //     );

                    // console.log(
                    //   `Sending call reminder for "${eventTitle}" to ${user.phoneNumber}`
                    // );

                    // Make a phone call using Twilio
                    await makePhoneCall(
                        user.phoneNumber,
                        `Hello ${user.name}, you have an event scheduled in the next 5 minutes. Please be prepared.`
                    );
                    //   }
                }
            } catch (error) {
                console.error(
                    `Error processing calendar for user ${user.email}:`,
                    error
                );
            }
        }
    } catch (error) {
        console.error("Error in checkUpcomingEvents:", error);
    }
};

module.exports = {
    checkUpcomingEvents,
};
