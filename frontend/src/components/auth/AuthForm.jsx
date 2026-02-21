import { useState, useMemo } from 'react'

function PasswordStrength({ password }) {
    const strength = useMemo(() => {
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        if (password.length >= 12) score++
        return score
    }, [password])

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#059669']

    if (!password) return null

    return (
        <div className="mt-1.5">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{ backgroundColor: i <= strength ? colors[strength] : '#e5e7eb' }}
                    />
                ))}
            </div>
            <p className="text-[10px] font-medium" style={{ color: colors[strength] }}>
                {labels[strength]}
            </p>
        </div>
    )
}

export default function AuthForm({
    mode = 'login',
    onSubmit,
    loading = false,
    error = null,
}) {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        agreeTerms: false,
    })
    const [errors, setErrors] = useState({})

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const e = {}
        if (mode === 'register' && !form.full_name.trim()) e.full_name = 'Name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 8) e.password = 'Min 8 characters'
        if (mode === 'register') {
            if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
            if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        if (!validate()) return
        onSubmit(form)
    }

    const inputClass = (key) =>
        `w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 ${errors[key] ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
        }`

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                </div>
            )}

            {mode === 'register' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={form.full_name}
                        onChange={e => update('full_name', e.target.value)}
                        className={inputClass('full_name')}
                    />
                    {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className={inputClass('email')}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className={inputClass('password')}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                {mode === 'register' && <PasswordStrength password={form.password} />}
            </div>

            {mode === 'register' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                        className={inputClass('confirmPassword')}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
            )}

            {mode === 'login' && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={e => update('rememberMe', e.target.checked)}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        Remember me
                    </label>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Forgot password?
                    </a>
                </div>
            )}

            {mode === 'register' && (
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.agreeTerms}
                            onChange={e => update('agreeTerms', e.target.checked)}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        I agree to the <a href="#" className="text-primary-600 underline">Terms & Conditions</a>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeTerms}</p>}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-600 hover:to-emerald-600 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50"
            >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Social login placeholders */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                </button>
            </div>
        </form>
    )
}
