import { cn } from "@/lib/utils";
import { LucideSearch } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEvent, useState } from "react";

type RadioScreenProps = {
    className?: string;
    isMobile?: boolean;
}

export default function RadioScreen({ className, isMobile }: RadioScreenProps) {
    const containerClassName = 'p-3 bg-[rgba(20,20,20,0.91)] rounded-md'
    const [searchText, setSearchText] = useState("");

    function searchChanged(event: ChangeEvent<HTMLInputElement>): void {
        setSearchText(event.target.value)
    }

    return (
        <div className={cn(className, `flex ${isMobile ? "flex-col" : "flex-col"} gap-3`)}>
            {/* Search Bar */}
            <div className={cn(containerClassName, `flex flex-row items-center gap-3 py-2 pr-2 ${isMobile ? 'order-2' : ''}`)}>
                <LucideSearch />
                <Input onChange={searchChanged} type={'text'} style={{ background: 'none' }} className="h-10 m-0 border-none" />
            </div>
            <div className={cn(containerClassName, `flex-2 p-5 flex-col overflow-hidden`)}>
                <h1 className="text-xl font-bold mb-3">Populair</h1>
                <div className="flex-1 h-full overflow-y-scroll">
                    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">

                    </div>
                </div>
            </div>
        </div>
    )
}