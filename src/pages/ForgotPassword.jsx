import Button from "../components/Button"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authService } from "../supabase/auth"
import { useState } from "react"

export default function ForgotPassword() {

  const [emailSent, setEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await authService.forgotPassword(data.email)
      setEmailSent(true)
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
            <h1 className="text-3xl font-black text-primary-container tracking-tighter  glow-text">
              SyncSpace
            </h1>
            <div className="mt-1 h-px w-12 bg-primary-container mx-auto"></div>
          </div>

          {emailSent ? (
            <>
              {/* Email sent state */}
              <div className="w-full text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-primary-container text-3xl">
                    mark_email_read
                  </span>
                </div>
                <h2
                  style={{ fontFamily: "Playfair Display, serif" }}
                  className="text-2xl font-bold text-white"
                >
                  Check your email
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We sent a password reset link to your email. Click it to reset your password.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-4 text-primary-container hover:underline underline-offset-4 font-semibold text-sm transition-all"
                >
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Heading */}
              <div className="w-full space-y-2 mb-8 text-center">
                <h2
                  style={{ fontFamily: "Playfair Display, serif" }}
                  className="text-[26px] font-bold text-white tracking-tight"
                >
                  Reset your password
                </h2>
                <p className="text-on-surface-variant text-sm font-medium">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email"
                    }
                  })}
                />

                {authError && (
                  <p className="text-xs text-red-400 text-center">{authError}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth={true}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

              </form>

              {/* Back to login */}
              <div className="mt-8 text-center">
                <p className="text-on-surface-variant text-sm">
                  Remember your password?
                  <Link
                    to="/login"
                    className="text-primary hover:underline underline-offset-4 font-semibold ml-1 transition-all"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}

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