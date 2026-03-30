import Button from "../components/Button"
import Input from "../components/Input"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authService } from "../supabase/auth"
import { useState } from "react"

export default function ResetPassword() {

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await authService.resetPassword(data.password)
      navigate("/login")
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center text-on-surface selection:bg-primary-container selection:text-on-primary-container">

      {/* Corner decorations */}
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-r border-t border-primary-container/40 w-16 h-16 rounded-tr-xl"></div>
      </div>
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-l border-b border-primary-container/40 w-16 h-16 rounded-bl-xl"></div>
      </div>

      <main className="w-full max-w-105 px-6 py-12">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center shadow-2xl shadow-primary/5">

          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-black text-primary-container tracking-tighter glow-text">
              SyncSpace
            </h1>
            <div className="mt-1 h-px w-12 bg-primary-container mx-auto"></div>
          </div>

          {/* Heading */}
          <div className="w-full space-y-2 mb-8 text-center">
            <h2
              style={{ fontFamily: "Playfair Display, serif" }}
              className="text-[26px] font-bold text-white tracking-tight"
            >
              New password
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              Choose a strong password for your account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >

            {/* New Password */}
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              error={errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" }
              })}
            >
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </Input>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              error={errors.confirmPassword}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match"
              })}
            >
              <button
                type="button"
                onClick={() => setShowConfirm(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </Input>

            {authError && (
              <p className="text-xs text-red-400 text-center">{authError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Reset Password"}
            </Button>

          </form>

        </div>
      </main>

      {/* Copyright */}
      <div className="fixed bottom-0 w-full flex justify-center px-8 py-6 pointer-events-none">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-outline-variant/40">
          © 2024 MODULAR LIFE OS. ENGINEERED FOR FLOW.
        </p>
      </div>

    </div>
  )
}