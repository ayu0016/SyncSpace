import { supabase } from './supabase'

class TodosService {
  async fetchTodos(userId) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data  
}

  async addTodo(userId, text) {
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: userId, text, completed: false })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updateTodo(id, completed) {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  async updateTodoText(id, text) {
    const { data, error } = await supabase
        .from('todos')
        .update({ text })
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
    }

  async deleteTodo(id) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    if (error) throw error
    
  }
}

export const todosService = new TodosService()