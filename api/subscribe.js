export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tag } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const BEEHIIV_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUB = process.env.BEEHIIV_PUB_ID;

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          tags: [tag],
          reactivate_existing: true,
          send_welcome_email: true
        })
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const error = await response.text();
      console.error('Beehiiv error:', error);
      return res.status(500).json({ error: 'Subscription failed' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
