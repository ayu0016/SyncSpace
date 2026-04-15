import { supabase } from './supabase'

class EntryService {

  // ── ADD A NEW ENTRY ────────────────────────────────
  async addEntry(widgetId, userId, payload,date) {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        widget_id: widgetId,
        user_id: userId,
        payload,
        date: date ?? new Date().toISOString().split('T')[0] // today's date
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  // ── GET ALL ENTRIES FOR A WIDGET ───────────────────
  async getAllEntries(userId) {
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId) // ✅ FIXED
        .order('date', { ascending: false })

    if (error) throw error
    return data
}

  // ── GET RECENT ENTRIES (last 30 days) ──────────────
    async getRecentEntries(userId) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const fromDate = thirtyDaysAgo.toLocaleDateString('en-CA') // 🔥 also fix UTC

    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId) // ✅ FIXED
        .gte('date', fromDate)
        .order('date', { ascending: false })

    if (error) throw error
    return data
    }

  // ── GET ENTRIES FOR A SPECIFIC DATE ───────────────
  async getEntriesByDate(userId, date) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId) // ✅ FIXED
    .eq('date', date)

  if (error) throw error
  return data
}

  // ── UPDATE AN ENTRY ────────────────────────────────
  async updateEntry(entryId, payload) {
    const { data, error } = await supabase
      .from('entries')
      .update({ payload })
      .eq('id', entryId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  // ── DELETE AN ENTRY ────────────────────────────────
  async deleteEntry(entryId) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)
    if (error) throw error
  }

}

export const entryService = new EntryService()