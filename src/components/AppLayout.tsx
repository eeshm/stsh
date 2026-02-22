import type React from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen h-screen bg-white sm:bg-[#f0efeb] flex flex-col overflow-hidden">
            <div className="max-w-[1500px] mx-auto w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    )
}


export function Main({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 pb-0 sm:pb-2">
            <div className="mx-auto w-full h-full px-0 sm:px-1 flex flex-col min-h-0">
                <div className="bg-white sm:bg-[#14120b] sm:rounded-xl flex-1 py-3 sm:py-3 px-3 sm:px-3 overflow-auto border-0 scrollbar-hide">
                    {children}
                </div>
            </div>
        </main>
    )
}