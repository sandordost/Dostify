"use client"

import BackgroundImage from "@/public/images/dust-background.jpg";
import BackgroundImageRed from "@/public/images/dust-background-red.jpg";
import { useGlobalState } from "./global-state";

export default function PageBackground() {
    const { radioMode } = useGlobalState();
    return (
        <div
            className="fixed inset-0 -z-10 bg-cover bg-center h-full"
            style={{
                backgroundImage: `url(${radioMode ? BackgroundImageRed.src : BackgroundImage.src})`,
                filter: "blur(8px)",
                transform: "scale(1.05)",
            }}
        />
    );
}