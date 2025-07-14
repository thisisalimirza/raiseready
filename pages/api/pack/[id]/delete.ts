import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

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

    // First check if the pack exists and belongs to the user
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (packError || !pack) {
      return res.status(404).json({ error: 'Pack not found' })
    }

    // Delete related roleplay sessions first (foreign key constraint)
    await supabaseAdmin
      .from('roleplay_sessions')
      .delete()
      .eq('pack_id', id)

    // Delete the pack
    const { error: deleteError } = await supabaseAdmin
      .from('packs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return res.status(500).json({ error: 'Failed to delete pack' })
    }

    res.status(200).json({ message: 'Pack deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}