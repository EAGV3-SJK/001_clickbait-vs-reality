importScripts('config.js'); // API_KEY is defined in config.js (git-ignored)

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'RATE_HEADLINES') {
    rateHeadlines(msg.headlines)
      .then(ratings => sendResponse({ ratings }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function rateHeadlines(headlines) {
  const numbered = headlines.map((h, i) => `${i}: "${h}"`).join('\n');

  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a news media analyst. Rate each headline below as:
- "honest": factual, no sensationalism, headline matches expected content
- "misleading": exaggerates, omits key context, vague to bait clicks, half-truth
- "clickbait": pure curiosity gap, shock tactics, caps abuse, "you won't believe", no real substance

For each headline give a rating and a reason in max 8 words.

Headlines:
${numbered}

Reply with ONLY a JSON array, no markdown, no explanation:
[{"id":0,"rating":"honest","reason":"Short reason here"},{"id":1,...}]`
      }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content[0].text.trim();

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not parse Claude response');

  const ratings = JSON.parse(match[0]);
  return ratings.sort((a, b) => a.id - b.id);
}
