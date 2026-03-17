import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { searchResidents } from "../../actions";

type SearchResult = {
    id: string;
    firstName: string;
    lastName: string;
    barangay: string;
    age?: number | null;
};

interface ResidentSearchProps {
    onSelect: (resident: SearchResult) => void;
    placeholder?: string;
    excludeIds?: string[];
}

export function ResidentSearch({ onSelect, placeholder = "Search resident...", excludeIds = [] }: ResidentSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        if (query.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                const res = await searchResidents(query);
                if (res.success && res.data) {
                    const filtered = (res.data as SearchResult[]).filter(r => !excludeIds.includes(r.id));
                    setResults(filtered);
                } else {
                    setResults([]);
                }
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setResults([]);
        }
    }, [query, excludeIds]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-9 text-xs"
                />
            </div>
            
            {results.length > 0 && (
                <div className="absolute z-[110] w-full mt-1 bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#2a3040] rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {results.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                                onSelect(r);
                                setQuery("");
                                setResults([]);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 border-b border-slate-100 dark:border-[#2a3040] last:border-0"
                        >
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-xs font-bold">{r.firstName} {r.lastName}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{r.barangay}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
