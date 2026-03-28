import { supabase } from './supabase'

class ProfileService {

  // ── GET USER PROFILE ───────────────────────────────
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }

  // ── UPDATE USERNAME ────────────────────────────────
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

}

export const profileService = new ProfileService()
