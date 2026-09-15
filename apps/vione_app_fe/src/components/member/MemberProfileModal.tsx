import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  MessageSquare,
  UserPlus,
  BadgeCheck,
  User,
  Check,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import type { DirectoryMember } from "@/lib/member-app.functions";

export interface MemberProfileModalProps {
  member: DirectoryMember | null;
  onClose: () => void;
  onMessage?: (member: DirectoryMember) => void;
  onConnect?: (member: DirectoryMember) => void;
}

export function MemberProfileModal({
  member,
  onClose,
  onMessage,
  onConnect,
}: MemberProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kiểm tra trạng thái đã kết nối từ localStorage
  useEffect(() => {
    if (!member?.code) return;
    try {
      const stored = localStorage.getItem("vba.connected_members");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(member.code)) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      }
    } catch {
      setConnected(false);
    }
  }, [member?.code]);

  if (!mounted || !member || typeof document === "undefined") {
    return null;
  }

  const displayName = member.contact || member.personName || member.name;
  const avatarUrl = member.avatar ? resolveMediaUrl(member.avatar) || member.avatar : null;
  const subtitle = [member.personTitle || member.industry, member.region].filter(Boolean).join(" · ");

  const handleConnectClick = () => {
    if (connected) {
      toast.info(`Bạn đã kết nối với hội viên ${displayName}`);
      return;
    }
    try {
      const stored = localStorage.getItem("vba.connected_members");
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(member.code)) {
        list.push(member.code);
        localStorage.setItem("vba.connected_members", JSON.stringify(list));
      }
      setConnected(true);
      toast.success(`Đã gửi yêu cầu kết nối thành công tới ${displayName}`);
      if (onConnect) onConnect(member);
    } catch {
      setConnected(true);
      toast.success(`Đã gửi yêu cầu kết nối thành công tới ${displayName}`);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3.5 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[390px] rounded-3xl bg-white dark:bg-[#0f172a] p-4 sm:p-5 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 space-y-3 animate-in zoom-in-95 duration-150 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#003B95] dark:text-amber-400">
            HỒ SƠ HỘI VIÊN CLB CEO 1983
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Profile Avatar & Names */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "/ceo1983-logo.png";
                }}
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-[#003B95] dark:text-amber-400 ring-2 ring-amber-500/30">
                <User className="h-7 w-7" />
              </div>
            )}
            {member.verified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-4.5 w-4.5 text-amber-500 fill-white dark:fill-slate-900" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="truncate text-[15px] font-extrabold text-slate-900 dark:text-white">
                {displayName}
              </h3>
              {member.code && (
                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-[#003B95] dark:text-amber-400 shrink-0">
                  {member.code}
                </span>
              )}
            </div>
            {member.name && (
              <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400 shrink-0" />
                <span>{member.name}</span>
              </p>
            )}
            {subtitle && (
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Giới thiệu / Bio nếu có (tinh gọn để không bị dài scroll) */}
        {member.about && (
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-2.5 text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-white/5">
            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
              GIỚI THIỆU
            </p>
            <p className="line-clamp-3 whitespace-pre-wrap">{member.about}</p>
          </div>
        )}

        {/* Thông tin liên lạc (Contact List gọn gàng) */}
        <div className="space-y-1.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-2.5 text-[11.5px] border border-slate-200/60 dark:border-white/5">
          {member.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Điện thoại</span>
              </div>
              <a
                href={`tel:${member.phone}`}
                className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline"
              >
                {member.phone}
              </a>
            </div>
          )}
          {member.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Email</span>
              </div>
              <a
                href={`mailto:${member.email}`}
                className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline truncate max-w-[200px]"
              >
                {member.email}
              </a>
            </div>
          )}
          {member.address && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                <MapPin className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Địa chỉ</span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[220px]">
                {member.address}
              </span>
            </div>
          )}
          {member.website && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Globe className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Website</span>
              </div>
              <a
                href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Truy cập</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* 2 Nút hành động: "Nhắn tin" & "Kết nối ngay" */}
        <div className="flex gap-2 pt-1">
          {onMessage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onMessage(member);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 py-2.5 text-[12.5px] font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition active:scale-95 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Nhắn tin</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleConnectClick}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold text-white transition active:scale-95 cursor-pointer shadow-md ${
              connected
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-[#003B95] hover:bg-[#002B70] shadow-blue-900/20"
            }`}
          >
            {connected ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã kết nối</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Kết nối ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Link xem thẻ hội viên số */}
        <div className="text-center pt-0.5">
          <Link
            to="/card/$code"
            params={{ code: member.code }}
            onClick={onClose}
            className="text-[11.5px] font-semibold text-slate-500 hover:text-[#003B95] dark:text-slate-400 dark:hover:text-amber-400 transition underline"
          >
            Xem danh thiếp / thẻ hội viên số
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
