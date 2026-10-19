import { supabase } from './supabase'

class AuthService {

  async signUp({email, password, fullName, username}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { 
          full_name: fullName || username,
          username: username || fullName 
        }
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

  async login({email, password}) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // ✅ fixed — now returns raw Supabase response so App.jsx can destructure { data: { session } }
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return { data: { session: data.session } }
  }

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  }

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }

  async forgotPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
    return data
  }

  async resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return data
  }
}

export const authService = new AuthService()