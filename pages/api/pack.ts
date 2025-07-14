import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin } from '@/lib/supabase'
import { getMarketComp } from '@/lib/getMarketComp'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the user with Supabase
    const supabaseAdmin = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authorization token' })
    }

    const { job_title, city_or_remote, current_salary, target_salary, achievements } = req.body

    // Validate required fields
    if (!job_title || !city_or_remote || !current_salary || !achievements || achievements.length < 3) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get market compensation data
    const marketData = await getMarketComp(job_title, city_or_remote)

    // Calculate raise gap
    const raiseGap = Math.max(0, marketData.average - current_salary)

    // Generate negotiation content using Claude
    const negotiationContent = await generateNegotiationContent({
      job_title,
      city_or_remote,
      current_salary,
      target_salary,
      achievements,
      marketData,
      raiseGap
    })

    // Store the pack in the database
    const { data: pack, error: dbError } = await supabaseAdmin
      .from('packs')
      .insert({
        user_id: user.id,
        job_title,
        city_or_remote,
        current_salary,
        target_salary,
        achievements,
        market_data: marketData,
        negotiation_content: negotiationContent
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({ error: 'Failed to save pack' })
    }

    res.status(200).json({ pack })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function generateNegotiationContent(data: {
  job_title: string
  city_or_remote: string
  current_salary: number
  target_salary?: number
  achievements: string[]
  marketData: any
  raiseGap: number
}) {
  const { job_title, city_or_remote, current_salary, target_salary, achievements, marketData, raiseGap } = data

  // System prompt for Claude
  const systemPrompt = `You are a salary negotiation expert. Generate a comprehensive negotiation package in markdown format.

  Calculate:
  - raise_gap = ${raiseGap} (max(0, market_average - current_salary))
  
  Structure your response as markdown with these sections:
  
  # Salary Negotiation Package
  
  ## Market Analysis
  - Current salary: $${current_salary.toLocaleString()}
  - Market average: $${marketData.average.toLocaleString()}
  - Market range: $${marketData.p25.toLocaleString()} - $${marketData.p75.toLocaleString()}
  - Raise gap: $${raiseGap.toLocaleString()}
  
  ## Negotiation Script
  
  ### Opening Statement
  (2-3 sentences introducing the conversation)
  
  ### Value Proposition
  (Present achievements and market data)
  
  ### Salary Request
  (Specific ask based on market data)
  
  ## Fallback Responses
  
  ### If they say "budget constraints"
  (Alternative response)
  
  ### If they say "need to think about it"
  (Follow-up approach)
  
  ### If they counter with lower amount
  (Negotiation strategy)
  
  ## Follow-up Email Template
  
  Draft a professional 120-word email to send after the meeting.
  
  Make it personalized for a ${job_title} in ${city_or_remote}.`

  try {
    // Call Claude API to generate personalized content
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}

Job Details:
- Job Title: ${job_title}
- Location: ${city_or_remote}
- Current Salary: $${current_salary.toLocaleString()}
- Target Salary: ${target_salary ? '$' + target_salary.toLocaleString() : 'Not specified'}
- Market Average: $${marketData.average.toLocaleString()}
- Market Range: $${marketData.p25.toLocaleString()} - $${marketData.p75.toLocaleString()}

Key Achievements:
${achievements.map((achievement, index) => `${index + 1}. ${achievement}`).join('\n')}

Generate a comprehensive, personalized salary negotiation package in markdown format.`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const aiData = await response.json()
    return aiData.content[0].text.trim()

  } catch (error) {
    console.error('Error calling Claude API for negotiation content:', error)
    // Fallback to mock content if Claude API fails
    return generateMockNegotiationContent(data)
  }
}

function generateMockNegotiationContent(data: {
  job_title: string
  city_or_remote: string
  current_salary: number
  target_salary?: number
  achievements: string[]
  marketData: any
  raiseGap: number
}) {
  const { job_title, city_or_remote, current_salary, target_salary, achievements, marketData, raiseGap } = data
  
  const requestedSalary = target_salary || Math.min(marketData.p75, current_salary + raiseGap)
  
  return `# Salary Negotiation Package

## Market Analysis
- Current salary: $${current_salary.toLocaleString()}
- Market average: $${marketData.average.toLocaleString()}
- Market range: $${marketData.p25.toLocaleString()} - $${marketData.p75.toLocaleString()}
- Raise gap: $${raiseGap.toLocaleString()}

## Negotiation Script

### Opening Statement
I've really enjoyed contributing to the team as a ${job_title} and wanted to discuss my compensation based on my recent achievements and current market conditions. I'd like to explore adjusting my salary to better reflect my contributions and market value.

### Value Proposition
Over the past year, I've delivered significant value through several key achievements:

${achievements.map(achievement => `- ${achievement}`).join('\n')}

Based on my research, the market rate for ${job_title} positions in ${city_or_remote} ranges from $${marketData.p25.toLocaleString()} to $${marketData.p75.toLocaleString()}, with an average of $${marketData.average.toLocaleString()}.

### Salary Request
Given my contributions and the current market rate, I'd like to request a salary adjustment to $${requestedSalary.toLocaleString()}. This would align my compensation with market standards while reflecting the value I bring to the team.

## Fallback Responses

### If they say "budget constraints"
I understand budget considerations are important. Would it be possible to discuss a timeline for when this adjustment might be feasible? In the meantime, I'd be open to exploring other forms of compensation like additional equity, professional development budget, or expanded responsibilities.

### If they say "need to think about it"
I appreciate you taking the time to consider this. Would it be helpful if I provided additional documentation of my achievements or market research? I'm happy to follow up in a week to continue our discussion.

### If they counter with lower amount
I appreciate the counteroffer. While I understand there may be constraints, the market data I've shared shows that $${requestedSalary.toLocaleString()} is within the standard range for my role and experience. Could we explore meeting somewhere in the middle, perhaps at $${Math.round((requestedSalary + current_salary) / 2).toLocaleString()}?

## Follow-up Email Template

Subject: Following up on our salary discussion

Hi [Manager's Name],

Thank you for taking the time to discuss my compensation yesterday. I wanted to follow up on our conversation about adjusting my salary to reflect my contributions and current market conditions.

As we discussed, my achievements over the past year have significantly contributed to our team's success. The market research indicates that ${job_title} roles in ${city_or_remote} typically range from $${marketData.p25.toLocaleString()} to $${marketData.p75.toLocaleString()}.

I'm excited to continue growing with the team and would appreciate the opportunity to discuss this further. Please let me know if you need any additional information to move forward with this request.

Best regards,
[Your Name]`
}