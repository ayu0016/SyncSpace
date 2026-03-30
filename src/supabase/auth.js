import { supabase } from './supabase'

class AuthService {

  // ── SIGN UP ────────────────────────────────────────
  async signUp({email, password, username}) {
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

  async signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) throw error
  return data
}

  // ── LOGIN ──────────────────────────────────────────
  async login({email, password}) {
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
  onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
    // Send reset email
async forgotPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) throw error
  return data
}

// Update to new password
async resetPassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
  return data
}

}

// Export single instance
export const authService = new AuthService()