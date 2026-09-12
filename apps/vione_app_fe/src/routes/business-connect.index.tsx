import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { WorkHubPage } from "@/components/business-connect/work-hub/WorkHubPage";
import { BusinessConnectLanding } from "@/components/landing/BusinessConnectLanding";
import { BusinessConnectLandingV2 } from "@/components/landing/BusinessConnectLandingV2";
import { BusinessConnectLandingV3 } from "@/components/landing/BusinessConnectLandingV3";
import { BusinessConnectLandingV4 } from "@/components/landing/BusinessConnectLandingV4";
import { BusinessConnectLandingV5 } from "@/components/landing/BusinessConnectLandingV5";
import { AppShell } from "@/components/dashboard/AppShell";
import { Sparkles, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/business-connect/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect — Hệ Điều Hành Kết Nối Kinh Doanh & Hiệp Hội" },
      {
        name: "description",
        content:
          "Nền tảng hợp nhất quản lý hội viên 360°, kết nối giao thương B2B, sự kiện thông minh và AI Copilot.",
      },
    ],
  }),
  component: BusinessConnectHubPage,
});

function BusinessConnectHubPage() {
  const [selectedVersion, setSelectedVersion] = useState<"v1" | "v2" | "v3" | "v4" | "v5" | "workhub">("v1");

  return (
    <div className="relative min-h-screen bg-[#02040A]">
      {/* Switcher bar at top */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D8B282]/30 bg-[#02040A]/95 px-4 sm:px-6 py-2.5 backdrop-blur-xl flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F6E1C3]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Business Connect • VIONE Platform</span>
        </div>

        {/* 5 Version Switcher & Work Hub Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">5 Mẫu Giao Diện:</span>
          
          {/* V1 Thành Phố */}
          <button
            type="button"
            onClick={() => setSelectedVersion("v1")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "v1"
                ? "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-md ring-2 ring-[#D8B282]/50"
                : "text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            <span>v1 Thành Phố</span>
          </button>

          {/* V2 Tu Tiên */}
          <button
            type="button"
            onClick={() => setSelectedVersion("v2")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "v2"
                ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-red-500 text-white shadow-md ring-2 ring-emerald-400/50"
                : "text-slate-400 hover:text-emerald-400 border border-emerald-900/40"
            }`}
          >
            <span>v2 Tu Tiên</span>
          </button>

          {/* V3 Cổ Tích */}
          <button
            type="button"
            onClick={() => setSelectedVersion("v3")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "v3"
                ? "bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 text-white shadow-md ring-2 ring-purple-400/50"
                : "text-slate-400 hover:text-purple-400 border border-purple-900/40"
            }`}
          >
            <span>v3 Cổ Tích</span>
          </button>

          {/* V4 Cyber */}
          <button
            type="button"
            onClick={() => setSelectedVersion("v4")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "v4"
                ? "bg-gradient-to-r from-cyan-400 via-sky-500 to-pink-500 text-slate-950 shadow-md ring-2 ring-cyan-400/50"
                : "text-slate-400 hover:text-cyan-400 border border-cyan-900/40"
            }`}
          >
            <span>v4 Cyber</span>
          </button>

          {/* V5 Hoàng Gia CEO */}
          <button
            type="button"
            onClick={() => setSelectedVersion("v5")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "v5"
                ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 shadow-md ring-2 ring-amber-400/50"
                : "text-slate-400 hover:text-amber-400 border border-amber-900/40"
            }`}
          >
            <span>v5 Hoàng Gia CEO</span>
          </button>

          <span className="w-px h-4 bg-white/20 mx-1 hidden sm:inline" />

          {/* Work Hub */}
          <button
            type="button"
            onClick={() => setSelectedVersion("workhub")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedVersion === "workhub"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Bàn làm việc Work Hub</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {selectedVersion === "v1" && (
        <div className="w-full overflow-x-hidden">
          <BusinessConnectLanding />
        </div>
      )}

      {selectedVersion === "v2" && (
        <div className="w-full overflow-x-hidden">
          <BusinessConnectLandingV2 />
        </div>
      )}

      {selectedVersion === "v3" && (
        <div className="w-full overflow-x-hidden">
          <BusinessConnectLandingV3 />
        </div>
      )}

      {selectedVersion === "v4" && (
        <div className="w-full overflow-x-hidden">
          <BusinessConnectLandingV4 />
        </div>
      )}

      {selectedVersion === "v5" && (
        <div className="w-full overflow-x-hidden">
          <BusinessConnectLandingV5 />
        </div>
      )}

      {selectedVersion === "workhub" && (
        <AppShell>
          <div className="max-w-6xl mx-auto px-4 py-6">
            <WorkHubPage />
          </div>
        </AppShell>
      )}
    </div>
  );
}
