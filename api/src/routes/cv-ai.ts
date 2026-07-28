import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

// All AI routes require auth + Pro or credits
app.use('*', authMiddleware)

app.post('/cv/ai', async (c) => {
  try {
    const { action, text, context } = await c.req.json<{
      action: string
      text?: string
      context?: string
    }>()

    const plan = c.get('plan')
    const isPro = plan === 'pro'

    if (!isPro) {
      return c.json({ error: 'Upgrade to Pro to use AI features' }, 403)
    }

    const groqKey = c.env.GROQ_API_KEY
    if (!groqKey) {
      return c.json({ error: 'AI service not configured' }, 500)
    }

    // Build prompt based on action
    const prompts: Record<string, string> = {
      rewrite_bullet:
        'Rewrite the following CV bullet point to be more impactful and achievement-oriented. Use strong action verbs and quantify results where possible. Keep it concise (max 150 chars per bullet).',
      generate_summary:
        'Generate a 3-4 sentence professional summary for a CV based on the following context (their experience and skills). Use third-person, focus on impact, and aim for 40-60 words.',
      improve_tone:
        'Adjust the tone of the following CV text to sound more professional and confident. Remove weak language, passive voice, and boost impact.',
      tailor_cv:
        'Given the CV text and job description context, suggest how to tailor the CV bullet points to better match the role. Focus on transferable skills and relevant keywords.',
      cover_letter:
        'Generate a concise, tailored cover letter using the provided CV context and target role details. Use warm professional tone, 3-4 paragraphs, no markdown, no placeholders.',
    }

    const systemPrompt = prompts[action] || prompts.rewrite_bullet

    const body = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt} Respond with only the rewritten text, no explanations, no quotes.`,
        },
        {
          role: 'user',
          content: text
            ? `CV text: "${text}"${context ? `\nContext: ${context}` : ''}`
            : context || 'Generate content.',
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)
    let res: Response
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch {
      return c.json({ error: 'AI service timed out' }, 504)
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      console.error('Groq API request failed with status:', res.status)
      return c.json({ error: 'AI service error' }, 502)
    }

    const data: any = await res.json()
    const result = data.choices?.[0]?.message?.content?.trim() || ''

    return c.json({ result })
  } catch (err: any) {
    console.error('AI route error:', err)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
