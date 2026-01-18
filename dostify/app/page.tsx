import { AppHeader } from "@/components/app/header";
import AppMain from "@/components/app/main";
import AppPlayer from "@/components/app/player";

export default function Home() {

  return (
    <div className="flex flex-col h-screen min-h-0">
      <AppHeader className="w-full p-3 flex-none" />

      <AppMain className="px-2 flex-1 min-h-0 overflow-y-scroll" />

      <AppPlayer className="px-4 h-30 mt-2 flex-none" />
    </div>
  );
}