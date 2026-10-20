import Button from "../components/Button"
import Input from "../components/Input"
import Container from "../components/Container"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authService } from "../supabase/auth"
import { useState , useEffect} from "react"
import { useSelector } from "react-redux"

export default function Login() {

  const [authError, setAuthError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.userData)

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])


  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await authService.login(data)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      setAuthError(error.message)
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

      <Container className="py-12">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center shadow-2xl shadow-primary/5">

          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-primary-container tracking-tighter glow-text">
              SyncSpace
            </h1>
            <div className="mt-1 h-px w-12 bg-primary-container mx-auto"></div>
          </div>

          {/* Heading */}
          <div className="w-full space-y-2 mb-8 text-center">
            <h2
              className="text-[26px] font-bold text-white tracking-tight"
            >
              Welcome back
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              Welcome back to your dashboard
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="user@lifeos.system"
              error={errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email"
                }
              })}
            />

            {/* Password */}
            <Input
              label="Password"
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

            {/* Forgot password */}
            <div className="flex items-center justify-between text-xs pt-1">
              
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary-container transition-colors font-medium"
              >
                Forgot key?
              </Link>
            </div>

            {/* Auth error */}
            {authError && (
              <p className="text-xs text-red-400 text-center">{authError}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-outline-variant/20"></div>
            <span className="text-[9px] font-black tracking-[0.2em] text-outline-variant uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-outline-variant/20"></div>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            fullWidth={true}
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </Button>

          {/* Footer link */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?
              <Link
                to="/signup"
                className="text-primary hover:underline underline-offset-4 font-semibold ml-1 transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-outline-variant font-bold tracking-widest uppercase">
          <a href="#" className="hover:text-on-surface transition-colors">Documentation</a>
          <span className="text-outline-variant/20">/</span>
          <a href="#" className="hover:text-on-surface transition-colors">Status</a>
          <span className="text-outline-variant/20">/</span>
          <a href="#" className="hover:text-on-surface transition-colors">v2.0.4-alpha</a>
        </div>

      </Container>

      {/* Copyright */}
      <div className="fixed bottom-0 w-full flex justify-center px-8 py-6 pointer-events-none">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-outline-variant/40">
          © 2024 MODULAR LIFE OS. ENGINEERED FOR FLOW.
        </p>
      </div>

    </div>
  )
}