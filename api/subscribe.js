export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tag } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const BEEHIIV_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUB = process.env.BEEHIIV_PUB_ID;
  const BASE = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB}`;
  const HEADERS = {
    'Authorization': `Bearer ${BEEHIIV_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Step 1: Create or reactivate subscription
    const subRes = await fetch(`${BASE}/subscriptions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        double_opt_override: 'off'
      })
    });

    if (!subRes.ok) {
      const err = await subRes.text();
      console.error('Subscription error:', err);
      return res.status(500).json({ error: 'Subscription failed' });
    }

    const subData = await subRes.json();
    const subscriptionId = subData?.data?.id;

    // Step 2: Assign tag if we have a subscription ID and a tag
    if (subscriptionId && tag) {
      await fetch(`${BASE}/subscriptions/${subscriptionId}/tags`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ tags: [tag] })
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
