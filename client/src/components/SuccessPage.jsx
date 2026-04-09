import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuccessPage() {
    const navigate = useNavigate();

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

            <div className="w-full max-w-md relative z-10 text-center">
                {/* Glow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-white mb-8">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Payment Confirmed</span>
                </div>

                <div className="mb-10 relative">
                    <div className="absolute inset-0 bg-green-500 blur-[80px] opacity-20 rounded-full"></div>
                    <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto relative z-10" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                    Payment Successful
                </h1>

                <p className="text-gray-500 font-medium text-lg mb-10 leading-relaxed">
                    Thank you for your purchase! Your account has been successfully upgraded. You can now access all premium features.
                </p>

                <button
                    onClick={() => navigate('/upload')}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-white/5 group"
                >
                    Go to Workspace
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
