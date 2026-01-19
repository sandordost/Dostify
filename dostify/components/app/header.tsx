"use client"

import { cn } from "@/lib/utils";
import DostifyLogo from "@/public/images/dostify-logo.svg"
import { RadioSwitch } from "../ui/radio-switch";
import { useGlobalState } from "../global-state";

type AppHeaderProps = {
    className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
    const { setRadioMode } = useGlobalState();

    return (
        <div className={cn(className, '')}>
            <div className={cn(className, 'flex flex-row items-center gap-10')}>
                <img
                    src={DostifyLogo.src}
                    width={250}
                    className="brightness-255 contrast-125 drop-shadow-md"
                    alt="Dostify"
                />

                <RadioSwitch onChange={(value) => { setRadioMode(value); console.log(value) }} />
            </div>
        </div>
    );
}