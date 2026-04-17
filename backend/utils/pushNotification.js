const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Sends push notifications to a list of tokens
 * @param {string[]} tokens - Array of ExpoPushTokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body message
 * @param {object} data - Optional data payload
 */
const sendPushNotification = async (tokens, title, body, data = {}) => {
    if (!tokens || tokens.length === 0) return;

    let messages = [];
    for (let pushToken of tokens) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        });
    }

    // Batch the messages
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Send the chunks to the Expo push notification service
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('[PushNotification] Error sending chunk:', error);
        }
    }

    // You might want to process tickets to check for errors/device uninstalls
    // but for MVP we will just log and continue
    return tickets;
};

module.exports = { sendPushNotification };
