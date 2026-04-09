import { Download, CheckCircle, Layers, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BacklogDisplay({ backlog, onExport, setBacklog }) {
    const navigate = useNavigate();

    if (!backlog) {
        return (
            <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-white/20 relative overflow-hidden flex flex-col items-center justify-center p-4">
                {/* Dot Grid Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}></div>
                    <div className="absolute inset-0 bg-linear-gradient-to-b from-[#00000000] via-[#000000] to-[#000000]"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <Loader2 className="w-20 h-20 text-white animate-spin relative z-10" />
                    </div>
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-bold tracking-tighter">Crafting your Backlog</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium">
                            Analyzing your specifications and generating professional user stories with AI precision...
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    const handleReturn = () => {
        setBacklog(null)
        navigate('/upload')
    }
    const { epics, project_name } = backlog;

    return (
        <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-white/20 relative overflow-hidden p-6 pb-20">

            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}></div>
                <div className="absolute inset-0 bg-linear-gradient-to-b from-[#00000000] via-[#000000] to-[#000000]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#050505] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleReturn}
                            className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Backlog Manifest</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter">{project_name || 'Product Backlog'}</h2>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{epics.length} Strategic Epics</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onExport(backlog)}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] font-black text-sm shadow-xl shadow-white/5"
                    >
                        <Download className="w-5 h-5" />
                        Export Manifest (CSV)
                    </button>
                </div>

                {/* Epics Architecture */}
                <div className="space-y-12">
                    {epics.map((epic, index) => (
                        <div key={index} className="space-y-6">
                            {/* Epic Title Divider */}
                            <div className="flex items-center gap-6 px-4">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <Layers className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold tracking-tight">{epic.title}</h3>
                                    <p className="text-gray-500 font-medium">{epic.description}</p>
                                </div>
                                <div className="hidden md:block flex-1 h-px bg-white/5"></div>
                            </div>

                            {/* Stories Grid */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {epic.stories?.map((story, sIndex) => (
                                    <div key={sIndex} className="bg-[#050505] rounded-4xl border border-white/5 hover:border-white/20 transition-all p-8 flex flex-col group relative overflow-hidden">
                                        {/* Content Wrapper */}
                                        <div className="relative z-10 flex flex-col h-full">
                                            {/* Top Metadata */}
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {story.story_points} Pts
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${story.priority === 'Must' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        story.priority === 'Should' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {story.priority}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-700 tracking-[0.2em] uppercase">User Story {index + 1}.{sIndex + 1}</span>
                                            </div>

                                            {/* Story Text */}
                                            <h4 className="text-lg font-bold mb-4 group-hover:text-purple-400 transition-colors">{story.title}</h4>

                                            <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 mb-6 flex-1">
                                                <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
                                                    "{story.user_story}"
                                                </p>
                                            </div>

                                            {/* Acceptance Criteria */}
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                    Success Criteria
                                                </h5>
                                                <ul className="grid gap-2">
                                                    {story.acceptance_criteria?.map((ac, acIndex) => (
                                                        <li key={acIndex} className="flex items-start gap-4 p-3 bg-[#0a0a0a]/50 rounded-xl border border-white/5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1.5 shrink-0" />
                                                            <span className="text-xs font-medium text-gray-300 leading-relaxed">{ac}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Hover Gradient Overlay */}
                                        <div className="absolute inset-0 bg-linear-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}