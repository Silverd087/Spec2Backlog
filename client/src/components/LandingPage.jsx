import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, LogOut, MousePointer2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPricingTiers } from '../services/api';
import { useState, useEffect } from 'react';
import { createCheckoutSession } from '../services/api';
import { isAuthenticated, logout } from '../services/auth';

export default function LandingPage() {
    const navigate = useNavigate();
    const [pricingTiers, setPricingTiers] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchTiers = async () => {
            const tiers = await getPricingTiers()
            setPricingTiers(tiers)
        }
        const checkAuth = async () => {
            const authStatus = await isAuthenticated();
            setIsLoggedIn(authStatus);
        }
        fetchTiers()
        checkAuth();
    }, [])

    const handleLogout = async () => {
        await logout();
        setIsLoggedIn(false);
    };

    const handleCheckout = async (p) => {
        console.log(isLoggedIn)
        if (!isLoggedIn) {
            navigate('/auth');
            return;
        }

        if (p.name === 'Enterprise') {
            // Enterprise logic could go here, for now just redirect to auth or stayed as contact us
            return;
        }

        try {
            window.location.href = await createCheckoutSession(p.name);
        } catch (error) {
            console.error("Checkout error:", error);
        }
    }

    return (
        <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-white/20 relative overflow-hidden">

            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}></div>
                <div className="absolute inset-0 bg-linear-to-b from-[#00000000] via-[#000000] to-[#000000]"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-center px-8 py-6">
                <div className="flex items-center gap-4" >
                    <button
                        onClick={() => navigate(isLoggedIn ? '/upload' : '/auth')}
                        className="bg-[#ffffff] text-[#000000] px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                    >
                        {isLoggedIn ? 'Go to Workspace' : 'Get Started'}
                    </button>
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 text-gray-400 px-5 py-2 rounded-lg text-sm font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    )}
                </div>
            </nav>

            {/* Side Navigation Indicators (Visual only) */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex">
                <button className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center hover:bg-[#1a1a1a] transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
            </div>
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex">
                <button className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center hover:bg-[#1a1a1a] transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Hero Section */}
            <header className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center">

                {/* Glow Badge */}
                <div className="relative mb-12 group cursor-default">
                    <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative px-5 py-2 bg-[#000000] border border-white/10 rounded-full flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold tracking-widest uppercase text-white">Spec2Backlog UI</span>
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.05] max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Build Exceptional <br />
                    <span className="inline-block">Interfaces with Ease</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed animate-in fade-in duration-1000 delay-200">
                    Use our AI engine powered by the latest LLMs to craft <br className="hidden md:block" />
                    beautiful, fast, and actionable product backlogs seamlessly.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-1000 delay-300">
                    <button
                        onClick={() => navigate(isLoggedIn ? '/upload' : '/auth')}
                        className="w-full sm:w-auto bg-[#ffffff] text-[#000000] px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
                    >
                        {isLoggedIn ? 'Go to Workspace' : 'Get Started'}
                    </button>
                    <button className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-bold border border-white/10 hover:bg-white/5 transition-all text-white flex items-center gap-3 group">
                        Browse Examples
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </header>

            {/* Features Overview */}
            <section className="relative z-10 bg-[#050505] border-y border-white/5 py-32 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
                    {[
                        { title: "AI Precision", icon: <MousePointer2 className="w-6 h-6" />, desc: "Context-aware story generation that understands complex technical constraints." },
                        { title: "Rapid Iteration", icon: <Sparkles className="w-6 h-6" />, desc: "Transform sprawling documents into structured backlog items in under 60 seconds." },
                        { title: "Universal Export", icon: <Check className="w-6 h-6" />, desc: "Seamlessly integrate with JIRA, Linear, and Trello with native bulk exports." }
                    ].map((f, i) => (
                        <div key={i} className="group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-white/10 transition-all group-hover:-translate-y-1">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 pt-40 pb-56 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-gray-500 font-medium">Choose a plan that scales with your ambition.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 w-full">
                        {Array.isArray(pricingTiers) && pricingTiers.map((p, i) => (
                            <div
                                key={p.name}
                                className={`p-1 bg-[#000000] rounded-3xl border ${p.highlighted ? 'border-white/20' : 'border-white/5'} hover:border-white/20 transition-all duration-500 group relative`}
                            >
                                {p.highlighted && (
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                        <div className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                            Professional
                                        </div>
                                    </div>
                                )}
                                <div className="p-8 h-full bg-[#050505] rounded-[1.4rem] flex flex-col">
                                    <div className="mb-8">
                                        <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">{p.name}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold">{p.price}</span>
                                            {p.price !== 'Custom' && <span className="text-gray-500 text-lg">/mo</span>}
                                        </div>
                                        <p className="mt-4 text-gray-500 font-medium text-sm leading-relaxed">{p.description}</p>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-12">
                                        {p.features.map((feat, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                                <span className="text-sm font-medium text-gray-400">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={() => handleCheckout(p)} className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 text-sm ${p.highlighted
                                        ? 'bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5'
                                        : 'bg-[#111111] text-white border border-white/10 hover:bg-[#1a1a1a]'
                                        }`}>
                                        {p.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-20 px-8 bg-[#000000]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="text-xl font-black tracking-tighter">Spec2Backlog</h3>
                        <p className="text-gray-500 text-sm font-medium">Crafting the future of product development.</p>
                    </div>
                    <div className="flex gap-12 text-gray-500 text-sm font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
