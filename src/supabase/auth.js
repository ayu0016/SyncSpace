import { supabase } from './supabase'

class AuthService {

  // ── SIGN UP ────────────────────────────────────────
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    return data
  }

  // ── LOGIN ──────────────────────────────────────────
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  // ── LOGOUT ─────────────────────────────────────────
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // ── GET CURRENT SESSION ────────────────────────────
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  // ── GET CURRENT USER ───────────────────────────────
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  }

}

// Export single instance
export const authService = new AuthService()