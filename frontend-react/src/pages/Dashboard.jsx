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
    Download,
    LogOut,
    Clock,
    FileText,
    Calendar,
    ChevronRight
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

// Theme chart colors matching the cn theme
const chartColors = {
    bar: {
        background: 'rgba(114, 227, 173, 0.7)',
        border: '#72e3ad'
    },
    pie: [
        { bg: 'rgba(114, 227, 173, 0.7)', border: '#72e3ad' },   // mint green (primary)
        { bg: 'rgba(59, 130, 246, 0.7)', border: '#3b82f6' },    // blue
        { bg: 'rgba(139, 92, 246, 0.7)', border: '#8b5cf6' },    // purple
        { bg: 'rgba(245, 158, 11, 0.7)', border: '#f59e0b' },    // amber
        { bg: 'rgba(16, 185, 129, 0.7)', border: '#10b981' },    // emerald
        { bg: 'rgba(236, 72, 153, 0.7)', border: '#ec4899' },    // pink
        { bg: 'rgba(6, 182, 212, 0.7)', border: '#06b6d4' },     // cyan
        { bg: 'rgba(249, 115, 22, 0.7)', border: '#f97316' },    // orange
    ]
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Dashboard = ({ authHeader, onLogout, darkMode, toggleDarkMode }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [batchId, setBatchId] = useState(null);
    const [recentUploads, setRecentUploads] = useState([]);

    // Fetch recent uploads on mount
    useEffect(() => {
        fetchHistory();
    }, [authHeader]);

    const fetchHistory = async () => {
        if (!authHeader) return;
        try {
            const response = await axios.get(`${API_BASE}/api/upload/`, {
                headers: { 'Authorization': authHeader }
            });
            setRecentUploads(response.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleBatchSelect = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE}/api/batch/${id}/`, {
                headers: { 'Authorization': authHeader }
            });
            setStats(response.data.statistics);
            setBatchId(response.data.batch_id);
            // Scroll to stats
            window.scrollTo({ top: 400, behavior: 'smooth' });
        } catch (err) {
            setError('Failed to load report.');
            if (err.response?.status === 401) onLogout();
        } finally {
            setLoading(false);
        }
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
            fetchHistory(); // Refresh history
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                onLogout();
            } else {
                setError('Failed to upload file. Make sure Server is running!');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Beaker className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Chemical Equipments Parameter Visualizer</h1>
                            <p className="text-xs text-muted-foreground">Process Analytics Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onLogout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
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
                <div className="relative overflow-hidden rounded-2xl bg-card p-8 border border-border shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">Analytics Dashboard</span>
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-foreground">
                                Chemical Equipments Parameter Visualization
                            </h2>
                            <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                                Upload your chemical equipment CSV data to visualize flow rates, pressures, and temperatures with interactive charts.
                            </p>
                        </div>

                        <div className="flex items-center gap-6 bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                            <div className="text-center px-4">
                                <div className="text-3xl font-bold text-primary">{stats?.total_count || '—'}</div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Units</div>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center px-4">
                                <div className="text-3xl font-bold text-blue-500">{stats ? Object.keys(stats.type_distribution).length : '—'}</div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Types</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Recent Reports Card */}
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm h-full max-h-[500px] flex flex-col">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Recent Reports
                            </CardTitle>
                            <CardDescription>Your last 5 analysis runs</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            {recentUploads.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No history yet.
                                    <br />Upload a file to get started.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentUploads.map((batch) => (
                                        <button
                                            key={batch.id}
                                            onClick={() => handleBatchSelect(batch.id)}
                                            className={`w-full text-left p-4 transition-all hover:bg-muted/50 group ${batchId === batch.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {batch.filename}
                                                </span>
                                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${batchId === batch.id ? 'translate-x-1 text-primary' : ''}`} />
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(batch.uploaded_at)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Database className="h-3 w-3" />
                                                    {batch.equipment_count} items
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upload Section */}
                    <div className="lg:col-span-2">
                        <Card className="w-full h-full border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm flex flex-col justify-center">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Upload Equipment Data</CardTitle>
                                <CardDescription className="text-base">Select a CSV file containing your equipment specifications</CardDescription>
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
                    </div>
                </div>

                {/* Dashboard Content */}
                {stats && (
                    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">

                        {/* Stats Header & Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-foreground">Analysis Results</h3>
                                <p className="text-muted-foreground">Real-time equipment telemetry and distribution</p>
                            </div>
                            <Button
                                onClick={() => window.open(`${API_BASE}/api/export-pdf/${batchId}/`, '_blank')}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
                                disabled={!batchId}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF Report
                            </Button>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="group hover-lift border-primary/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Database className="h-5 w-5 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">{stats.total_count}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Units registered in system</p>
                                </CardContent>
                            </Card>

                            <Card className="group hover-lift border-blue-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Flowrate</CardTitle>
                                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Wind className="h-5 w-5 text-blue-500" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">{stats.average_flowrate}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">m³/hr average flow</p>
                                </CardContent>
                            </Card>

                            <Card className="group hover-lift border-purple-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Pressure</CardTitle>
                                    <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Gauge className="h-5 w-5 text-purple-500" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">{stats.average_pressure}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Pa average pressure</p>
                                </CardContent>
                            </Card>

                            <Card className="group hover-lift border-amber-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
                                    <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Thermometer className="h-5 w-5 text-amber-500" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">{stats.average_temperature}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">°C average temp</p>
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
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border mt-12">
                    <p>Chemical Equipments Parameter Visualizer • Built with React & Shadcn UI</p>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
