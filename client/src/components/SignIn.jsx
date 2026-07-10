import * as React from "react"
import { Key, Smartphone, Mail, Globe, Sparkles, LogIn } from "lucide-react"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Input } from "./ui/Input"
import { Toast } from "./ui/Toast"

export function SignIn() {
  const [loginMethod, setLoginMethod] = React.useState("email") // "email" or "phone"
  const [emailValue, setEmailValue] = React.useState("")
  const [phoneValue, setPhoneValue] = React.useState("")
  const [step, setStep] = React.useState(1) // 1: Email/Phone, 2: OTP
  const [otpValue, setOtpValue] = React.useState("")
  
  // Toast notifications
  const [toastOpen, setToastOpen] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")
  const [toastType, setToastType] = React.useState("success")

  // Clock state for Luma Header
  const [currentTime, setCurrentTime] = React.useState("")

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
      const offsetMinutes = -now.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      const offsetRemaining = Math.abs(offsetMinutes) % 60
      const offsetSign = offsetMinutes >= 0 ? "+" : "-"
      const timezoneStr = `GMT${offsetSign}${offsetHours}:${offsetRemaining.toString().padStart(2, "0")}`

      setCurrentTime(`${timeStr} ${timezoneStr}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  const triggerToast = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
    setToastOpen(true)
  }

  const handleEmailSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!emailValue) {
      triggerToast("Please enter a valid email address.", "warning")
      return
    }
    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      triggerToast("Invalid email format.", "warning")
      return
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue })
      });
      const data = await response.json();
      if (response.ok) {
        triggerToast(`Verification code sent to ${emailValue}!`, "success")
        setStep(2)
      } else {
        triggerToast(data.error || "Failed to send code.", "error")
      }
    } catch (err) {
      console.error(err)
      triggerToast("Failed to connect to authentication server. Simulating OTP...", "info")
      setStep(2)
    }
  }

  const handlePhoneSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!phoneValue || phoneValue.length < 7) {
      triggerToast("Please enter a valid phone number.", "warning")
      return
    }
    triggerToast(`Verification code sent to ${phoneValue}!`, "success")
    setStep(2)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    if (!otpValue || otpValue.length !== 6) {
      triggerToast("Please enter a valid 6-digit code.", "warning")
      return
    }
    triggerToast("Successfully verified! Logging you in...", "success")
  }

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Toast Notification Feed */}
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-[350px] h-[350px] rounded-full bg-luma-blue/15 blur-[120px] animate-float-1" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-luma-indigo/20 blur-[130px] animate-float-2" />
        <div className="absolute top-[40%] right-[25%] w-[300px] h-[300px] rounded-full bg-luma-yellow/5 blur-[100px] animate-float-3" />
      </div>

      {/* Luma Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[22px] tracking-tight text-luma-white cursor-pointer hover:opacity-90 flex items-center gap-1">
            nexus<span className="text-luma-blue font-medium animate-pulse">*</span>
          </span>
       
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-luma-text-muted">
          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-sans text-[11px] text-luma-text-light-gray shadow-inner">
            <Globe className="h-3 w-3 text-luma-blue animate-spin-[20s]" />
            <span>{currentTime}</span>
          </div>
          <a href="#" className="hover:text-luma-text-primary transition-colors flex items-center gap-1 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-luma-yellow" />
            Discover Events
          </a>
          <Button variant="secondary" size="xs" className="h-[32px] rounded-lg px-3.5 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-luma-white font-semibold transition-all">
            Sign In
          </Button>
        </div>
      </header>

      {/* Centered Sign In Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10 relative">
        <Card className="w-full max-w-[420px] bg-[#121315]/65 border border-white/[0.08] rounded-[28px] p-8 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[24px] relative overflow-hidden transition-all duration-500 hover:border-white/[0.15]">
          {/* Subtle colorful top-highlight border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-70" />

          {step === 1 ? (
            <div className="flex flex-col items-center text-center">
              {/* Circular badge door icon with gradient background */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] text-luma-text-muted mb-5 shadow-lg transition-transform duration-500 hover:rotate-12">
                <div className="absolute inset-0 rounded-full bg-luma-blue/10 blur-sm" />
                <LogIn className="h-5 w-5 text-luma-blue relative z-10" />
              </div>

              <h2 className="text-2xl font-bold text-luma-text-primary tracking-tight flex items-center gap-1.5 justify-center">
                Welcome to Nexus
              </h2>
              <p className="mt-2 text-sm text-luma-text-muted">
                Please sign in or sign up below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {/* Shield/Key icon for OTP */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] text-luma-text-muted mb-5 shadow-lg transition-transform duration-500 hover:rotate-12">
                <div className="absolute inset-0 rounded-full bg-luma-blue/10 blur-sm" />
                <Key className="h-5 w-5 text-luma-blue relative z-10" />
              </div>

              <h2 className="text-2xl font-bold text-luma-text-primary tracking-tight flex items-center gap-1.5 justify-center">
                Verify Your Account
              </h2>
              <p className="mt-2 text-sm text-luma-text-muted">
                Enter the 6-digit code sent to {loginMethod === "email" ? emailValue : phoneValue}.
              </p>
            </div>
          )}

          {/* Form wrapper */}
          <div className="mt-7 space-y-5">
            {step === 1 ? (
              loginMethod === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <label htmlFor="email" className="text-luma-text-muted">Email</label>
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod("phone")}
                      className="text-luma-blue hover:text-luma-blue-hover flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="h-3.5 w-3.5" /> Use Phone Number
                    </button>
                  </div>
                  
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 h-4.5 w-4.5 text-luma-text-gray" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="pl-11 pr-4 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-12 text-base rounded-[14px] placeholder:text-luma-text-gray transition-all"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full h-12 text-[15px] font-semibold rounded-[14px] mt-2 bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)]">
                    Continue with Email
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <label htmlFor="phone" className="text-luma-text-muted">Phone Number</label>
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod("email")}
                      className="text-luma-blue hover:text-luma-blue-hover flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" /> Use Email
                    </button>
                  </div>
                  
                  <div className="relative flex items-center">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 81234 56789"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-12 text-base rounded-[14px] px-4 placeholder:text-luma-text-gray transition-all"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full h-12 text-[15px] font-semibold rounded-[14px] mt-2 bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)]">
                    Continue with Phone
                  </Button>
                </form>
              )
            ) : (
              // Step 2: Verification Code Input
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <label htmlFor="otp" className="text-luma-text-muted">Verification Code</label>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-luma-blue hover:text-luma-blue-hover flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Key className="absolute left-4 h-4.5 w-4.5 text-luma-text-gray" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="pl-11 pr-4 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-12 text-base tracking-[0.3em] font-mono rounded-[14px] placeholder:text-luma-text-gray placeholder:tracking-normal placeholder:font-sans transition-all text-center"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full h-12 text-[15px] font-semibold rounded-[14px] mt-2 bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)]">
                  Verify Code
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (loginMethod === "email") {
                        handleEmailSubmit();
                      } else {
                        handlePhoneSubmit();
                      }
                    }}
                    className="text-[11px] text-luma-text-gray hover:text-luma-blue transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* Subtle Divider */}
            {step === 1 && (
              <>
                <div className="py-1.5 flex items-center justify-center text-xs text-luma-text-muted">
                  <span className="w-full h-px bg-white/[0.06]" />
                  <span className="px-3.5 text-luma-text-gray font-medium">or</span>
                  <span className="w-full h-px bg-white/[0.06]" />
                </div>

                {/* Social Logins */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => triggerToast("Google Login Simulated.", "success")}
                    variant="secondary" 
                    className="w-full h-12 text-[15px] font-semibold rounded-[14px] justify-center gap-3 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-luma-blue/30 text-luma-text-primary hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                  >
                    {/* Custom Google G SVG icon */}
                    <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </Button>

                  <Button 
                    onClick={() => triggerToast("Passkey verification initiated...", "info")}
                    variant="secondary" 
                    className="w-full h-12 text-[15px] font-semibold rounded-[14px] justify-center gap-3 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-luma-indigo/30 text-luma-text-primary hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                  >
                    <Key className="h-4.5 w-4.5 shrink-0 text-luma-yellow" />
                    Sign in with Passkey
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luma-text-gray gap-2 z-10 relative">
        <span>© {new Date().getFullYear()} Nexus. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-luma-text-muted transition-colors">Terms</a>
          <a href="#" className="hover:text-luma-text-muted transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-luma-text-muted transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  )
}
