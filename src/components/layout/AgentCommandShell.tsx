"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Database, Activity, Settings, AlertTriangle, Menu, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AgentCommandShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Agent Registry', href: '/agents', icon: Database },
        { name: 'Live Transactions', href: '/transactions', icon: Activity },
        { name: 'Audit Trail', href: '/audit', icon: Shield },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-background text-foreground animate-in fade-in">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="">Arc Compliance</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span>Arc Mainnet: Connected</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground font-mono">
                        Block #12,938,432
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex flex-col w-full min-h-screen">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <Shield className="h-6 w-6" />
                                    <span>Arc Compliance</span>
                                </Link>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <span className="font-semibold text-sm">Agent Command Center</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
