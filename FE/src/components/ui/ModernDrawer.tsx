import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModernDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    position?: 'right' | 'left' | 'bottom';
    width?: string;
}

export function ModernDrawer({ isOpen, onClose, title, children, position = 'right', width = 'w-full sm:w-[500px] md:w-[600px] lg:w-[800px]' }: ModernDrawerProps) {
    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Position classes
    let translationClass = '';
    let positionClasses = '';

    if (position === 'right') {
        translationClass = isOpen ? 'translate-x-0' : 'translate-x-full';
        positionClasses = `inset-y-0 right-0 ${width}`;
    } else if (position === 'left') {
        translationClass = isOpen ? 'translate-x-0' : '-translate-x-full';
        positionClasses = `inset-y-0 left-0 ${width}`;
    } else {
        // bottom
        translationClass = isOpen ? 'translate-y-0' : 'translate-y-full';
        positionClasses = `inset-x-0 bottom-0 h-[80vh]`;
    }

    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed z-[110] bg-card border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${positionClasses} ${translationClass}`}
                style={{ borderLeftWidth: position === 'right' ? '1px' : '0', borderRightWidth: position === 'left' ? '1px' : '0', borderTopWidth: position === 'bottom' ? '1px' : '0' }}
            >
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
