import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, clearUserError } from '@/store/slices/userSlice'
import AuthForm from '@/components/auth/AuthForm'
import { useEffect, useState } from 'react'

export default function Register() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector(s => s.user)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        dispatch(clearUserError())
    }, [dispatch])

    const handleRegister = async (form) => {
        const result = await dispatch(registerUser({
            email: form.email,
            password: form.password,
            full_name: form.full_name,
        }))
        if (!result.error) {
            setSuccess(true)
            setTimeout(() => navigate('/login'), 2000)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/40 px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-gray-900">Account Created!</h1>
                    <p className="text-sm text-gray-500 mt-2">Redirecting to login…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/40 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary-500/30">
                            G
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                            Gainn.ai
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-sm text-gray-500 mt-1">Start optimizing your farm today</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
