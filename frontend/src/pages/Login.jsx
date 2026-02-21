import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, clearUserError } from '@/store/slices/userSlice'
import AuthForm from '@/components/auth/AuthForm'
import { useEffect } from 'react'

export default function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error, token } = useSelector(s => s.user)

    useEffect(() => {
        dispatch(clearUserError())
    }, [dispatch])

    useEffect(() => {
        if (token) navigate('/dashboard', { replace: true })
    }, [token, navigate])

    const handleLogin = (form) => {
        dispatch(loginUser({ email: form.email, password: form.password }))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/40 px-4">
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
                    <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to access your farm analytics</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
