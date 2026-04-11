import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { widgetService } from '../supabase/widgetServices'
import { updateWidget } from '../store/widgetSlice'

const DEFAULT_GYM_CONFIG = {
  calorie_target: 2000,
  protein_target: 120,
  water_target: 2500,
  weekly_workout_goal: 5
}

const useWidgetConfig = (widgetId) => {
  const dispatch = useDispatch()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Get widget from Redux
  const widget = useSelector(
    state => state.widgets.widgets.find(w => w.id === widgetId)
  )

  // Merge with defaults using nullish coalescing
  const config = {
    calorie_target: widget?.config?.calorie_target ?? DEFAULT_GYM_CONFIG.calorie_target,
    protein_target: widget?.config?.protein_target ?? DEFAULT_GYM_CONFIG.protein_target,
    water_target: widget?.config?.water_target ?? DEFAULT_GYM_CONFIG.water_target,
    weekly_workout_goal: widget?.config?.weekly_workout_goal ?? DEFAULT_GYM_CONFIG.weekly_workout_goal,
  }

  // Merge partial update and save to Supabase
  const updateConfig = async (partialConfig) => {
    setSaving(true)
    setError(null)
    try {
      const newConfig = { ...config, ...partialConfig }
      const updatedWidget = await widgetService.updateWidget(widgetId, {
        config: newConfig
      })
      dispatch(updateWidget({ id: widgetId, updatedWidget }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return { config, updateConfig, saving, error }
}

export default useWidgetConfig