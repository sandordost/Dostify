"use client"

import { useEffect, useState } from "react";

export function useIsTablet() {
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        const isAndroidTablet = ua.includes("android") && !ua.includes("mobile");
        const uaTablet =
            ua.includes("ipad") ||
            isAndroidTablet ||
            ua.includes("tablet") ||
            ua.includes("silk") ||
            ua.includes("playbook") ||
            ua.includes("kindle");

        const isTabletSize = window.matchMedia("(min-width: 600px) and (max-width: 1400px)").matches;

        setIsTablet(uaTablet || isTabletSize);
    }, []);

    return isTablet;
}
