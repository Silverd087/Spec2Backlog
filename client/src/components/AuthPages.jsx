import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { login, register } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { generateCodeChallenge, generateCodeVerifier } from '../utilities/CodeChallenge';

export default function AuthPages() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            if (!isLogin && formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            if (isLogin) {
                await login({ email: formData.email, password: formData.password })
            } else {
                await register({ name: formData.name, email: formData.email, password: formData.password })
            }
            navigate('/')

        } catch (error) {
            console.log(error.response?.data?.message || 'Authentication failed')
            alert(error.response?.data?.message || 'Authentication failed')
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleGoogleLogin = async () => {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=600; secure; samesite=lax`
        window.location.href = `http://localhost:3000/api/auth/google?code_challenge=${codeChallenge}`
    }

    const handleGithubLogin = async () => {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=600; secure; samesite=lax`
        window.location.href = `http://localhost:3000/api/auth/github?code_challenge=${codeChallenge}`
    }

    return (
        <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-white/20 relative overflow-hidden flex items-center justify-center p-4">

            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}></div>
                <div className="absolute inset-0 bg-linear-gradient-to-b from-[#00000000] via-[#000000] to-[#000000]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-white mb-6">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Authentication</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-3">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {isLogin
                            ? 'Sign in to access your dashboard'
                            : 'Join Spec2Backlog to start building'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[#050505] rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="space-y-6">
                        {/* Name Field - Only for Register */}
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#111111] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#111111] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#111111] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field - Only for Register */}
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#111111] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Forgot Password - Only for Login */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-gray-500 hover:text-white font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-white/5 group mt-8"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="px-4 bg-[#050505] text-gray-600">Secure Access</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/20 hover:bg-[#111111] transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" className="opacity-50" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            </svg>
                            <span className="text-sm font-bold">Google</span>
                        </button>

                        <button
                            onClick={handleGithubLogin}
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/20 hover:bg-[#111111] transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-bold">GitHub</span>
                        </button>
                    </div>
                </div>

                {/* Toggle between Login and Register */}
                <div className="text-center mt-10">
                    <button
                        onClick={toggleMode}
                        className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
                    >
                        {isLogin ? (
                            <>Don't have an account? <span className="text-white font-bold ml-1">Sign up</span></>
                        ) : (
                            <>Already have an account? <span className="text-white font-bold ml-1">Sign in</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}