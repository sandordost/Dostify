"use client"

import BackgroundImage from "@/public/images/dust-background.jpg";
import { useGlobalState } from "./global-state";

export default function PageBackground() {
    const { radioMode } = useGlobalState();

    return (
        <div
            className={[
                "fixed inset-0 -z-10 h-full bg-cover bg-center",
                "blur-[8px] scale-[1.05]",
                "transition-[filter] duration-2000",
                radioMode ? "hue-rotate-[120deg]" : "hue-rotate-0",
            ].join(" ")}
            style={{ backgroundImage: `url(${BackgroundImage.src})` }}
        />
    );
}
