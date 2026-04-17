import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addWidget } from '../store/widgetSlice'
import { predefinedTrackers } from '../components/AddTracker/predefinedTracker'
import { widgetService } from '../supabase/widgetServices'
import ModalHeader from '../components/AddTracker/Modalheader'
import TabBar from '../components/AddTracker/TabBar'
import BuiltInTab from '../components/AddTracker/BuiltInTab'
import CustomTab from '../components/AddTracker/CustomTab'
import ModalFooter from '../components/AddTracker/ModalFooter'

export default function AddTracker() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.userData)
  const widgets = useSelector(state => state.widgets.widgets)

  // Tab state
  const [activeTab, setActiveTab] = useState('built-in')

  // Built-in state
  const [selectedCard, setSelectedCard] = useState(null)

  // Custom state
  const [customName, setCustomName] = useState('')
  const [customIcon, setCustomIcon] = useState('🔥')
  const [customColor, setCustomColor] = useState('#4a9eed')

  // Error state
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const isConfirmEnabled =
    (activeTab === 'built-in' && selectedCard !== null) ||
    (activeTab === 'custom' && customName.trim() !== '')//custom wala chod sambhal lena bhai

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setSelectedCard(null)
    setCustomName('')
    setError(null)
  }

  const handleSelect = (id) => {
    setSelectedCard(prev => prev === id ? null : id)
  }

  // YOU WRITE THIS — call widgetService and dispatch to Redux
  const handleConfirm = async () => {
    if (!isConfirmEnabled) return
    setIsLoading(true)
    setError(null)
    try {
      let payload

      if (activeTab === 'built-in') {
        const tracker = predefinedTrackers.find(t => t.id === selectedCard)
        payload = {
          userId: user.id,
          type: tracker.type,
          name: tracker.name,
          icon: null,
          color: tracker.color,
          position: widgets.length + 1,
          config:null
        }
      } else {
        payload = {
          userId: user.id,
          type: 'custom',
          name: customName.trim(),
          icon: customIcon,
          color: customColor,
          position: widgets.length + 1,
          config:null
        }
      }

      const newWidget = await widgetService.createWidget(payload)
      dispatch(addWidget(newWidget))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-4 relative">

      {/* Corner decorations */}
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-r border-t border-primary-container/40 w-16 h-16 rounded-tr-xl"></div>
      </div>
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-l border-b border-primary-container/40 w-16 h-16 rounded-bl-xl"></div>
      </div>

      {/* Modal card */}
      <div className="w-full max-w-125 glass-card rounded-xl shadow-2xl flex flex-col relative overflow-hidden animate-modal-enter">

        {/* Inner corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-primary-container/20 rounded-tr-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-primary-container/20 rounded-bl-xl pointer-events-none"></div>

        <ModalHeader />

        <TabBar
          activeTab={activeTab}
          onTabSwitch={handleTabSwitch}
        />

        {/* Content area */}
        <div className="relative flex-1 min-h-80 overflow-hidden">
          {activeTab === 'built-in' && (
            <BuiltInTab
              selectedCard={selectedCard}
              onSelect={handleSelect}
            />
          )}
          {activeTab === 'custom' && (
            <CustomTab
              customName={customName}
              setCustomName={setCustomName}
              customIcon={customIcon}
              setCustomIcon={setCustomIcon}
              customColor={customColor}
              setCustomColor={setCustomColor}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-400 text-center px-8 pb-2">{error}</p>
        )}

        <ModalFooter
          isEnabled={isConfirmEnabled && !isLoading}
          onConfirm={handleConfirm}
        />

      </div>
    </div>
  )
}