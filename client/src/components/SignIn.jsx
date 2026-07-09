import * as React from "react"
import { Key, Smartphone, Mail, Globe, Sparkles, LogIn } from "lucide-react"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Input } from "./ui/Input"
import { Select } from "./ui/Select"
import { Toast } from "./ui/Toast"

export function SignIn() {
  const [loginMethod, setLoginMethod] = React.useState("email") // "email" or "phone"
  const [emailValue, setEmailValue] = React.useState("")
  const [phoneValue, setPhoneValue] = React.useState("")
  
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

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!emailValue) {
      triggerToast("Please enter a valid email address.", "warning")
      return
    }
    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      triggerToast("Invalid email format.", "warning")
      return
    }
    triggerToast(`Sign-in link sent to ${emailValue}!`, "success")
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (!phoneValue || phoneValue.length < 7) {
      triggerToast("Please enter a valid phone number.", "warning")
      return
    }
    triggerToast(`Verification code sent to ${phoneValue}!`, "success")
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
            luma<span className="text-luma-blue font-medium animate-pulse">*</span>
          </span>
          <div className="flex items-center gap-1.5 bg-luma-green-bg border border-luma-green/20 rounded-full px-2.5 py-0.5 text-[10px] text-luma-green font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luma-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-luma-green"></span>
            </span>
            System Live
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-luma-text-muted">
          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-mono text-[11px] text-luma-text-light-gray shadow-inner">
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
        <Card className="w-full max-w-[420px] bg-[#17181a]/85 border border-white/[0.06] rounded-[28px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden transition-all duration-500 hover:border-white/[0.1]">
          {/* Subtle colorful top-highlight border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-70" />

          <div className="flex flex-col items-center text-center">
            {/* Circular badge door icon with gradient background */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] text-luma-text-muted mb-5 shadow-lg transition-transform duration-500 hover:rotate-12">
              <div className="absolute inset-0 rounded-full bg-luma-blue/10 blur-sm" />
              <LogIn className="h-5 w-5 text-luma-blue relative z-10" />
            </div>

            <h2 className="text-xl font-bold text-luma-text-primary tracking-tight flex items-center gap-1.5 justify-center">
              Welcome to Luma
            </h2>
            <p className="mt-1 text-xs text-luma-text-muted">
              Please sign in or sign up below.
            </p>
          </div>

          {/* Form wrapper */}
          <div className="mt-7 space-y-5">
            {loginMethod === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="email" className="text-luma-text-muted">Email</label>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod("phone")}
                    className="text-luma-blue hover:text-luma-blue-hover flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Smartphone className="h-3 w-3" /> Use Phone Number
                  </button>
                </div>
                
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-luma-text-gray" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="pl-10 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-11 text-sm rounded-xl px-3.5 placeholder:text-luma-text-gray transition-all"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full h-11 text-sm font-bold rounded-xl mt-2 bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)]">
                  Continue with Email
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="phone" className="text-luma-text-muted">Phone Number</label>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod("email")}
                    className="text-luma-blue hover:text-luma-blue-hover flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Mail className="h-3 w-3" /> Use Email
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Select className="w-20 bg-luma-black/30 border-white/[0.08] h-11 rounded-xl text-xs px-2.5 text-luma-text-light-gray">
                    <option value="us">+1 US</option>
                    <option value="in">+91 IN</option>
                    <option value="uk">+44 UK</option>
                    <option value="de">+49 DE</option>
                  </Select>
                  <div className="relative flex-1 flex items-center">
                    <Smartphone className="absolute left-3.5 h-4 w-4 text-luma-text-gray" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="555-0199"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className="pl-10 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-11 text-sm rounded-xl px-3.5 placeholder:text-luma-text-gray transition-all"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full h-11 text-sm font-bold rounded-xl mt-2 bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)]">
                  Continue with Phone
                </Button>
              </form>
            )}

            {/* Subtle Divider */}
            <div className="py-1 flex items-center justify-center text-xs text-luma-text-muted">
              <span className="w-full h-px bg-white/[0.06]" />
              <span className="px-3 text-luma-text-gray font-medium">or</span>
              <span className="w-full h-px bg-white/[0.06]" />
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <Button 
                onClick={() => triggerToast("Google Login Simulated.", "success")}
                variant="secondary" 
                className="w-full h-11 text-xs font-bold rounded-xl justify-center gap-2.5 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-luma-blue/30 text-luma-text-primary hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                {/* Custom Google G SVG icon */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                className="w-full h-11 text-xs font-bold rounded-xl justify-center gap-2.5 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-luma-indigo/30 text-luma-text-primary hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                <Key className="h-4 w-4 shrink-0 text-luma-yellow" />
                Sign in with Passkey
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luma-text-gray gap-2 z-10 relative">
        <span>© {new Date().getFullYear()} Luma Clone. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-luma-text-muted transition-colors">Terms</a>
          <a href="#" className="hover:text-luma-text-muted transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-luma-text-muted transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  )
}
