import { supabase } from './supabaseClient'

class TodosService {
  async fetchTodos(userId) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  }

  async addTodo(userId, text) {
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: userId, text, completed: false })
      .select()
    return { data, error }
  }

  async updateTodo(id, completed) {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
    return { data, error }
  }

  async deleteTodo(id) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    return { error }
  }
}

export const todosService = new TodosService()