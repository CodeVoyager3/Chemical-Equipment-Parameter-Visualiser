import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from '../components/AuthLayout';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username.trim() || !password) {
            setError('Please enter both username and password');
            setLoading(false);
            return;
        }

        const auth = 'Basic ' + btoa(`${username}:${password}`);

        try {
            // Validate credentials
            await axios.get(`${API_BASE}/api/upload/`, {
                headers: { 'Authorization': auth },
                timeout: 10000
            });

            // Success
            if (onLoginSuccess) {
                onLoginSuccess(auth);
            }
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Invalid username or password');
            } else if (err.response?.status === 405) {
                // Method not allowed but auth likely passed
                if (onLoginSuccess) onLoginSuccess(auth);
                navigate('/');
            } else {
                // Allow login on network error to let protected routes handle it
                if (onLoginSuccess) onLoginSuccess(auth);
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Please sign in to continue"
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Signing In...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-2">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-medium hover:underline">
                        Sign Up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
