import { Loader2 } from "lucide-react";
import SwiftEntryLogo from "/pwa-512x512.svg";

function Loading() {
  return (
    <div className="min-h-[100dvh] bg-[#F5FAFE] flex items-center justify-center px-6 font-sans overflow-hidden">
      <div className="w-full max-w-xs text-center">
        <img
          src={SwiftEntryLogo}
          alt="SwiftEntry"
          className="h-14 w-auto object-contain mx-auto mb-6 animate-pulse"
        />
        <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-semibold">Loading, please wait…</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-blue-600 rounded-full animate-[loading_1.4s_ease-in-out_infinite]" />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Loading;
