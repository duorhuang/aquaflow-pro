"use client";

import { useState, useEffect } from "react";
import { Swimmer, GroupLevel } from "@/types";
import { X, Save, UserPlus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";

interface SwimmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    swimmerToEdit?: Swimmer | null; // If null, we are adding new
}

const GROUP_LABELS: Record<GroupLevel, string> = {
    "Junior": "初级组",
    "Intermediate": "中级组",
    "Advanced": "高级组"
};

export function SwimmerModal({ isOpen, onClose, swimmerToEdit }: SwimmerModalProps) {
    const { addSwimmer, updateSwimmer, deleteSwimmer } = useStore();

    // Form State
    const [name, setName] = useState("");
    const [group, setGroup] = useState<GroupLevel>("Junior");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Load data if editing
    useEffect(() => {
        if (swimmerToEdit) {
            setName(swimmerToEdit.name);
            setGroup(swimmerToEdit.group);
            setUsername(swimmerToEdit.username || "");
            setPassword(swimmerToEdit.password || "");
        } else {
            // Reset for new
            const randomUser = `swimmer${Math.floor(Math.random() * 1000)}`;
            setName("");
            setGroup("Junior");
            setUsername(randomUser);
            setPassword("123456");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [swimmerToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (swimmerToEdit) {
            // Update
            updateSwimmer(swimmerToEdit.id, {
                name,
                group,
                username,
                password
            });
        } else {
            // Create
            const newSwimmer: Swimmer = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                group,
                username,
                password,
                status: "Active",
                readiness: 100,
                xp: 0,
                level: 1,
                currentStreak: 0,
                lastCheckIn: undefined
            };
            addSwimmer(newSwimmer);
        }
        onClose();
    };

    const handleDelete = () => {
        if (swimmerToEdit && confirm(`确定要删除队员 ${swimmerToEdit.name} 吗？`)) {
            deleteSwimmer(swimmerToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {swimmerToEdit ? "编辑队员" : "添加队员"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">姓名</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary/50 border border-transparent focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-all"
                            placeholder="例如：张三"
                        />
                    </div>

                    {/* Group Selection */}
                    <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">训练组别</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["Junior", "Intermediate", "Advanced"] as GroupLevel[]).map((lvl) => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setGroup(lvl)}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${group === lvl
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50"
                                        }`}
                                >
                                    {GROUP_LABELS[lvl]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">用户名</label>
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-secondary/50 border border-transparent focus:border-primary rounded-lg px-4 py-2 text-sm text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">密码</label>
                            <input
                                required
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/50 border border-transparent focus:border-primary rounded-lg px-4 py-2 text-sm text-white outline-none font-mono"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        {swimmerToEdit && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-3 rounded-xl font-bold transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-primary-foreground hover:brightness-110 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                        >
                            {swimmerToEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            {swimmerToEdit ? "保存修改" : "添加队员"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
