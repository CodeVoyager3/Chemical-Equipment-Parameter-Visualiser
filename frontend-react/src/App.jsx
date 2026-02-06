import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  Activity,
  Upload,
  Wind,
  Thermometer,
  Gauge,
  Database,
  Sun,
  Moon,
  Beaker,
  TrendingUp,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  UserPlus
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Theme chart colors matching our Solarized theme
const chartColors = {
  bar: {
    background: 'rgba(38, 139, 210, 0.7)',
    border: '#268bd2'
  },
  pie: [
    { bg: 'rgba(38, 139, 210, 0.7)', border: '#268bd2' },   // blue
    { bg: 'rgba(42, 161, 152, 0.7)', border: '#2aa198' },   // cyan
    { bg: 'rgba(211, 54, 130, 0.7)', border: '#d33682' },   // magenta
    { bg: 'rgba(203, 75, 22, 0.7)', border: '#cb4b16' },    // orange
    { bg: 'rgba(220, 50, 47, 0.7)', border: '#dc322f' },    // red
    { bg: 'rgba(181, 137, 0, 0.7)', border: '#b58900' },    // yellow
    { bg: 'rgba(133, 153, 0, 0.7)', border: '#859900' },    // green
    { bg: 'rgba(108, 113, 196, 0.7)', border: '#6c71c4' },  // violet
  ]
};

// API Base URL - defined at module scope for use throughout component
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [batchId, setBatchId] = useState(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState('');

  // Store auth header for API calls
  const [authHeader, setAuthHeader] = useState('');

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check for saved auth
    const savedAuth = localStorage.getItem('authHeader');
    if (savedAuth) {
      setAuthHeader(savedAuth);
      setIsAuthenticated(true);
      setShowLoginModal(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    if (!username.trim() || !password) {
      setLoginError('Please enter both username and password');
      setLoginLoading(false);
      return;
    }

    // Create auth header and store it
    const auth = 'Basic ' + btoa(`${username}:${password}`);

    try {
      // Try a real API call to validate credentials
      // Using GET with a small timeout to quickly validate
      await axios.get(`${API_BASE}/api/upload/`, {
        headers: { 'Authorization': auth },
        timeout: 10000
      });

      // If successful (any non-401 response), credentials are valid
      setAuthHeader(auth);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      localStorage.setItem('authHeader', auth);
    } catch (err) {
      if (err.response?.status === 401) {
        setLoginError('Invalid username or password');
      } else if (err.response?.status === 405) {
        // Method not allowed but auth passed - credentials are valid
        setAuthHeader(auth);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        localStorage.setItem('authHeader', auth);
      } else {
        // Network error or server issue - allow login and let upload validate
        setAuthHeader(auth);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        localStorage.setItem('authHeader', auth);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSignupSuccess('');
    setLoginLoading(true);

    // Frontend validation
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setLoginError('All fields are required');
      setLoginLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLoginError('Passwords do not match');
      setLoginLoading(false);
      return;
    }

    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      setLoginLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/register/`, {
        username: username.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword
      });

      if (response.status === 201) {
        setSignupSuccess('Account created successfully! Please login.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).join('. ');
        setLoginError(errorMessages);
      } else {
        setLoginError('Registration failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLoginModal(true);
    setAuthMode('login');
    setAuthHeader('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setStats(null);
    setLoginError('');
    setSignupSuccess('');
    localStorage.removeItem('authHeader');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/api/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': authHeader
        },
      });
      setStats(response.data.statistics);
      setBatchId(response.data.batch_id);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        handleLogout();
      } else {
        setError('Failed to upload file. Make sure Server is running!');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* Login/Signup Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {authMode === 'login' ? <Lock className="h-8 w-8 text-primary" /> : <UserPlus className="h-8 w-8 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-2xl">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
                <CardDescription>
                  {authMode === 'login' ? 'Enter your credentials to continue' : 'Fill in the details to get started'}
                </CardDescription>
              </div>

              {/* Auth Mode Tabs */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setLoginError(''); setSignupSuccess(''); }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'signup'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Sign Up
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Success Message */}
              {signupSuccess && (
                <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                  {signupSuccess}
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {/* Username */}
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email - Only for Signup */}
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
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

                {/* Confirm Password - Only for Signup */}
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {loginError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                    {loginError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      {authMode === 'login' ? 'Logging in...' : 'Creating account...'}
                    </div>
                  ) : (
                    authMode === 'login' ? 'Login' : 'Create Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Beaker className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Chemical Equipment Visualizer</h1>
              <p className="text-xs text-muted-foreground">Process Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-card p-8 border border-border">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium text-secondary">Analytics Dashboard</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome to Your Dashboard</h2>
              <p className="text-muted-foreground max-w-md">
                Upload your chemical equipment CSV data to visualize flow rates, pressures, and temperatures with beautiful charts.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats?.total_count || '—'}</div>
                <div className="text-xs text-muted-foreground">Equipment</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{stats ? Object.keys(stats.type_distribution).length : '—'}</div>
                <div className="text-xs text-muted-foreground">Types</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Upload Equipment Data</CardTitle>
            <CardDescription>Select a CSV file containing your equipment specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Label
                htmlFor="csv_file"
                className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-primary/50 transition-colors w-full"
              >
                <Database className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to browse or drag and drop</span>
                <span className="text-xs text-muted-foreground/60">CSV files only</span>
              </Label>
              <Input
                id="csv_file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-lg">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-primary font-medium">Processing your data...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        {stats && (
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-chart-1/10 flex items-center justify-center group-hover:bg-chart-1/20 transition-colors">
                    <Database className="h-4 w-4 text-chart-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Units registered in system</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Flowrate</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 transition-colors">
                    <Wind className="h-4 w-4 text-chart-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.average_flowrate}</div>
                  <p className="text-xs text-muted-foreground mt-1">m³/hr average flow</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Pressure</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center group-hover:bg-chart-3/20 transition-colors">
                    <Gauge className="h-4 w-4 text-chart-3" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.average_pressure}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pa average pressure</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-chart-4/10 flex items-center justify-center group-hover:bg-chart-4/20 transition-colors">
                    <Thermometer className="h-4 w-4 text-chart-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.average_temperature}</div>
                  <p className="text-xs text-muted-foreground mt-1">°C average temp</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Equipment Distribution
                  </CardTitle>
                  <CardDescription>Count per equipment type in your dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    <Bar
                      data={{
                        labels: Object.keys(stats.type_distribution),
                        datasets: [{
                          label: 'Count',
                          data: Object.values(stats.type_distribution),
                          backgroundColor: chartColors.bar.background,
                          borderColor: chartColors.bar.border,
                          borderWidth: 2,
                          borderRadius: 6,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(131, 148, 150, 0.1)',
                            },
                            ticks: {
                              color: '#839496'
                            }
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: '#839496'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-secondary" />
                    Distribution Share
                  </CardTitle>
                  <CardDescription>Proportion of equipment types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] flex items-center justify-center">
                    <Pie
                      data={{
                        labels: Object.keys(stats.type_distribution),
                        datasets: [{
                          label: 'Count',
                          data: Object.values(stats.type_distribution),
                          backgroundColor: chartColors.pie.map(c => c.bg),
                          borderColor: chartColors.pie.map(c => c.border),
                          borderWidth: 2,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 16,
                              color: '#839496'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <button
                onClick={() => window.open(`${API_BASE}/api/export-pdf/${batchId}/`, '_blank')}
                style={{ marginTop: '20px', padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                disabled={!batchId}
              >
                Download PDF Report
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border mt-12">
          <p>Chemical Equipment Visualizer • Built with React & Shadcn UI</p>
        </footer>
      </main>
    </div>
  );
}

export default App;