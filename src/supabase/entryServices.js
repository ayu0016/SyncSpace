import { supabase } from './supabase'

class EntryService {

  // ── ADD A NEW ENTRY ────────────────────────────────
  async addEntry(widgetId, userId, payload, date) {
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

  // ── GET ALL ENTRIES FOR A USER ───────────────────
  async getAllEntries(userId) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  // ── GET ENTRIES FOR A SPECIFIC WIDGET ──────────────
  async getEntriesByWidgetId(widgetId) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('widget_id', widgetId)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  // ── GET RECENT ENTRIES (last 30 days) ──────────────
  async getRecentEntries(userId) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const fromDate = thirtyDaysAgo.toLocaleDateString('en-CA')

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
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
      .eq('user_id', userId)
      .eq('date', date)

    if (error) throw error
    return data
  }

  // ── UPDATE AN ENTRY ────────────────────────────────
  async updateEntry(entryId, userId, payload, date) {
    // YOUR LOGIC:
    let updateFields = {}
    let uid = null

    if (payload !== undefined) {
      updateFields = { payload }
      if (date) updateFields.date = date
      uid = userId
    } else {
      // Legacy call: updateEntry(entryId, payload)
      updateFields = { payload: userId }
    }

    let query = supabase
      .from('entries')
      .update(updateFields)
      .eq('id', entryId)

    if (uid) {
      query = query.eq('user_id', uid)
    }

    const { data, error } = await query.select().single()
    if (error) throw error
    return data
  }

  // ── DELETE AN ENTRY ────────────────────────────────
  async deleteEntry(entryId, userId) {
    // YOUR LOGIC:
    let query = supabase
      .from('entries')
      .delete()
      .eq('id', entryId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query
    if (error) throw error
  }

}

export const entryService = new EntryService()
