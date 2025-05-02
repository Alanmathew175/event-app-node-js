const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token
 * @param {string} token - The Google ID token to verify
 * @returns {Promise<Object|null>} - The payload if verification successful, null otherwise
 */
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

module.exports = {
  verifyGoogleToken,
};
