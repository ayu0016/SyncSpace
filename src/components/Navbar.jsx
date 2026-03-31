import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../supabase/auth'

export default function Navbar({ onAddTracker }) {

  const user = useSelector(state => state.auth.user)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  // YOU WRITE THIS — call your supabase signout
  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (error) {
      console.log(error.message)
    }
  }

  // Get initials from user metadata
  const getInitials = () => {
    const name = user?.user_metadata?.username || user?.email || 'U'
    return name.slice(0, 2).toUpperCase()
  }

  // Get first name for greeting
  const getFirstName = () => {
    const name = user?.user_metadata?.username || 'there'
    return name.split(' ')[0]
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1b1b20]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-3">

        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <span className="text-primary-container font-black tracking-tighter drop-shadow-[0_0_8px_rgba(74,158,237,0.5)] text-lg md:text-xl">
            SyncSpace
          </span>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden lg:block text-sm font-medium text-on-surface-variant">
          Welcome back,{' '}
          <span className="text-primary-container font-bold">
            {getFirstName()}!
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* Add Tracker Button */}
          <button
            onClick={onAddTracker}
            className="hidden sm:flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Tracker
          </button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="relative cursor-pointer active:scale-95 transition-transform"
            >
              {/* Initials Avatar */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/30 bg-primary-container/20 flex items-center justify-center">
                <span className="text-xs font-black text-primary-container">
                  {getInitials()}
                </span>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1b1b20] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">

                {/* User info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.user_metadata?.username || 'User'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Profile
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  Settings
                </button>

                <div className="border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Logout
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}