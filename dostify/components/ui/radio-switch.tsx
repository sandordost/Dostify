"use client"

import { cn } from "@/lib/utils";
import { Music, Radio } from "lucide-react";
import { useGlobalState } from "../global-state";

type RadioSwitchProps = {
  className?: string
  onChange?: (checked: boolean) => void
}

export function RadioSwitch({ className, onChange }: RadioSwitchProps) {
  const { radioMode, setRadioMode } = useGlobalState();

  const musicGradient = "bg-gradient-to-r from-[rgba(44,24,173,1)] to-[rgba(6,12,60,1)]"
  const radioGradient = "bg-gradient-to-r from-[rgba(121,0,0,1)] to-[rgba(255,63,63,1)]"

  const musicTextColor = "rgba(255, 255, 255, 1)";
  const radioTextColor = "var(--secondary)";

  const buttonClicked = () => {
    setRadioMode(!radioMode);
  }

  return (
    <div onClick={buttonClicked} className={cn(className, `gap-2 select-none cursor-default flex flex-row items-center justify-center h-12 w-40 ${radioMode ? radioGradient : musicGradient} transition transition-[500] rounded-xl`)}>
      {radioMode ? (
        <Radio />
      ) : (
        <Music />
      )}
      <span className={`text-md font-bold`}>{radioMode ? 'Radio' : 'Muziek'}</span>
    </div>
  )
}