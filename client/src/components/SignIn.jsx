import * as React from "react"
import { Key, Smartphone, Mail } from "lucide-react"
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
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans flex flex-col justify-between">
      {/* Toast Notification Feed */}
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />

      {/* Luma Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[22px] tracking-tight text-luma-white cursor-pointer hover:opacity-90">
            luma<span className="text-luma-blue-hover/90 font-medium">*</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-[13px] text-luma-text-muted">
          <span className="hidden sm:inline font-mono text-[12px]">{currentTime}</span>
          <a href="#" className="hover:text-luma-text-primary transition-colors">
            Discover Events
          </a>
          <Button variant="secondary" size="xs" className="h-[30px] rounded-lg px-3 bg-luma-card/40 border-luma-border-default hover:bg-luma-card-hover font-semibold">
            Sign In
          </Button>
        </div>
      </header>

      {/* Centered Sign In Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[420px] bg-[#1a1c1e]/90 border-luma-border-default rounded-[24px] p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Decorative Glow background */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-luma-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-luma-indigo/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center">
            {/* Circular badge door icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-luma-white/[0.04] border border-luma-border-default text-luma-text-muted mb-6 shadow-inner">
              <svg className="h-6 w-6 text-luma-text-light-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-luma-text-primary tracking-tight">Welcome to Luma</h2>
            <p className="mt-1.5 text-xs text-luma-text-muted">
              Please sign in or sign up below.
            </p>
          </div>

          {/* Form wrapper */}
          <div className="mt-8 space-y-5">
            {loginMethod === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="email" className="text-luma-text-muted">Email</label>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod("phone")}
                    className="text-luma-text-muted hover:text-luma-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Smartphone className="h-3 w-3" /> Use Phone Number
                  </button>
                </div>
                
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="bg-luma-black/20 border-luma-border-default focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-11 text-sm rounded-xl px-3.5 placeholder:text-luma-text-gray"
                />

                <Button type="submit" variant="primary" className="w-full h-11 text-sm font-semibold rounded-xl mt-2">
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
                    className="text-luma-text-muted hover:text-luma-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Mail className="h-3 w-3" /> Use Email
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Select className="w-20 bg-luma-black/20 border-luma-border-default h-11 rounded-xl text-xs px-2.5">
                    <option value="us">+1 US</option>
                    <option value="in">+91 IN</option>
                    <option value="uk">+44 UK</option>
                    <option value="de">+49 DE</option>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="555-0199"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="flex-1 bg-luma-black/20 border-luma-border-default focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-11 text-sm rounded-xl px-3.5 placeholder:text-luma-text-gray"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full h-11 text-sm font-semibold rounded-xl mt-2">
                  Continue with Phone
                </Button>
              </form>
            )}

            {/* Subtle Divider */}
            <div className="py-2 flex items-center justify-center text-xs text-luma-text-muted">
              <span className="w-full h-px bg-luma-border-subtle" />
              <span className="w-full h-px bg-luma-border-subtle" />
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <Button 
                onClick={() => triggerToast("Google Login Simulated.", "success")}
                variant="secondary" 
                className="w-full h-11 text-xs font-bold rounded-xl justify-center gap-2 bg-luma-white/[0.03] border-luma-border-default hover:bg-luma-white/[0.07] text-luma-text-primary"
              >
                {/* Custom Google G SVG icon */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="opacity-80"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="currentColor" className="opacity-60"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="currentColor" className="opacity-90"/>
                </svg>
                Sign in with Google
              </Button>

              <Button 
                onClick={() => triggerToast("Passkey verification initiated...", "info")}
                variant="secondary" 
                className="w-full h-11 text-xs font-bold rounded-xl justify-center gap-2 bg-luma-white/[0.03] border-luma-border-default hover:bg-luma-white/[0.07] text-luma-text-primary"
              >
                <Key className="h-4 w-4 shrink-0 text-luma-text-muted" />
                Sign in with Passkey
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luma-text-gray gap-2">
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
