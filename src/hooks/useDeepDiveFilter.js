import { useState, useMemo } from 'react'
import { parseISO, isSameDay } from 'date-fns'

const useDeepDiveFilter = (entries = []) => {
  const [dateFilter, setDateFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState(null)

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Date filter
      const matchDate = dateFilter
        ? isSameDay(parseISO(entry.date), parseISO(dateFilter))
        : true

      // Topic filter — works for both DSA (topic field) and ML (topic field)
      const matchTopic = topicFilter
        ? entry.payload?.topic === topicFilter
        : true

      return matchDate && matchTopic
    })
  }, [entries, dateFilter, topicFilter])

  const clearAllFilters = () => {
    setDateFilter('')
    setTopicFilter(null)
  }

  return {
    filteredEntries,
    dateFilter,
    setDateFilter,
    topicFilter,
    setTopicFilter,
    clearAllFilters
  }
}

export default useDeepDiveFilter