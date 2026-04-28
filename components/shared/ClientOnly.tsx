"use client";

import * as React from "react";

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    delay?: number;
}

export function ClientOnly({ children, fallback = null, delay = 0 }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => setHasMounted(true), delay);
            return () => clearTimeout(timer);
        } else {
            setHasMounted(true);
        }
    }, [delay]);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
