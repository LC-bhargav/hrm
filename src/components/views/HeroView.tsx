"use client";
import React from "react";
import { ShaderAnimation } from "@/components/ui/ShaderAnimation";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard } from "lucide-react";

interface HeroViewProps {
    onStart: () => void;
}

export const HeroView = ({ onStart }: HeroViewProps) => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 bg-transparent backdrop-blur-[2px]">
                <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                    <LayoutDashboard className="text-white" />
                    OfficeFlow
                </div>
                <Button
                    onClick={onStart}
                    className="text-white border border-white/20 hover:bg-white/10 transition-all rounded-full px-6 bg-transparent"
                >
                    Sign In
                </Button>
            </nav>

            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <ShaderAnimation />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <h1 className="text-5xl md:text-8xl font-bold text-center text-white mb-6 pointer-events-auto drop-shadow-2xl tracking-tighter">
                    OfficeFlow
                </h1>
                <p className="text-lg md:text-2xl text-slate-200 max-w-2xl text-center px-4 mb-12 pointer-events-auto drop-shadow-lg font-light">
                    Streamline your workforce management with our advanced, AI-powered platform.
                </p>
                <div className="pointer-events-auto">
                    {/* Button removed as per request */}
                </div>
            </div>
        </div>
    );
};
