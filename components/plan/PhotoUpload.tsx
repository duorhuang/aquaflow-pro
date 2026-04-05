"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Loader2, FileUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
    onFileSelect?: (file: File | null) => void;
    className?: string;
    maxSizeMB?: number;
    label?: string;
    description?: string;
}

export function PhotoUpload({
    onFileSelect,
    className,
    maxSizeMB = 10,
    label = "上传计划照片",
    description = "支持 JPG, PNG 格式，最大 10MB"
}: PhotoUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        // Check file type
        if (!file.type.startsWith("image/")) {
            setError("请选择有效的图片文件 (JPG, PNG等)");
            return;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`文件大小不能超过 ${maxSizeMB}MB`);
            return;
        }

        setSelectedFile(file);
        onFileSelect?.(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [maxSizeMB, onFileSelect]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        onFileSelect?.(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={cn("w-full", className)}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/*"
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {!previewUrl ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
                            "flex flex-col items-center justify-center p-8 min-h-[220px]",
                            isDragging 
                                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(100,255,218,0.15)]" 
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
                            error && "border-red-500/50 bg-red-500/5"
                        )}
                    >
                        <div className="relative mb-4">
                            <motion.div
                                animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className={cn(
                                    "p-4 rounded-full transition-colors",
                                    isDragging ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                                )}
                            >
                                <Upload className="w-8 h-8" />
                            </motion.div>
                            
                            {/* Decorative particles */}
                            {isDragging && (
                                <motion.div 
                                    className="absolute inset-0 -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-primary rounded-full"
                                            animate={{
                                                x: [0, (i % 2 === 0 ? 1 : -1) * 40],
                                                y: [0, (i < 3 ? 1 : -1) * 40],
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.5, 0]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                {label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isDragging ? "松手即可上传" : "点击或拖拽文件到这里"}
                            </p>
                        </div>

                        {error ? (
                            <p className="mt-4 text-xs font-medium text-red-400 flex items-center gap-1">
                                <X className="w-3 h-3" /> {error}
                            </p>
                        ) : (
                            <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold group-hover:text-muted-foreground transition-colors">
                                {description}
                            </p>
                        )}

                        {/* Glass edge highlight */}
                        <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-video max-h-[400px]"
                    >
                        {/* Image Preview */}
                        <img 
                            src={previewUrl} 
                            alt="Selected plan" 
                            className="w-full h-full object-contain"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* File Info & Controls */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-auto shadow-xl"
                            >
                                <div className="bg-primary/20 p-1 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-white truncate max-w-[150px]">
                                    {selectedFile?.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </motion.div>

                            <motion.button
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                onClick={removeFile}
                                className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white p-2 rounded-full pointer-events-auto transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Change button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full font-bold text-sm pointer-events-auto transition-all flex items-center gap-2 shadow-2xl"
                            >
                                <FileUp className="w-4 h-4" />
                                更换照片
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
