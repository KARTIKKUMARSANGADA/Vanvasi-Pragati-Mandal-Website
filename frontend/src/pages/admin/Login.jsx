import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
            navigate('/admin-vpm-portal/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // ✅ Send as JSON to match updated backend
            const response = await api.post('/auth/login', { 
                username: email, 
                password 
            });
            
            console.log('Login successful:', response.data);
            localStorage.setItem('adminInfo', JSON.stringify(response.data));
            navigate('/admin-vpm-portal/dashboard');
        } catch (err) {
            console.error('Login error details:', err.response?.data || err.message);
            
            // ✅ Safety check: prevent rendering objects to avoid Error #31
            let errorMsg = 'Invalid email or password';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMsg = detail;
                } else if (Array.isArray(detail)) {
                    errorMsg = detail[0]?.msg || JSON.stringify(detail);
                } else {
                    errorMsg = JSON.stringify(detail);
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
            <Link 
                to="/" 
                className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Website
            </Link>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage your website</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-secondary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
