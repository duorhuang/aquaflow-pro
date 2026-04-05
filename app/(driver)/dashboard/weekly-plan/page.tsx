"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { Save, Plus, Trash2, Image as ImageIcon, CheckCircle, Upload } from "lucide-react";

export default function WeeklyPlanPage() {
    const [weekStart, setWeekStart] = useState("");
    const [weekEnd, setWeekEnd] = useState("");
    const [group, setGroup] = useState("Advanced");
    const [title, setTitle] = useState("");
    const [coachNotes, setCoachNotes] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    
    const [saving, setSaving] = useState(false);
    const [loadedPlans, setLoadedPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Init dates
        const monday = new Date();
        const day = monday.getDay();
        const diffToMonday = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diffToMonday);
        setWeekStart(monday.toISOString().split('T')[0]);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setWeekEnd(sunday.toISOString().split('T')[0]);
        
        setTitle(`${monday.toISOString().split('T')[0]} 周训练`);
        
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const plans = await api.weeklyPlans.getAll();
            setLoadedPlans(plans);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSessions(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substring(7),
                        isNew: true,
                        label: "周一", 
                        date: weekStart, // Default to Monday of week
                        imageData: base64,
                        imageType: file.type,
                        notes: "",
                        sortOrder: prev.length
                    }
                ]);
            };
            if (file) reader.readAsDataURL(file);
        });
    };

    const handleSave = async (publish: boolean) => {
        setSaving(true);
        try {
            let planId = selectedPlanId;
            if (!planId) {
                const newPlan = await api.weeklyPlans.create({
                    weekStart,
                    weekEnd,
                    group,
                    title,
                    coachNotes,
                    isPublished: publish
                });
                planId = newPlan.id;
            } else {
                await api.weeklyPlans.update(planId, {
                    weekStart, weekEnd, group, title, coachNotes, isPublished: publish
                });
            }

            // Save sessions
            for (const s of sessions) {
                if (s.isNew) {
                    await api.weeklyPlans.addSession({
                        weeklyPlanId: planId,
                        label: s.label,
                        date: s.date,
                        imageData: s.imageData,
                        imageType: s.imageType,
                        notes: s.notes,
                        sortOrder: s.sortOrder
                    });
                } else if (s.isUpdated) {
                    await api.weeklyPlans.updateSession(s.id, s);
                }
            }
            
            alert(publish ? "计划已发布！" : "草稿已保存！");
            loadPlans();
            if (!selectedPlanId) setSelectedPlanId(planId);
        } catch (e) {
            console.error(e);
            alert("保存失败");
        } finally {
            setSaving(false);
        }
    };

    const removeSession = async (id: string, isNew: boolean) => {
        if (!isNew) {
            try {
                await api.weeklyPlans.deleteSession(id);
            } catch (e) {
                console.error(e);
            }
        }
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const selectPlan = async (id: string) => {
        const plan = await api.weeklyPlans.getById(id);
        setSelectedPlanId(plan.id);
        setWeekStart(plan.weekStart);
        setWeekEnd(plan.weekEnd);
        setGroup(plan.group);
        setTitle(plan.title || "");
        setCoachNotes(plan.coachNotes || "");
        setSessions(plan.sessions || []);
    };

    const createNew = () => {
        setSelectedPlanId(null);
        setSessions([]);
        setCoachNotes("");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">按周上传训练计划</h1>
                <button onClick={createNew} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80">
                    + 创建新计划
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* File/Folder settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card/40 border border-border rounded-xl p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">开始日期 (周一)</label>
                                <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">标题</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">教练本周寄语 (选填)</label>
                            <textarea value={coachNotes} onChange={e => setCoachNotes(e.target.value)} className="w-full h-20 bg-black/40 border border-border rounded-lg px-3 py-2 text-white resize-none" placeholder="这周大家好好练..." />
                        </div>
                    </div>

                    {/* Sessions inside the "Folder" */}
                    <div className="bg-gradient-to-br from-card/80 to-purple-900/10 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-purple-400" />
                            训练照片 (文件夹)
                        </h2>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.sortOrder - b.sortOrder).map((s) => {
                                const idx = sessions.findIndex(orig => orig.id === s.id);
                                return (
                                <div key={s.id} className="relative bg-black/40 border border-white/10 rounded-xl p-3 group">
                                    <button onClick={() => removeSession(s.id, s.isNew)} className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary flex items-center justify-center mb-3">
                                        {s.imageData ? <img src={s.imageData} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-50" />}
                                    </div>
                                    <div className="space-y-2">
                                        <input 
                                            type="text" value={s.label} placeholder="如：周六上午"
                                            onChange={e => {
                                                const newS = [...sessions];
                                                newS[idx] = { ...newS[idx], label: e.target.value, isUpdated: true };
                                                setSessions(newS);
                                            }}
                                            className="w-full bg-transparent border-b border-white/20 px-1 py-1 text-sm text-white focus:border-purple-400 outline-none" 
                                        />
                                        <input 
                                            type="date" value={s.date}
                                            onChange={e => {
                                                const newS = [...sessions];
                                                newS[idx] = { ...newS[idx], date: e.target.value, isUpdated: true };
                                                setSessions(newS);
                                            }}
                                            className="w-full bg-secondary/50 rounded px-2 py-1 text-xs text-white outline-none" 
                                        />
                                    </div>
                                </div>
                            )})}

                            {/* Add More Button */}
                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 hover:bg-white/5 hover:border-purple-500/50 transition-all text-muted-foreground hover:text-white">
                                <Plus className="w-8 h-8 mb-2" />
                                <span>批量上传照片</span>
                            </button>
                        </div>

                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> 保存草稿
                        </button>
                        <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> 发布给队员
                        </button>
                    </div>
                </div>

                {/* Sidebar - History */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-white">已有周计划</h3>
                    <div className="space-y-3">
                        {loadedPlans.map(p => (
                            <div key={p.id} onClick={() => selectPlan(p.id)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPlanId === p.id ? 'bg-purple-500/20 border-purple-500/50' : 'bg-card/40 border-border hover:border-white/20'}`}>
                                <h4 className="font-bold text-white text-sm">{p.title || `${p.weekStart}周`}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">{p.sessions?.length || 0} 图</span>
                                    {p.isPublished && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full">已发布</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
