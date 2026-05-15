"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/common/Toast";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isEmpty, setIsEmpty] = useState(!value || value === "<br>" || value === "<div><br></div>");
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    // Save selection range before toolbar interaction steals focus
    const savedRange = useRef<Range | null>(null);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRange.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (savedRange.current && editorRef.current?.contains(savedRange.current.startContainer)) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(savedRange.current);
        }
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]); // Sync when value changes externally (e.g. selectPlan)

    const exec = useCallback((command: string, value?: string) => {
        restoreSelection();
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        requestAnimationFrame(() => {
            if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
                setIsEmpty(!editorRef.current.textContent?.trim());
            }
        });
    }, [onChange]);

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const result = await api.upload.file(file);
            exec("insertImage", result.url);
        } catch (e) {
            console.error("Upload failed:", e);
            toast("error", "图片上传失败");
        } finally {
            setUploading(false);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
            setIsEmpty(!editorRef.current.textContent?.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab") {
            e.preventDefault();
            exec("insertText", "    ");
        }
    };

    const insertLink = () => {
        const url = prompt("输入链接地址:");
        if (url) exec("createLink", url);
    };

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-black/20 border-b border-white/10">
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("bold")} title="粗体">
                    <Bold className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("italic")} title="斜体">
                    <Italic className="w-3.5 h-3.5" />
                </ToolbarButton>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("insertUnorderedList")} title="无序列表">
                    <List className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("insertOrderedList")} title="有序列表">
                    <ListOrdered className="w-3.5 h-3.5" />
                </ToolbarButton>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <ToolbarButton onMouseDown={saveSelection} onClick={insertLink} title="插入链接">
                    <Link2 className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onMouseDown={saveSelection} onClick={() => imageInputRef.current?.click()} title="插入图片" disabled={uploading}>
                    <ImageIcon className="w-3.5 h-3.5" />
                </ToolbarButton>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("undo")} title="撤销">
                    <Undo className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onMouseDown={saveSelection} onClick={() => exec("redo")} title="重做">
                    <Redo className="w-3.5 h-3.5" />
                </ToolbarButton>
            </div>

            {/* Editor */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "min-h-[120px] px-3 py-2 text-sm text-white outline-none",
                        "prose-sm prose-invert max-w-none",
                        "[&>img]:max-w-full [&>img]:rounded-lg [&>img]:my-2",
                        "[&>a]:text-blue-400 [&>a]:underline [&>a:hover]:text-blue-300",
                        "[&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5",
                    )}
                />
                {!isFocused && isEmpty && placeholder && (
                    <div className="absolute top-2 left-3 text-muted-foreground/50 text-sm pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

function ToolbarButton({ onClick, onMouseDown, children, title, disabled }: {
    onClick: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onMouseDown={e => {
                e.preventDefault(); // Prevent focus loss from editor
                onMouseDown?.(e);
            }}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    );
}
