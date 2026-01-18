import { cn } from "@/lib/utils";
import DostifyLogo from "@/public/images/dostify-logo.svg"

type AppHeaderProps = {
    className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
    return (
        <div className={cn(className, '')}>
            <div className={cn(className)}>
                <img
                    src={DostifyLogo.src}
                    width={250}
                    className="brightness-125 contrast-125 drop-shadow-md"
                    alt="Dostify"
                />
            </div>
        </div>
    );
}