import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setEntries } from '../store/entriesSlice'
import { entryService } from '../supabase/entryServices'

const useWidgetEntries = (widgetId) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get entries for this widget from Redux
  const entries = useSelector(
    state => state.entries.entries[widgetId] || []
  )

  useEffect(() => {
    if (!widgetId) return

    // Skip fetch if already loaded
    if (entries.length > 0) return

    const fetchEntries = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await entryService.getAllEntries(widgetId)
        dispatch(setEntries(data))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [widgetId])

  return { entries, loading, error }
}

export default useWidgetEntries