"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // This logic handles the case where a user lands on the Home page with a hash
    // or navigates to a hash from another page.
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # character
        const id = hash.replace("#", "");
        const element = document.getElementById(id);

        if (element) {
          // Add a small delay to account for cinematic animations/page delay
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 800); // 800ms to balance between the 1s delay and user readiness
        }
      }
    };

    // Run on initial mount and when pathname/hash changes
    handleHashScroll();

    // Listen for hash changes on the same page
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [pathname]);

  return null;
}
