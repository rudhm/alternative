import 'dotenv/config';

export async function sendTelegramNotification(toUserId: string, fromUserId: string, messageContent: string | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  // Retrieve the chat ID based on the user
  const chatId = toUserId === 'Hasi' 
    ? process.env.TELEGRAM_CHAT_ID_HASI 
    : process.env.TELEGRAM_CHAT_ID_RUDH;

  if (!chatId) return;

  const text = `New message from ${fromUserId}:\n\n${messageContent || '[Media/Attachment]'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });
    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
    }
  } catch (err) {
    console.error('Error sending Telegram notification:', err);
  }
}
