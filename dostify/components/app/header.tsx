"use client"

import { cn } from "@/lib/utils";
import DostifyLogo from "@/public/images/dostify-logo.svg"
import { RadioSwitch } from "../ui/radio-switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { toggleMusicOrRadioPlayerAction } from "@/app/actions/player";

type AppHeaderProps = {
    className?: string;
    radioMode: boolean;
}

export function AppHeader({ className, radioMode }: AppHeaderProps) {
    const isMobile = useIsMobile();

    const radioSwitchClicked = () => {
        toggleMusicOrRadioPlayerAction();
        console.log("Clicked");
    }

    return (
        <div className={cn(className, '')}>
            <div className={cn(className, `flex flex-row ${isMobile ? 'justify-between' : ''} items-center gap-10`)}>
                <img
                    src={DostifyLogo.src}
                    width={isMobile ? 125 : 250}
                    className="brightness-255 contrast-125 drop-shadow-md"
                    alt="Dostify"
                />

                <RadioSwitch radioModeValue={radioMode} onClicked={radioSwitchClicked} />
            </div>
        </div>
    );
}