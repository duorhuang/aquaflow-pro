"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { Send, Target, MessageSquare } from "lucide-react";

export default function TargetedFeedbacksPage() {
    const { swimmers } = useStore();
    const [reminders, setReminders] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [targetIds, setTargetIds] = useState<string[]>([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const res = await api.feedbackReminders.getAll(true);
            setReminders(res);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleTarget = (id: string) => {
        if (targetIds.includes(id)) {
            setTargetIds(targetIds.filter(x => x !== id));
        } else {
            setTargetIds([...targetIds, id]);
        }
    };

    const handleSend = async () => {
        if (!message) return;
        try {
            await api.feedbackReminders.create({
                message,
                targetSwimmerIds: targetIds.length > 0 ? targetIds : null,
            });
            setMessage("");
            setTargetIds([]);
            load();
            alert("专项反馈要求已发出！");
        } catch (e) {
            console.error(e);
            alert("发送失败");
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">教练发起：专项反馈</h1>
                    <p className="text-sm text-muted-foreground">点名队员回答特定问题（可选特定队员或全队）</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-card/80 to-orange-900/10 border border-orange-500/20 p-6 rounded-2xl">
                <label className="text-sm font-bold text-white block mb-2">通知内容与问题</label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="例如：今天专项游大家的右臂入水姿势有改变吗？有没有感觉肩部不适？请在这里反馈..."
                    className="w-full h-24 bg-black/40 border border-border rounded-xl p-4 text-white resize-none mb-4 focus:ring-1 focus:ring-orange-500 outline-none"
                />

                <label className="text-sm font-bold text-white block mb-2">提问对象（至少选一个，或全不选代表全队）</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {swimmers.map(s => (
                        <button
                            key={s.id}
                            onClick={() => toggleTarget(s.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${targetIds.includes(s.id) ? 'bg-orange-500 text-white border-orange-500' : 'bg-transparent border-white/20 text-muted-foreground hover:bg-white/5'}`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={!message}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        发布通知
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">过往通知与回复</h2>
                {reminders.map(r => (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="mb-4">
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground mb-2 inline-block">目标: {r.targetSwimmerIds ? "指定队员" : "全队"}</span>
                            <p className="text-white font-medium">Q: {r.message}</p>
                        </div>
                        
                        <div className="space-y-3 border-t border-white/10 pt-3">
                            <h4 className="text-xs text-muted-foreground font-bold">队员回复 ({r.responses?.length || 0})</h4>
                            {r.responses?.map((resp: any) => (
                                <div key={resp.id} className="bg-black/30 p-3 rounded-lg flex items-start gap-3">
                                    <MessageSquare className="w-4 h-4 text-orange-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{resp.swimmer?.name || "未知"}</p>
                                        <p className="text-sm text-muted-foreground">{resp.content}</p>
                                    </div>
                                </div>
                            ))}
                            {r.responses?.length === 0 && <p className="text-xs text-muted-foreground italic">暂无回复</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
