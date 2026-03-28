import { supabase } from './supabase'

class EntryService {

  // ── ADD A NEW ENTRY ────────────────────────────────
  async addEntry(widgetId, userId, payload) {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        widget_id: widgetId,
        user_id: userId,
        payload,
        date: new Date().toISOString().split('T')[0] // today's date
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  // ── GET ALL ENTRIES FOR A WIDGET ───────────────────
  async getAllEntries(widgetId) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('widget_id', widgetId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }

  // ── GET RECENT ENTRIES (last 30 days) ──────────────
  async getRecentEntries(widgetId) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('widget_id', widgetId)
      .gte('date', fromDate)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }

  // ── GET ENTRIES FOR A SPECIFIC DATE ───────────────
  async getEntriesByDate(widgetId, date) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('widget_id', widgetId)
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