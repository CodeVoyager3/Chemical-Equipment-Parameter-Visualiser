import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl h-[600px] bg-card border border-border rounded-3xl shadow-2xl flex overflow-hidden relative z-10"
            >
                {/* Left Side - Brand & Visuals */}
                <div className="hidden lg:flex w-1/2 bg-muted/30 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />

                    {/* Animated Chemical Elements (GIF Embed) */}
                    <div className="relative z-10 mb-8 w-72 h-72">
                        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-background/50 backdrop-blur-sm">
                            <iframe
                                src="https://giphy.com/embed/mACiRE5HiqioJDdeSR"
                                width="100%"
                                height="100%"
                                style={{ position: 'absolute' }}
                                frameBorder="0"
                                className="giphy-embed"
                                allowFullScreen
                                title="Chemical Lab Animation"
                            ></iframe>
                            {/* Transparent overlay to block Giphy hover interactions */}
                            <div className="absolute inset-0 z-20 bg-transparent"></div>
                        </div>
                    </div>

                    <div className="relative z-10 text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            Chemical Equipments
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Parameter Visualizer
                        </p>
                    </div>
                </div>

                {/* Right Side - Form Content */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card">
                    <div className="max-w-md w-full mx-auto space-y-8">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                            <p className="text-muted-foreground">{subtitle}</p>
                        </div>

                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
