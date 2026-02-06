"use client"

import { cn, truncate } from "@/lib/utils"
import AudioPlaceholderImage from "@/public/images/audio-placeholder.jpg"

type AudioItemMode = 'result' | 'queue' | 'player' | 'result-mobile'

type AudioItemProps = {
    title: string
    description?: string
    className?: string
    imageSrc?: string
    mode?: AudioItemMode
    viewsString?: string;
    onClicked?: () => void;
    isMobile?: boolean;
    isActive?: boolean;
}

export default function AudioItem(props: AudioItemProps) {

    switch (props.mode) {
        case 'result':
            return ResultContainer(props)
        case 'queue':
            return QueueContainer(props)
        case 'player':
            return PlayerContainer(props)
        case 'result-mobile':
            return ResultMobileContainer(props);
    }
}

function ResultContainer(props: AudioItemProps) {
    return (
        <div
            className={cn(
                props.className,
                "relative select-none cursor-pointer bg-[rgba(33,33,33,0.73)] rounded-md p-3 h-60 w-45 flex flex-col items-center transition hover:bg-[rgba(55,55,55,0.85)] hover:scale-[1.02] active:scale-[0.98]"
            )}
            onClick={props.onClicked}
        >
            <div
                className="w-full aspect-square bg-cover bg-center rounded-md"
                style={{
                    backgroundImage: `url(${props.imageSrc || AudioPlaceholderImage.src})`,
                }}
            />
            <div className="mt-2 w-full">
                {(() => {
                    const title = truncate(props.title, 33) || "Unknown";
                    const desc = truncate(props.description, 20) || "";
                    return (
                        <>
                            <h2 className="text-sm font-bold">{title}</h2>
                            <h3 className="text-xs text-[rgb(210,210,210)]">{desc}</h3>
                        </>
                    )
                })()}
            </div>
            {props.viewsString != null && (
                <div className="absolute bottom-2 right-2 text-xs text-[rgb(180,180,180)]">
                    {props.viewsString}
                </div>
            )}
        </div>
    );
}

function ResultMobileContainer(props: AudioItemProps) {
    return (
        <div
            className={cn(
                props.className,
                `relative select-none cursor-pointer bg-[rgba(33,33,33,0.73)] rounded-md p-3 h-20 w-full flex flex-row items-center transition active:bg-[rgba(55,55,55,0.85)] active:scale-[1.02]`
            )}
            onClick={props.onClicked}
        >
            <div
                className="h-full aspect-square bg-cover bg-center rounded-md"
                style={{
                    backgroundImage: `url(${props.imageSrc || AudioPlaceholderImage.src})`,
                }}
            />
            <div className="ml-2">
                <h2 className="text-sm font-bold">{props.title}</h2>
                <h3 className="text-xs text-[rgb(210,210,210)]">{props.description}</h3>
            </div>
            {props.viewsString != null && (
                <div className="absolute bottom-2 right-2 text-xs text-[rgb(180,180,180)]">
                    {props.viewsString}
                </div>
            )}
        </div>
    );
}

function QueueContainer(props: AudioItemProps) {
    return (
        <div
            className={cn(
                props.className,
                `relative select-none cursor-default bg-[rgba(33,33,33,0.73)] rounded-md p-3 h-20 w-full flex flex-row items-center ${props.isActive ? "bg-[rgba(55,55,55,0.85)]" : ""}`
            )}
            onClick={props.onClicked}
        >
            <div
                className="h-full aspect-square bg-cover bg-center rounded-md"
                style={{
                    backgroundImage: `url(${props.imageSrc || AudioPlaceholderImage.src})`,
                }}
            />
            <div className="ml-2">
                <h2 className="text-sm font-bold">{props.title}</h2>
                <h3 className="text-xs text-[rgb(210,210,210)]">{props.description}</h3>
            </div>
            {props.viewsString != null && (
                <div className="absolute bottom-2 right-2 text-xs text-[rgb(180,180,180)]">
                    {props.viewsString}
                </div>
            )}
        </div>
    );
}

function PlayerContainer(props: AudioItemProps) {
    return (
        <div
            className={cn(
                props.className,
                "relative cursor-default py-3 h-20 w-full flex flex-row items-center"
            )}
            onClick={props.onClicked}
        >
            <div
                className="h-full aspect-square bg-cover bg-center rounded-md"
                style={{
                    backgroundImage: `url(${props.imageSrc || AudioPlaceholderImage.src})`,
                }}
            />
            {!props.isMobile && (
                <div className="ml-3">
                    <h2 className="text-m font-bold">{props.title}</h2>
                    <h3 className="text-sm text-[rgb(210,210,210)]">{props.description}</h3>
                </div>
            )}
        </div>
    );
}