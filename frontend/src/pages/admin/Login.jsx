import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // FastAPI OAuth2PasswordRequestForm expects form-urlencoded data
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log('Login success:', response.data);
            localStorage.setItem('adminInfo', JSON.stringify(response.data));
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            
            // Extract error message safely to avoid rendering objects in JSX
            let errorMsg = 'Invalid email or password';
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMsg = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail[0]?.msg || JSON.stringify(err.response.data.detail);
                } else {
                    errorMsg = JSON.stringify(err.response.data.detail);
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
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
                            placeholder="Username"
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
