export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const { base64Data, filename } = req.body;
  if (!base64Data || !filename) {
    return res.status(400).json({ error: 'Missing base64Data or filename.' });
  }

  const systemPrompt = `You are an expert construction document analyst with deep knowledge of CSI MasterFormat divisions, construction specifications, submittals, shop drawings, RFIs, product data sheets, and construction contracts.

Analyze the provided PDF and return ONLY a valid JSON object (no markdown, no backticks, no extra text) with these fields:
- title: string (descriptive document title)
- docType: string (one of: "Specification Section", "Submittal", "Shop Drawing", "Product Data", "Material Sample", "Test Report", "RFI", "Change Order", "Contract", "Drawing", "Other")
- csiDivision: string (CSI MasterFormat division number and name, e.g. "03 - Concrete" or "Unknown" if not applicable)
- csiSection: string (specific section number if identifiable, e.g. "03 30 00" or "")
- trade: string (trade or discipline, e.g. "Structural", "Mechanical", "Electrical", "Plumbing", "Architectural", "Civil", "Fire Protection", "Specialty")
- priority: string (one of: "Critical", "High", "Medium", "Low" — based on safety/structural impact, schedule sensitivity, lead times)
- summary: string (2-4 sentence summary of the document content and purpose)
- keyItems: array of strings (4-8 specific important items, materials, specs, or requirements mentioned)
- tags: array of strings (4-8 relevant tags for categorization, lowercase, e.g. "structural-steel", "fire-rating", "submittals-required")
- notes: string (any flags, action items, or important notes the project team should know about, or empty string)

Base priority on: Critical = life-safety or structural, High = schedule-critical or long lead, Medium = standard review, Low = informational.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64Data }
            },
            {
              type: 'text',
              text: `Analyze this construction document (filename: ${filename}) and return the JSON assessment.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${err}` });
    }

    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('analyze error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
