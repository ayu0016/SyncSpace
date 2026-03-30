import Button from "../components/Button"
import Input from "../components/Input"

import { Link,} from "react-router-dom"
import { useForm } from "react-hook-form"
import { authService } from "../supabase/auth"
import { useState } from "react"

export default function SignUp() {

  // YOUR LOGIC HERE
  const [autherror , setAuthError] =useState(null)
  const [emailSent,setEmailSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false)



  const onSubmit = async (data) => {
  setIsLoading(true)
  setAuthError(null)
  try {
    await authService.signUp(data)
        setEmailSent(true)  // ← tell user to check email

  } catch (error) {
    setAuthError(error.message)
  } finally {
    setIsLoading(false)
  }
}

const handleGoogleSignup = async () => {
  try {
    await authService.signInWithGoogle()
  } catch (error) {
    setAuthError(error.message)
  }
}

    
  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center text-on-surface selection:bg-primary-container selection:text-on-primary-container">

      {/* Top right corner decoration */}
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-r border-t border-primary-container/40 w-16 h-16 rounded-tr-xl"></div>
      </div>

      {/* Bottom left corner decoration */}
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20 hidden md:block">
        <div className="border-l border-b border-primary-container/40 w-16 h-16 rounded-bl-xl"></div>
      </div>

      {/* Main card */}
      <main className="w-full max-w-105 px-6 py-12">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center shadow-2xl shadow-primary/5">

          {/* Logo */}
          <div className="mb-5 text-center">
            <h1 className="text-3xl font-black text-primary-container tracking-tighter glow-text">
              SyncSpace
            </h1>
            <div className="mt-1 h-px w-12 bg-primary-container mx-auto"></div>
          </div>

          {/* Heading */}
          <div className="w-full mb-8 text-center">
            <h2
                style={{ fontFamily: "Playfair Display, serif" }}
                className="text-[26px] font-bold text-gray-200 tracking-tight "
            >
                Create your account
            </h2>
            </div>

          {/* Form */}
          {emailSent ? (
            <div className="w-full text-center space-y-3 py-4">
                <div className="text-4xl">📧</div>
                <h3 className="text-white font-bold text-lg">Check your email!</h3>
                <p className="text-on-surface-variant text-sm">
                We sent a confirmation link to your email. Click it to activate your account.
                </p>
            </div>
            ) : (
                <>
                    <form 
                onSubmit={handleSubmit(onSubmit)}
                className="w-full space-y-6">

                    {/* Full Name */}
                    <Input
                    label="Full Name"
                    type="text"
                    placeholder="Full Name"
                    error={errors.fullName}
                    {...register("fullName", {
                        required: "Full name is required",
                        minLength: { value: 2, message: "Name too short" }
                    })}
                    />

                    {/* Email */}
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
                        {showPassword ? "visibility_off" : "visibility" }
                        </span>
                    </button>
                    </Input>

                    {/* Global auth error */}
                    {autherror&& (
                    <p className="text-xs text-red-400 text-center">{autherror}</p>
                    )}

                    {/* Submit */}
                    <Button
                    type="submit"
                    variant="primary"
                    fullWidth={true}
                    disabled={isLoading}
                    >
                    {isLoading ? "Creating..." : "Create Account"}
                    
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
                    onClick={handleGoogleSignup}
                >
                    <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                    />
                    Continue with Google
                </Button>
                </>
          
)}
          

          

          {/* Footer link */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?
              <Link
                to="/login"
                className="text-primary hover:underline underline-offset-4 font-semibold ml-1 transition-all"
              >
                Login
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-outline-variant font-bold tracking-widest uppercase">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
          <span className="text-outline-variant/20">/</span>
          <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
          <span className="text-outline-variant/20">/</span>
          <a href="#" className="hover:text-on-surface transition-colors">Support</a>
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