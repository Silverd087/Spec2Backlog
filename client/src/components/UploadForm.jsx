import { Paperclip, ArrowRight, X, FileText, Sparkles, Upload, LogOut, Clock, ChevronRight, History, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { getProjects, getProjectById } from '../services/api';

export default function UploadForm({ onGenerate, setBacklog }) {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setIsLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    const handleProjectClick = async (projectId) => {
        try {
            const project = await getProjectById(projectId);
            setBacklog(project.backlog);
            navigate('/backlog');
        } catch (error) {
            console.error("Failed to fetch project details:", error);
            alert("Could not load project details.");
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleAddFiles(Array.from(e.target.files));
        }
    }

    const handleAddFiles = (newFiles) => {
        const attachedFiles = newFiles.map((file) => {
            const attached = { file: file };
            if (file.type.startsWith('image/')) {
                attached.preview = URL.createObjectURL(file);
            }
            return attached;
        });
        setFiles((prev) => [...prev, ...attachedFiles]);
    }

    const handleRemoveFile = (index) => {
        const newFiles = [...files];
        if (newFiles[index].preview) {
            URL.revokeObjectURL(newFiles[index].preview);
        }
        newFiles.splice(index, 1);
        setFiles(newFiles);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleAddFiles(Array.from(e.dataTransfer.files));
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setBacklog(null);
        onGenerate({ files, text });
        navigate('/backlog');
    }

    return (
        <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-white/20 relative overflow-hidden flex">

            {/* Sidebar */}
            <aside className="w-80 bg-[#050505] border-r border-white/5 flex flex-col relative z-20 shrink-0">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold tracking-tight">Recent Projects</h2>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Your AI History</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoadingProjects ? (
                        <div className="flex flex-col gap-4 p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm text-gray-600 font-medium">No projects yet</p>
                        </div>
                    ) : (
                        projects.map((proj) => (
                            <button
                                key={proj.id}
                                onClick={() => handleProjectClick(proj.id)}
                                className="w-full text-left p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 hover:bg-[#111111] transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <h3 className="text-sm font-bold truncate mb-1 group-hover:text-white transition-colors">{proj.title || "Untitled Project"}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                                        <Clock className="w-3 h-3" />
                                        {new Date(proj.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-white/5 space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white/5 text-gray-400 px-4 py-3 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </button>
                    <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full bg-white/5 text-red-400/80 px-4 py-3 rounded-xl text-sm font-bold border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto px-8 py-12 flex items-start justify-center">
                {/* Dot Grid Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}></div>
                    <div className="absolute inset-0 bg-linear-gradient-to-b from-[#00000000] via-[#000000] to-[#000000]"></div>
                </div>

                <div className="w-full max-w-4xl relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-white mb-6">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>AI Workspace</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tighter mb-4">
                            Build Your Backlog
                        </h1>
                        <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                            Input your product specifications as text or upload files. <br className="hidden md:block" />
                            Our AI will transform them into structured backlog items.
                        </p>
                    </div>

                    {/* Main Action Area */}
                    <div
                        className={`bg-[#050505] rounded-[2.5rem] border ${isDragging ? 'border-white/40 ring-4 ring-white/5' : 'border-white/10'} p-3 transition-all duration-300 shadow-2xl backdrop-blur-xl group`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="relative">
                            {/* File Previews Inline */}
                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-4 bg-[#0a0a0a] rounded-4xl border border-white/5 mb-2 max-h-[160px] overflow-y-auto">
                                    {files.map((f, i) => (
                                        <div key={i} className="relative group/file flex items-center gap-3 bg-[#111111] rounded-2xl px-4 py-2.5 pr-10 border border-white/5 hover:border-white/10 transition-all">
                                            {f.preview ? (
                                                <img src={f.preview} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold truncate max-w-[100px]">{f.file?.name}</span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase">{formatFileSize(f.file?.size)}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(i)}
                                                className="absolute right-2 p-1.5 rounded-full hover:bg-white/5 text-gray-600 hover:text-white transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                onChange={(e) => setText(e.target.value)}
                                value={text}
                                placeholder="Enter your product spec here or drag and drop files..."
                                className="w-full min-h-[300px] px-10 py-10 bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-xl leading-relaxed"
                            />

                            {/* Control Bar */}
                            <div className="flex justify-between items-center p-6 bg-[#0a0a0a] rounded-4xl border border-white/5 m-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-6 py-3 bg-[#111111] text-gray-400 font-bold text-sm rounded-xl border border-white/5 hover:bg-[#1a1a1a] hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        Attach Files
                                    </button>
                                    <input className="hidden" type="file" ref={fileInputRef} multiple onChange={handleFileSelect} />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="px-8 py-3 bg-white text-black font-black text-sm rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center gap-3 shadow-xl shadow-white/5 group"
                                >
                                    Generate Backlog
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Drop Info */}
                    <div className="mt-8 flex justify-center gap-12 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Supports PDF, TXT, DOCX</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">AI Reasoning Enabled</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
