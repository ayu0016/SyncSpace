import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setWidgetEntries } from '../store/entriesSlice'
import { entryService } from '../supabase/entryServices'

const useWidgetEntries = (widgetId) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get entries for this widget from Redux (undefined if not yet loaded)
  const widgetEntries = useSelector(
    state => state.entries.entries[widgetId]
  )

  useEffect(() => {
    if (!widgetId) return

    // Skip fetch if already loaded
    if (widgetEntries !== undefined) return

    let isMounted = true
    const fetchEntries = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await entryService.getEntriesByWidgetId(widgetId)
        if (isMounted) {
          dispatch(setWidgetEntries({ widget_id: widgetId, entries: data || [] }))
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchEntries()

    return () => {
      isMounted = false
    }
  }, [widgetId, dispatch, widgetEntries])

  return { entries: widgetEntries || [], loading, error }
}

export default useWidgetEntries