import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { packId } = req.query
    const { message, messages } = req.body

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

    // Get the pack to ensure user owns it
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('*')
      .eq('id', packId)
      .eq('user_id', user.id)
      .single()

    if (packError || !pack) {
      return res.status(404).json({ error: 'Pack not found' })
    }

    // Generate manager response
    const reply = await generateManagerResponse(message, messages, pack)

    // Update or create roleplay session
    const updatedMessages = [...messages, { id: Date.now().toString(), role: 'assistant', content: reply, timestamp: new Date().toISOString() }]
    
    // Check if session exists
    const { data: existingSession } = await supabaseAdmin
      .from('roleplay_sessions')
      .select('id')
      .eq('pack_id', packId)
      .single()

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabaseAdmin
        .from('roleplay_sessions')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('pack_id', packId)

      if (updateError) {
        console.error('Update session error:', updateError)
      }
    } else {
      // Create new session
      const { error: insertError } = await supabaseAdmin
        .from('roleplay_sessions')
        .insert({
          pack_id: packId,
          messages: updatedMessages,
          confidence_score: 5
        })

      if (insertError) {
        console.error('Insert session error:', insertError)
      }
    }

    res.status(200).json({ reply })
  } catch (error) {
    console.error('Roleplay API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function generateManagerResponse(message: string, messages: any[], pack: any): Promise<string> {
  try {
    // Build conversation history for Claude
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'Employee' : 'Manager'}: ${msg.content}`
    ).join('\n')

    // Create the prompt for Claude
    const prompt = `You are a supportive but realistic manager having a salary negotiation conversation with an employee. 

Employee Details:
- Job Title: ${pack.job_title}
- Location: ${pack.city_or_remote}
- Current Salary: $${pack.current_salary?.toLocaleString() || 'N/A'}
- Target Salary: $${pack.target_salary?.toLocaleString() || 'N/A'}
- Market Average: $${pack.market_data?.average?.toLocaleString() || 'N/A'}
- Key Achievements: ${pack.achievements?.join(', ') || 'None provided'}

Conversation so far:
${conversationHistory}

Employee: ${message}

As the manager, respond in a way that:
1. Acknowledges their points professionally
2. Asks thoughtful follow-up questions
3. Shows you're considering their request seriously
4. Maintains a collaborative tone
5. Occasionally raises realistic concerns or asks for clarification
6. Keeps responses concise (2-3 sentences max)

Manager:`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text.trim()

  } catch (error) {
    console.error('Error calling Claude API:', error)
    // Fallback to mock responses if Claude API fails
    const responses = getManagerResponses(message, messages, pack)
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

function getManagerResponses(message: string, messages: any[], pack: any): string[] {
  const lowerMessage = message.toLowerCase()
  
  // Opening/general responses
  if (lowerMessage.includes('salary') || lowerMessage.includes('compensation') || lowerMessage.includes('raise')) {
    return [
      "I appreciate you bringing this up. Can you tell me more about what's prompting this discussion?",
      "Let's talk about this. What specific aspects of your compensation are you thinking about?",
      "I'm glad you're comfortable discussing this with me. What would you like to see change?"
    ]
  }

  // Achievement-based responses
  if (lowerMessage.includes('achievement') || lowerMessage.includes('accomplished') || lowerMessage.includes('delivered')) {
    return [
      "Those are impressive accomplishments. How do you see these contributing to your compensation discussion?",
      "Thank you for highlighting those achievements. They definitely show your value to the team.",
      "I recognize the great work you've been doing. What kind of adjustment are you thinking about?"
    ]
  }

  // Market data responses
  if (lowerMessage.includes('market') || lowerMessage.includes('industry') || lowerMessage.includes('research')) {
    return [
      "I understand you've done some research. Can you share what you've found?",
      "Market data is certainly important. What does your research show for your role?",
      "I appreciate you coming prepared with market information. What are you seeing out there?"
    ]
  }

  // Specific number responses
  if (lowerMessage.match(/\$\d+/) || lowerMessage.includes('thousand') || lowerMessage.includes('percent')) {
    return [
      "That's a significant number. Help me understand how you arrived at that figure.",
      "I want to make sure I understand your request correctly. Can you walk me through your thinking?",
      "Let me see what might be possible. What's the timeline you're thinking about for this adjustment?"
    ]
  }

  // Budget/constraints responses
  if (lowerMessage.includes('budget') || lowerMessage.includes('constraint') || lowerMessage.includes('limited')) {
    return [
      "I understand there are always budget considerations. What alternatives might work for both of us?",
      "Budget is definitely a factor we need to consider. Are there other forms of compensation we could explore?",
      "Let's think creatively about this. What would be most valuable to you besides base salary?"
    ]
  }

  // Default responses for other cases
  return [
    "That's a good point. Can you elaborate on that?",
    "I appreciate you sharing that perspective. What would you like to see happen next?",
    "Help me understand your thinking on this better.",
    "That's valuable feedback. How do you think we should move forward?",
    "I want to make sure we're aligned on this. Can you tell me more about your expectations?"
  ]
}