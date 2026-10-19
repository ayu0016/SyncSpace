import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import SectionLabel from '../components/ui/SectionLabel'
import Input from '../components/Input'
import Button from '../components/Button'

// Supabase services & client
import { supabase } from '../supabase/supabase'
import { profileService } from '../supabase/profileServices'
import { widgetService } from '../supabase/widgetServices'
import { entryService } from '../supabase/entryServices'

// Redux actions
import { login } from '../store/authSlice'
import { removeWidget, setWidgets } from '../store/widgetSlice'
import { setWidgetEntries, setEntries } from '../store/entriesSlice'

const ACCENT = '#4a9eed'

const TYPE_LABELS = {
  dsa: 'DSA Mastery',
  gym: 'Gym & Diet',
  ml: 'ML Learning',
  kanban: 'Kanban Board',
  custom: 'Custom',
}

const DEFAULT_ICONS = {
  dsa: '💻',
  gym: '🏋️',
  ml: '🧠',
  kanban: '📋',
  custom: '⚡',
}

// ─── Small status line shown under each section ─────────────────────────────
const StatusLine = ({ status }) => {
  if (!status) return null
  const isError = status.type === 'error'
  return (
    <div className={`flex items-center gap-1.5 text-xs ml-1 ${isError ? 'text-red-400' : 'text-green-400'}`}>
      {isError ? <AlertCircle size={14} className="shrink-0" /> : <Check size={14} className="shrink-0" />}
      <span>{status.message}</span>
    </div>
  )
}

// ─── One widget tile: front shows the widget, back confirms deletion ────────
const WidgetTile = ({ widget, entryCount, onDelete }) => {
  const [flipped, setFlipped] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const color = widget.color || ACCENT
  const icon = widget.icon || DEFAULT_ICONS[widget.type] || '📊'

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await onDelete(widget)
    } finally {
      setDeleting(false)
      setFlipped(false)
    }
  }

  const face = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }

  return (
    <div style={{ perspective: '1000px' }} className="h-[136px]">
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        {/* Front */}
        <div
          style={{ ...face, borderTop: `2px solid ${color}` }}
          className="rounded-[12px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] p-4 flex flex-col justify-between transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ background: `${color}22` }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#f0f4ff] truncate">{widget.name}</p>
              <p className="text-xs text-[#94a3b8]">{TYPE_LABELS[widget.type] || 'Widget'}</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="font-mono text-[11px] text-[#94a3b8]/70">
              {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
            </p>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label={`Delete ${widget.name}`}
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Back — delete confirmation */}
        <div
          style={{ ...face, transform: 'rotateY(180deg)' }}
          className="rounded-[12px] border border-red-500/30 bg-red-500/[0.08] backdrop-blur-md p-4 flex flex-col justify-between"
        >
          <div>
            <p className="text-sm font-bold text-[#f0f4ff] truncate">Delete {widget.name}?</p>
            <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
              This also deletes {entryCount} {entryCount === 1 ? 'entry' : 'entries'}. You can't undo this.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setFlipped(false)}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Page ────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = useSelector((state) => state.auth.userData)
  const widgets = useSelector((state) => state.widgets.widgets || [])
  const entriesByWidget = useSelector((state) => state.entries.entries || {})

  // Derive display name matching Navbar's priority
  const currentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.username ||
    user?.username ||
    user?.email?.split('@')[0] ||
    ''

  const email = user?.email || ''

  // Avatar initial: derived like Navbar.jsx initials
  const initial = (currentName || email || '?')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const [nameStatus, setNameStatus] = useState(null)
  const [pwStatus, setPwStatus] = useState(null)
  const [widgetStatus, setWidgetStatus] = useState(null)

  // Password visibility states
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Hydrate widgets/entries if page was directly loaded / refreshed
  useEffect(() => {
    if (user?.id && widgets.length === 0) {
      widgetService.getWidgets(user.id).then((data) => {
        if (data) dispatch(setWidgets(data))
      }).catch(console.error)

      entryService.getAllEntries(user.id).then((data) => {
        if (data) dispatch(setEntries(data))
      }).catch(console.error)
    }
  }, [user?.id, widgets.length, dispatch])

  // ── Account details form ──
  const nameForm = useForm({
    defaultValues: { name: currentName },
  })

  // Sync default value if currentName loads asynchronously
  useEffect(() => {
    if (currentName) {
      nameForm.reset({ name: currentName })
    }
  }, [currentName, nameForm])

  const nameValue = nameForm.watch('name') || ''
  const nameChanged = nameValue.trim() !== '' && nameValue.trim() !== currentName

  const onSaveName = async (data) => {
    setNameStatus(null)
    const trimmedName = data.name.trim()

    try {
      if (!user?.id) throw new Error('User ID is required')

      // 1. Update profiles table in Supabase
      try {
        await profileService.updateProfile(user.id, { username: trimmedName })
      } catch (_err) {
        // If row didn't exist yet, try upserting
        try {
          await supabase.from('profiles').upsert({ id: user.id, username: trimmedName })
        } catch (_upsertErr) {
          console.warn('Profiles table update notice:', _upsertErr)
        }
      }

      // 2. Update Supabase Auth user metadata so it persists across reloads/sessions
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          name: trimmedName,
          username: trimmedName,
        },
      })
      if (authError) throw authError

      // 3. Update Redux store immediately so Navbar & Hero card update instantly
      const updatedUser = authData?.user || {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: trimmedName,
          name: trimmedName,
          username: trimmedName,
        },
      }
      dispatch(login(updatedUser))

      nameForm.reset({ name: trimmedName })
      setNameStatus({ type: 'success', message: 'Name updated successfully' })
    } catch (error) {
      console.error('Error updating name:', error)
      setNameStatus({
        type: 'error',
        message: error.message || 'Could not update your name',
      })
    }
  }

  // ── Change password form ──
  const pwForm = useForm({
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })

  const onChangePassword = async (data) => {
    setPwStatus(null)
    try {
      if (!user?.email) throw new Error('User email not found')

      // 1. Verify current password by attempting sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.current_password,
      })
      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // 2. Update to new password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      })
      if (updateError) throw updateError

      pwForm.reset()
      setPwStatus({ type: 'success', message: 'Password updated successfully' })
    } catch (error) {
      console.error('Error changing password:', error)
      setPwStatus({
        type: 'error',
        message: error.message || 'Could not update your password',
      })
    }
  }

  // ── Delete widget ──
  const handleDeleteWidget = async (widgetToDelete) => {
    setWidgetStatus(null)
    try {
      if (!user?.id) throw new Error('User ID is required')

      // 1. Delete associated entries from Supabase entries table
      try {
        await supabase.from('entries').delete().eq('widget_id', widgetToDelete.id)
      } catch (entryErr) {
        console.warn('Entries delete error:', entryErr)
      }

      // 2. Delete widget from Supabase widgets table
      await widgetService.deleteWidget(widgetToDelete.id)

      // 3. Remove widget and its entries from Redux
      dispatch(removeWidget(widgetToDelete.id))
      dispatch(setWidgetEntries({ widget_id: widgetToDelete.id, entries: [] }))

      setWidgetStatus({
        type: 'success',
        message: `Widget "${widgetToDelete.name}" deleted`,
      })
    } catch (error) {
      console.error('Error deleting widget:', error)
      setWidgetStatus({
        type: 'error',
        message: error.message || 'Could not delete the widget',
      })
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* 1. Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-6 py-4 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[#f0f4ff]">Profile</h1>
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* 2. Hero Card */}
        <GlassCard accentColor={ACCENT} className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-[#0a0a0f] shrink-0 shadow-[0_0_20px_rgba(74,158,237,0.35)]"
              style={{ backgroundColor: ACCENT }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-[#f0f4ff] truncate">
                {currentName || 'Your Name'}
              </p>
              <p className="text-sm text-[#94a3b8] truncate font-mono mt-0.5">
                {email}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 3. Account Details */}
        <div>
          <SectionLabel label="ACCOUNT DETAILS" />
          <GlassCard className="p-5 sm:p-6">
            <form onSubmit={nameForm.handleSubmit(onSaveName)} className="flex flex-col gap-4">
              <Input
                label="Display name"
                placeholder="Your name"
                error={nameForm.formState.errors.name}
                {...nameForm.register('name', {
                  required: { value: true, message: 'Display name is required' },
                  maxLength: { value: 40, message: 'Keep it under 40 characters' },
                  validate: (v) => v.trim() !== '' || 'Display name cannot be empty',
                })}
              />
              <Input
                label="Email"
                value={email}
                readOnly
                disabled
                className="cursor-not-allowed opacity-60"
              />
              <StatusLine status={nameStatus} />
              <div className="flex justify-end pt-3 border-t border-white/[0.07]">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!nameChanged || nameForm.formState.isSubmitting}
                >
                  {nameForm.formState.isSubmitting ? 'Saving...' : 'Save name'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* 4. Change Password */}
        <div>
          <SectionLabel label="CHANGE PASSWORD" />
          <GlassCard className="p-5 sm:p-6">
            <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="flex flex-col gap-4">
              <Input
                label="Current password"
                type={showCurrentPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter current password"
                error={pwForm.formState.errors.current_password}
                {...pwForm.register('current_password', {
                  required: { value: true, message: 'Enter your current password' },
                })}
              >
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary-container transition-colors"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Input>

              <Input
                label="New password"
                type={showNewPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={pwForm.formState.errors.new_password}
                {...pwForm.register('new_password', {
                  required: { value: true, message: 'Enter a new password' },
                  minLength: { value: 8, message: 'Use at least 8 characters' },
                })}
              >
                <button
                  type="button"
                  onClick={() => setShowNewPw((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary-container transition-colors"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Input>

              <Input
                label="Confirm new password"
                type={showConfirmPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                error={pwForm.formState.errors.confirm_password}
                {...pwForm.register('confirm_password', {
                  required: { value: true, message: 'Confirm your new password' },
                  validate: (v) =>
                    v === pwForm.getValues('new_password') || 'Passwords do not match',
                })}
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary-container transition-colors"
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Input>

              <StatusLine status={pwStatus} />

              <div className="flex justify-end pt-3 border-t border-white/[0.07]">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={pwForm.formState.isSubmitting}
                >
                  {pwForm.formState.isSubmitting ? 'Updating...' : 'Update password'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* 5. My Widgets */}
        <div className="mb-8">
          <SectionLabel label="MY WIDGETS" />
          <GlassCard className="p-5 sm:p-6">
            {widgets.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#94a3b8]">
                  No widgets yet. Use Add New Tracker on the dashboard to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {widgets.map((widget) => (
                  <WidgetTile
                    key={widget.id}
                    widget={widget}
                    entryCount={entriesByWidget[widget.id]?.length || 0}
                    onDelete={handleDeleteWidget}
                  />
                ))}
              </div>
            )}
            {widgetStatus && (
              <div className="mt-4">
                <StatusLine status={widgetStatus} />
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Profile