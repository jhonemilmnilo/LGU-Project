import { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Search, UserCheck } from "lucide-react";
import { ResidentContext } from "../providers/ResidentProvider";

// I'll create a search action in app/admin/actions.ts later
import { searchHeads } from "../../actions";

type SearchResult = {
    id: string;
    firstName: string;
    lastName: string;
    barangay: string;
};

export function HeadSearch({ onSelect, defaultValue }: { onSelect: (id: string, name: string) => void, defaultValue?: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedName, setSelectedName] = useState(defaultValue || "");
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const context = useContext(ResidentContext);
    const [themeColor, setThemeColor] = useState(context?.themeColor || "#2563eb");

    useEffect(() => {
        if (context?.themeColor) {
            setThemeColor(context.themeColor);
        } else {
            // Fetch dynamically when used outside the ResidentProvider
            import("@/app/admin/transactions/actions").then(({ getSystemSettingAction }) => {
                getSystemSettingAction("theme_color", "#2563eb").then(res => {
                    if (res?.success && res?.data) {
                        setThemeColor(res.data);
                    }
                });
            });
        }
    }, [context?.themeColor]);

    const [prevDefault, setPrevDefault] = useState(defaultValue);
    if (defaultValue !== prevDefault) {
        setPrevDefault(defaultValue);
        setSelectedName(defaultValue || "");
    }

    useEffect(() => {
        if (query.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                const res = await searchHeads(query);
                if (res.success && res.data) {
                    setResults(res.data as SearchResult[]);
                } else {
                    setResults([]);
                }
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            const timer = setTimeout(() => {
                setResults(prev => prev.length > 0 ? [] : prev);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [query]);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder={selectedName || "Search by name..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            {results.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#2a3040] rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {results.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                                onSelect(r.id, `${r.firstName} ${r.lastName}`);
                                setSelectedName(`${r.firstName} ${r.lastName}`);
                                setQuery("");
                                setResults([]);
                            }}
                            onMouseEnter={() => setHoveredId(r.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ 
                                backgroundColor: hoveredId === r.id ? `${themeColor}1a` : undefined 
                            }}
                            className="w-full text-left px-4 py-3 flex items-center gap-2 border-b border-slate-100 dark:border-[#2a3040] last:border-0 transition-colors"
                        >
                            <UserCheck className="w-4 h-4" style={{ color: themeColor }} />
                            <div>
                                <p className="text-sm font-bold">{r.firstName} {r.lastName}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{r.barangay}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
