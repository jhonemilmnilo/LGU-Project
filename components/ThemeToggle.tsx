"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-10 h-10 rounded-xl relative overflow-hidden transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/10 group"
        >
            <Sun className="h-5 w-5 text-slate-500 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 text-blue-400 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
