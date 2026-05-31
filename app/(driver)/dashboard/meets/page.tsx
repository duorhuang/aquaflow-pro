"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Calendar, MapPin, Trophy, Plus, Trash2, Edit2, ArrowLeft, Check, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/common/Toast";

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
            <Link href="/dashboard" className="hover:text-white transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white font-medium">{t.common.meets}</span>
        </nav>
    );
}

import { Meet } from "@/types";

export default function CoachMeetsPage() {
    const { toast } = useToast();
    const [meets, setMeets] = useState<Meet[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingMeet, setDeletingMeet] = useState<string | null>(null);
    const [togglingMeet, setTogglingMeet] = useState<string | null>(null);
    
    // Stable timestamp for pure renders (React 19 / purity rule)
    const [now] = useState(() => Date.now());
    
    // Modal & Form State
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMeet, setEditingMeet] = useState<Meet | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        time: "",
        location: "",
        description: "",
        isActive: true,
    });
    
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Load meets
    const loadMeets = async () => {
        setLoading(true);
        try {
            const data = await api.meets.getAll();
            if (data && Array.isArray(data)) {
                setMeets(data);
            } else if (data && (data as any).meets) {
                setMeets((data as any).meets);
            }
        } catch (e) {
            console.error("Failed to fetch meets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeets();
    }, []);

    const openCreateModal = () => {
        setEditingMeet(null);
        setFormData({
            name: "",
            date: "",
            time: "",
            location: "",
            description: "",
            isActive: true,
        });
        setErrorMsg("");
        setShowFormModal(true);
    };

    const openEditModal = (meet: Meet) => {
        setEditingMeet(meet);
        setFormData({
            name: meet.name,
            date: meet.date,
            time: meet.time || "",
            location: meet.location || "",
            description: meet.description || "",
            isActive: meet.isActive,
        });
        setErrorMsg("");
        setShowFormModal(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.date) {
            setErrorMsg("赛事名称和日期为必填项！");
            return;
        }

        setSaving(true);
        setErrorMsg("");
        
        try {
            if (editingMeet) {
                // Update
                await api.meets.update(editingMeet.id, formData);
                showNotification("赛事更新成功！");
            } else {
                // Create
                await api.meets.create(formData);
                showNotification("赛事发布成功！队员动态已同步！");
            }
            setShowFormModal(false);
            loadMeets();
        } catch (e) {
            setErrorMsg((e as Error).message || "保存赛事失败");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("确定要删除这场赛事吗？此操作不可撤销，且会清除队员倒计时。")) return;

        setDeletingMeet(id);
        try {
            await api.meets.delete(id);
            showNotification("赛事删除成功！");
            loadMeets();
        } catch (e) {
            toast("error", (e as Error).message || "删除赛事失败");
        } finally {
            setDeletingMeet(null);
        }
    };

    const toggleMeetActive = async (meet: Meet) => {
        setTogglingMeet(meet.id);
        try {
            await api.meets.update(meet.id, { isActive: !meet.isActive });
            showNotification(meet.isActive ? "赛事倒计时已暂停" : "赛事倒计时已激活！");
            loadMeets();
        } catch (e) {
            toast("error", (e as Error).message || "切换状态失败");
        } finally {
            setTogglingMeet(null);
        }
    };

    const showNotification = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3500);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <Breadcrumb />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-white/5 transition-colors"
                            aria-label="返回仪表盘"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                赛事管理与倒计时
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">规划泳队比赛日程，发布后将自动为所有队员推送金牌倒计时并激活暗金备战模式。</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={openCreateModal}
                        className="px-5 py-3 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(100,255,218,0.25)]"
                    >
                        <Plus className="w-5 h-5" />
                        发布新赛事
                    </button>
                </div>

                {/* Notifications */}
                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">{successMsg}</span>
                    </div>
                )}

                {/* Meet Cards Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-mono">加载赛事数据...</p>
                    </div>
                ) : meets.length === 0 ? (
                    <div className="text-center py-24 bg-card/30 border border-border border-dashed rounded-3xl">
                        <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">暂无赛事发布</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            点击右上角 + 号发布新赛事
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {meets.map((meet) => {
                            const meetDate = new Date(`${meet.date}T${meet.time || '00:00'}:00`);
                            const isUpcoming = meetDate.getTime() > now;
                            const daysDiff = Math.ceil((meetDate.getTime() - now) / (1000 * 60 * 60 * 24));
                            const isNear = isUpcoming && daysDiff <= 7;

                            return (
                                <div
                                    key={meet.id}
                                    className={cn(
                                        "glass-panel border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between",
                                        meet.isActive && isNear
                                            ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-600/5 to-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                            : meet.isActive
                                            ? "border-white/5 bg-slate-900/40"
                                            : "border-white/5 bg-slate-950/20 opacity-60"
                                    )}
                                >
                                    <div>
                                        {/* Status badges */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span
                                                className={cn(
                                                    "text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border",
                                                    meet.isActive && isNear
                                                        ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 font-sans"
                                                        : isUpcoming
                                                        ? "bg-primary/10 border-primary/20 text-primary"
                                                        : "bg-slate-500/10 border-slate-500/20 text-muted-foreground"
                                                )}
                                            >
                                                {meet.isActive && isNear ? "🔥 黄金备战中" : isUpcoming ? "⏳ 即将来临" : "🏁 已结束"}
                                            </span>
                                            
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => toggleMeetActive(meet)}
                                                    disabled={togglingMeet === meet.id}
                                                    className={cn(
                                                        "text-xs px-2.5 py-1 rounded-full font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed",
                                                        meet.isActive
                                                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                                                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                    )}
                                                >
                                                    {togglingMeet === meet.id ? (
                                                        <span className="flex items-center gap-1">
                                                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                            处理中...
                                                        </span>
                                                    ) : meet.isActive ? "已激活倒计时" : "倒计时已暂停"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className={cn("text-lg font-bold line-clamp-1", meet.isActive && isNear ? "text-yellow-400" : "text-white")}>
                                            {meet.name}
                                        </h3>
                                        
                                        {/* Info lines */}
                                        <div className="space-y-1.5 mt-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                                                <span>{meet.date} {meet.time || ""}</span>
                                            </div>
                                            {meet.location && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                                    <span>{meet.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {meet.description && (
                                            <p className="text-xs text-muted-foreground/80 mt-3 p-3 bg-white/5 rounded-2xl border border-white/5 line-clamp-2">
                                                {meet.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between border-t border-white/5 mt-6 pt-4">
                                        {isUpcoming && meet.isActive ? (
                                            <span className="text-xs font-mono text-muted-foreground">
                                                还有 <strong className="text-white font-bold">{daysDiff}</strong> 天比赛
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">倒计时休眠中</span>
                                        )}
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(meet)}
                                                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-muted-foreground hover:text-white"
                                                title="编辑赛事"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(meet.id)}
                                                disabled={deletingMeet === meet.id}
                                                className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="删除赛事"
                                            >
                                                {deletingMeet === meet.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Form Modal */}
                {showFormModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/20">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                    {editingMeet ? "编辑赛事内容" : "发布新赛事预告"}
                                </h3>
                                <button
                                    onClick={() => setShowFormModal(false)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                {errorMsg && (
                                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{errorMsg}</p>
                                )}

                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">赛事名称 *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="例如: 2026年夏季全市青少年游泳锦标赛"
                                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">比赛日期 *</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">比赛时间 (选填)</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">地点 (选填)</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="例如: 市奥林匹克游泳馆"
                                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">备注说明 / 项目说明 (选填)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="例如: 报名资格、参赛费、或者本次主攻 50自/100蛙..."
                                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[90px] resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActiveCheckbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 text-primary bg-secondary/50 focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="isActiveCheckbox" className="text-xs text-muted-foreground cursor-pointer select-none">
                                        激活备战状态 (非激活的赛事仅作日程记录，不计算倒计时)
                                    </label>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 border-t border-white/5 pt-5 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-transparent text-xs text-white hover:bg-white/10"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                                    >
                                        {saving && <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
                                        {editingMeet ? "保存修改" : "立即发布"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
}
