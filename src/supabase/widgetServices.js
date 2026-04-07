import { supabase } from './supabase'

class WidgetService {

  // ── GET ALL WIDGETS FOR A USER ─────────────────────
  async getWidgets(userId) {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }

  // ── CREATE A NEW WIDGET ────────────────────────────
  async createWidget({userId, type, name, icon, color,config}) {
    // first count existing widgets to set position
    const { count, error: countError } = await supabase
      .from('widgets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
    if (countError) throw countError

    const { data, error } = await supabase
      .from('widgets')
      .insert({
        user_id: userId,
        type,
        name,
        icon,
        color,
        position: count + 1,
        config
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  // ── UPDATE A WIDGET ────────────────────────────────
  async updateWidget(widgetId, updates) {
    const { data, error } = await supabase
      .from('widgets')
      .update(updates)
      .eq('id', widgetId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  // ── DELETE A WIDGET ────────────────────────────────
  async deleteWidget(widgetId) {
    const { error } = await supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId)
    if (error) throw error
  }

}

export const widgetService = new WidgetService()