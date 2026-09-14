import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  ChevronRight,
  ChevronDown,
  BadgeCheck,
  User,
  Building2,
  Users,
  History,
  FileText,
  Package,
  Sparkles,
  Bell,
  Settings as Cog,
  LogOut,
  Sun,
  Moon,
  Contrast,
  Share2,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  LayoutDashboard,
  ArrowUpRight,
  Nfc,
  X,
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon,
  Edit3,
  Lock,
  Globe2,
  Plus,
  ImagePlus,
  Loader2,
  MessageSquare,
  Tag,
  Users2,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, listMembers, type MyMember, type DirectoryMember } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import eventImg from "@/assets/vba-event.jpg";

export const Route = createFileRoute("/association/profile")({
  component: ProfileScreen,
});

function initials(name?: string) {
  if (!name) return "VIP";
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const fetchMember = useServerFn(getMyMember);
  const fetchDirectory = useServerFn(listMembers);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const { data: realMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), []);

  const [copied, setCopied] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "friends" | "posts" | "photos">("about");
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, number>>({ post1: 24, post2: 41 });
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // ── USER POSTS FEED STATE ──
  interface UserPost {
    id: string;
    authorName: string;
    authorAvatar?: string | null;
    time: string;
    content: string;
    imageUrl?: string | null;
    privacy: "public" | "friends" | "private";
    taggedFriends: string[];
    likes: number;
  }

  const [userPosts, setUserPosts] = useState<UserPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_user_posts") || "[]");
        if (Array.isArray(saved) && saved.length > 0) return saved;
      } catch {}
    }
    return [
      {
        id: "post1",
        authorName: member?.name || "Lê Hoàng Long",
        authorAvatar: null,
        time: "Hôm qua lúc 15:30",
        content: "Rất vinh dự được đón tiếp các anh chị lãnh đạo CLB Doanh Nhân CEO 1983 tới thăm và làm việc tại trụ sở ViOne. Chúc các thỏa thuận hợp tác thương mại sớm đơm hoa kết trái! 🤝✨",
        imageUrl: eventImg,
        privacy: "public",
        taggedFriends: ["Đặng Văn Lâm", "Trần Thu Trang"],
        likes: 24,
      },
    ];
  });

  // ── CREATE POST COMPOSER MODAL STATE ──
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postPrivacy, setPostPrivacy] = useState<"public" | "friends" | "private">("public");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Local editable profile state with offline / persisted support
  const [profileName, setProfileName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.name) return saved.name;
      } catch {}
    }
    return member?.name || "Lê Hoàng Long";
  });
  const [profileTitle, setProfileTitle] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.title) return saved.title;
      } catch {}
    }
    return member?.title || "Chủ tịch HĐQT & Tổng Giám Đốc";
  });
  const [profileCompany, setProfileCompany] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.company) return saved.company;
      } catch {}
    }
    return (member as any)?.companyName || member?.industry || "Công ty CP Giải pháp Phần mềm ViOne";
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.phone) return saved.phone;
      } catch {}
    }
    return member?.phone || "0988 123 456";
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.email) return saved.email;
      } catch {}
    }
    return member?.email || "long.lh@vione.vn";
  });
  const [profileAddress, setProfileAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.address) return saved.address;
      } catch {}
    }
    return "Trung Hòa, Cầu Giấy, Hà Nội";
  });
  const [profileWebsite, setProfileWebsite] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.website) return saved.website;
      } catch {}
    }
    return "https://vione.vn";
  });
  const [profileBio, setProfileBio] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.bio) return saved.bio;
      } catch {}
    }
    return "Tiên phong kiến tạo giải pháp chuyển đổi số & kết nối giao thương thông minh cho cộng đồng doanh nghiệp Việt Nam.";
  });
  const [privacyDirectMsg, setPrivacyDirectMsg] = useState(true);
  const [privacyShowPhone, setPrivacyShowPhone] = useState(true);
  const [privacyDirectory, setPrivacyDirectory] = useState(true);

  const isEn = lang === "en";

  const handleCopyCode = () => {
    if (!member?.code) return;
    navigator.clipboard.writeText(member.code);
    setCopied(true);
    toast.success(isEn ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setPostLikes((likes) => ({
        ...likes,
        [postId]: (likes[postId] || 0) + (isLiked ? 1 : -1),
      }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: profileName || member?.name || "Hội viên CLB CEO 1983",
          text: `Danh thiếp số và hồ sơ hội viên ${profileName || member?.name} - CLB Doanh Nhân CEO 1983`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isEn ? "Profile link copied!" : "Đã sao chép liên kết trang cá nhân!");
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImagePreview) {
      toast.error(isEn ? "Please enter post content or attach a photo" : "Vui lòng nhập nội dung bài viết hoặc đính kèm ảnh");
      return;
    }

    setIsPublishing(true);
    let uploadedImageUrl = postImagePreview;

    if (postImageFile) {
      try {
        uploadedImageUrl = await uploadFileToNest(postImageFile, postImageFile.name);
      } catch {
        // Fallback to preview data url if upload encounters transient network issue
      }
    }

    const newPost: UserPost = {
      id: `post-${Date.now()}`,
      authorName: profileName || member?.name || "Lê Hoàng Long",
      authorAvatar: resolvedAvatar,
      time: isEn ? "Just now" : "Vừa xong",
      content: postContent.trim(),
      imageUrl: uploadedImageUrl,
      privacy: postPrivacy,
      taggedFriends: [...taggedFriends],
      likes: 0,
    };

    const updated = [newPost, ...userPosts];
    setUserPosts(updated);
    try {
      localStorage.setItem("vba_user_posts", JSON.stringify(updated));
    } catch {}

    if (taggedFriends.length > 0) {
      toast.success(
        isEn
          ? `Post published! Tagged friends (${taggedFriends.join(", ")}) received notification.`
          : `Đã đăng bài thành công! Bạn bè được tag (${taggedFriends.join(", ")}) đã nhận được thông báo.`
      );
    } else {
      toast.success(isEn ? "Post published successfully!" : "Đã đăng bài viết thành công!");
    }

    setPostContent("");
    setPostImageFile(null);
    setPostImagePreview(null);
    setTaggedFriends([]);
    setPostPrivacy("public");
    setIsPublishing(false);
    setCreatePostOpen(false);
  };

  const menu = [
    {
      label: isEn ? "Update Profile & Privacy" : "Cập nhật hồ sơ & Quyền riêng tư",
      icon: User,
      onClick: () => {
        void navigate({
          to: "/association/business-cards",
          search: { tab: "cards", action: "edit" },
        });
      },
      desc: isEn ? "Edit personal name, title, contact & privacy" : "Chỉnh sửa tên, chức danh, liên hệ & quyền riêng tư",
    },
    {
      label: isEn ? "Smart VIP Membership Card" : "Thẻ Hội Viên Thông Minh",
      icon: QrCode,
      to: "/association/card" as const,
      desc: isEn ? "View & switch VIP smart digital card" : "Xem và đổi giao diện Thẻ số VIP",
    },
    {
      label: isEn ? "Digital Business Cards" : "Quản lý Danh thiếp số",
      icon: Building2,
      to: "/association/business-cards" as const,
      desc: isEn ? "Design & share electronic business card" : "Thiết kế & chia sẻ danh thiếp số cá nhân",
    },
    {
      label: isEn ? "CEO 1983 Member Directory" : "Danh bạ hội viên CLB",
      icon: Users,
      to: "/association/members" as const,
      desc: isEn ? "Search & connect with CEO 1983 members" : "Tìm kiếm & kết nối hội viên CEO 1983",
    },
    {
      label: isEn ? "B2B Trade Opportunities" : "Cơ hội giao thương B2B",
      icon: Sparkles,
      to: "/association/opportunities" as const,
      desc: isEn ? "Commercial supply, demand & investment" : "Nhu cầu mua, bán & hợp tác đầu tư",
    },
    {
      label: isEn ? "Product Showcase" : "Gian hàng sản phẩm",
      icon: Package,
      to: "/association/products" as const,
      desc: isEn ? "Showcase enterprise products & services" : "Showcase sản phẩm & dịch vụ doanh nghiệp",
    },
    {
      label: isEn ? "Club News & Events" : "Tin tức & Sự kiện CLB",
      icon: FileText,
      to: "/association/news" as const,
      desc: isEn ? "B2B trading activities & networking events" : "Hoạt động giao thương & sự kiện kết nối",
    },
    {
      label: isEn ? "History & Check-in" : "Lịch sử kết nối & Check-in",
      icon: History,
      to: "/association/history" as const,
      desc: isEn ? "Trading log & event participation" : "Nhật ký giao thương & tham gia sự kiện",
    },
    {
      label: isEn ? "Notifications & Invites" : "Thông báo & Lời mời",
      icon: Bell,
      to: "/association/notifications" as const,
      desc: isEn ? "Messages & connection approvals" : "Cập nhật tin nhắn & phê duyệt kết nối",
    },
    {
      label: isEn ? "Security & Account Settings" : "Bảo mật & Cài đặt tài khoản",
      icon: Cog,
      to: "/association/settings" as const,
      desc: isEn ? "Change password, active sessions & security" : "Đổi mật khẩu, phiên đăng nhập & bảo mật",
    },
  ];

  const themeOptions: { mode: Theme; icon: typeof Sun; label: string; desc: string }[] = [
    { mode: "light", icon: Sun, label: isEn ? "Light" : "Sáng", desc: isEn ? "Crisp, clean" : "Tươi sáng, tinh tế" },
    { mode: "dark", icon: Moon, label: isEn ? "Dark" : "Tối", desc: isEn ? "Luxury, sleek" : "Sang trọng, dịu mắt" },
    { mode: "contrast", icon: Contrast, label: isEn ? "Contrast" : "Tương phản", desc: isEn ? "High contrast" : "Độ tương phản cao" },
  ];

  async function logout() {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  }

  const resolvedAvatar = member?.avatar ? resolveMediaUrl(member.avatar) || member.avatar : null;

  type FriendItem = {
    code: string;
    name: string;
    title: string;
    company: string;
    avatar: string | null;
  };

  // Real CEO 1983 active members from database / CRM
  const friendsList: FriendItem[] = useMemo(() => {
    return ((realMembers || []) as DirectoryMember[]).map((m: DirectoryMember) => ({
      code: m.code,
      name: m.personName || m.name,
      title: m.personTitle || m.industry || "Hội viên CEO 1983",
      company: m.name !== m.personName ? m.name : "CLB Doanh Nhân CEO 1983",
      avatar: m.avatar ? resolveMediaUrl(m.avatar) || m.avatar : null,
    }));
  }, [realMembers]);

  return (
    <div className="vba-animate pb-28 text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "Profile & Administration" : "Trang Cá Nhân & Quản Trị"}
        back
        right={
          <Link
            to="/association/settings"
            aria-label={isEn ? "Account settings" : "Cài đặt tài khoản"}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 p-1"
          >
            <Settings className="h-5 w-5" />
          </Link>
        }
      />

      {/* ── COLLAPSIBLE FACEBOOK PROFILE (BỎ NỀN ĐEN, THEME SÁNG TRANG NHÃ) ── */}
      <div className="mx-4 mt-3.5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs transition-all duration-300">
        {/* Header Bar that triggers collapse / expand */}
        <button
          type="button"
          onClick={() => setProfileExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-sky-50/50 dark:hover:bg-slate-800/50 cursor-pointer"
          aria-expanded={profileExpanded}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              {resolvedAvatar ? (
                <img
                  src={resolvedAvatar}
                  alt={member?.name ?? ""}
                  className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-sky-500/40 shadow-xs bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-[16px] font-black text-white shadow-xs">
                  {initials(member?.name)}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-bold text-slate-900 dark:text-white">
                  {member?.name ?? "Lê Hoàng Long"}
                </span>
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
                  {member?.title || "Chủ tịch HĐQT & CEO"}
                </span>
                <span className="rounded bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.2 text-[9.5px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {member?.code || "M1983-007"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hidden sm:inline">
              {profileExpanded ? (isEn ? "Collapse" : "Thu gọn") : (isEn ? "View Profile" : "Xem profile")}
            </span>
            <div
              className={`grid h-8 w-8 place-items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${
                profileExpanded ? "rotate-180 bg-sky-50 dark:bg-sky-950 border-sky-300 text-sky-600 dark:text-sky-400" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Expanded Profile Body (Chuẩn Facebook Profile) */}
        {profileExpanded && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            {/* 1. Ảnh bìa toàn cảnh (Facebook Cover Photo) */}
            <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800">
              <img
                src={heroImg}
                alt="Ảnh bìa trang cá nhân"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Nút Đổi ảnh bìa — Trắng sáng nổi bật */}
              <button
                type="button"
                onClick={() => toast.info(isEn ? "Upload cover photo feature" : "Chức năng tải ảnh bìa mới")}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/30 hover:bg-white/40 text-white font-bold backdrop-blur-md px-3 py-1 text-[11px] border border-white/60 shadow-md cursor-pointer transition active:scale-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
                <span className="text-white font-bold">{isEn ? "Edit Cover" : "Đổi ảnh bìa"}</span>
              </button>
            </div>

            {/* 2. Avatar đè lên ảnh bìa & Thông tin cá nhân */}
            <div className="px-4 pb-4">
              <div className="relative flex items-end justify-between -mt-12 mb-3">
                <div className="relative">
                  {resolvedAvatar ? (
                    <img
                      src={resolvedAvatar}
                      alt={member?.name ?? ""}
                      className="h-22 w-22 rounded-2xl object-cover ring-4 ring-white dark:ring-[#0F172A] shadow-lg bg-slate-100 dark:bg-slate-800"
                    />
                  ) : (
                    <span className="grid h-22 w-22 place-items-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-[26px] font-black text-white ring-4 ring-white dark:ring-[#0F172A] shadow-lg">
                      {initials(member?.name)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toast.info(isEn ? "Update avatar photo" : "Đổi ảnh đại diện")}
                    className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-sky-50 cursor-pointer"
                    title={isEn ? "Change avatar" : "Đổi ảnh đại diện"}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-[10.5px] font-bold text-sky-700 dark:text-sky-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    {isEn ? "VIP MEMBER" : "HỘI VIÊN CHÍNH THỨC"}
                  </span>
                </div>
              </div>

              {/* Tên & Doanh nghiệp */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {member?.name ?? "Lê Hoàng Long"}
                  </h2>
                  <BadgeCheck className="h-5 w-5 text-sky-500 shrink-0" />
                </div>
                <p className="text-[13px] font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                  {member?.title || "Hội viên chính thức CLB Doanh Nhân CEO 1983"}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  "Tiên phong kiến tạo giải pháp chuyển đổi số & kết nối giao thương thông minh cho cộng đồng doanh nghiệp Việt Nam."
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> Hà Nội, Việt Nam
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {isEn ? "Joined 2023" : "Gia nhập từ 2023"}
                  </span>
                  {member?.code && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 cursor-pointer"
                    >
                      <span>{member.code}</span>
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Action Buttons Row: đồng bộ phong cách, không in đậm khi chưa bấm */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigate({
                      to: "/association/business-cards",
                      search: { tab: "cards", action: "edit" },
                    });
                  }}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[10.5px] font-semibold">{isEn ? "Edit" : "Cập nhật"}</span>
                </button>

                <Link
                  to="/association/card"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[10.5px] font-semibold">{isEn ? "VIP Card" : "Thẻ VIP"}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setNfcModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Nfc className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[10.5px] font-semibold">{isEn ? "Tap NFC" : "Chạm NFC"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Share2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[10.5px] font-semibold">{isEn ? "Share" : "Chia sẻ"}</span>
                </button>
              </div>

              {/* 4. Facebook Profile Tabs Navigation */}
              <div className="mt-5 flex border-b border-slate-200 dark:border-slate-800">
                {[
                  { id: "about" as const, label: isEn ? "About" : "Giới thiệu" },
                  { id: "friends" as const, label: `${isEn ? "Members" : "Hội viên"} (${realMembers.length})` },
                  { id: "posts" as const, label: isEn ? "Posts & Feed" : "Bài viết" },
                  { id: "photos" as const, label: isEn ? "Photos" : "Hình ảnh" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 text-center text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer ${
                      activeTab === tab.id
                        ? "border-sky-600 text-sky-600 dark:text-sky-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 5. Tab Content: Giới thiệu & Liên kết mạng xã hội (Đã xóa doanh nghiệp theo yêu cầu) */}
              {activeTab === "about" && (
                <div className="mt-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {/* Facebook Link */}
                  <a
                    href="https://facebook.com/ceo1983.official"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-700/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white font-black text-xs">
                        f
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600">
                        Facebook: facebook.com/ceo1983.official
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  </a>

                  {/* Website Link */}
                  <a
                    href="https://ceo1983.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-700/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-5 w-5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600">
                        Website: https://ceo1983.com • https://vione.vn
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  </a>

                  {/* Zalo / LinkedIn */}
                  <a
                    href="https://zalo.me/0988123456"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-700/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="h-5 w-5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600">
                        Zalo / LinkedIn: zalo.me/0988123456
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  </a>

                  {/* Hotline */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <Phone className="h-5 w-5 text-sky-600 shrink-0" />
                    <span>
                      <strong>Hotline liên hệ:</strong> {member?.phone || "0988 123 456"}
                    </span>
                  </div>

                  {/* Trụ sở */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <MapPin className="h-5 w-5 text-sky-600 shrink-0" />
                    <span className="truncate">
                      <strong>{isEn ? "HQ Address:" : "Trụ sở:"}</strong> Tòa nhà CEO Tower, Phạm Hùng, Nam Từ Liêm, Hà Nội
                    </span>
                  </div>
                </div>
              )}

              {/* 6. Tab Content: Bạn bè / Hội viên kết nối từ CRM */}
              {activeTab === "friends" && (
                <div className="mt-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {realMembers.length} {isEn ? "Connected Members" : "Hội viên đã kết nối"}
                    </span>
                    <Link to="/association/members" className="text-sky-600 font-semibold hover:underline">
                      {isEn ? "View all" : "Xem tất cả"}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {friendsList.map((f, i) => (
                      <div
                        key={f.code || i}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-800/50 hover:border-sky-400 transition"
                      >
                        {f.avatar ? (
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="h-10 w-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-bold text-xs grid place-items-center shrink-0 shadow-xs">
                            {initials(f.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate">
                            {f.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {f.title}
                          </p>
                          <p className="text-[9.5px] text-sky-600 dark:text-sky-400 truncate">
                            {f.company}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Tab Content: Bài viết & Hoạt động (Có nút Đăng bài viết + Modal Đăng bài) */}
              {activeTab === "posts" && (
                <div className="mt-3.5 space-y-3">
                  {/* Nút Đăng Bài Viết Nổi Bật */}
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-2xl bg-sky-600 text-white grid place-items-center font-bold text-xs shrink-0">
                        {initials(member?.name)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreatePostOpen(true)}
                        className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-left text-xs text-slate-500 dark:text-slate-400 hover:border-sky-500 transition shadow-2xs cursor-pointer"
                      >
                        {isEn ? "Share a business update or deal..." : "Bạn đang nghĩ gì? Chia sẻ cơ hội với CLB..."}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-sky-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCreatePostOpen(true)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <ImagePlus className="h-4 w-4" />
                          <span>{isEn ? "Photo / Video" : "Hình ảnh"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCreatePostOpen(true);
                            setTagPickerOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Tag className="h-4 w-4" />
                          <span>{isEn ? "Tag Friends" : "Gắn thẻ bạn bè"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCreatePostOpen(true)}
                        className="rounded-xl bg-sky-500 hover:bg-sky-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        {isEn ? "Post" : "Đăng bài"}
                      </button>
                    </div>
                  </div>

                  {/* Posts List */}
                  {userPosts.map((post) => {
                    const isLiked = likedPosts[post.id];
                    const likeCount = (postLikes[post.id] ?? post.likes) + (isLiked ? 1 : 0);
                    return (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-[#0F172A] space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white grid place-items-center font-bold text-xs shrink-0 overflow-hidden">
                              {post.authorAvatar ? (
                                <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                initials(post.authorName)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {post.authorName}
                                </span>
                                {post.taggedFriends && post.taggedFriends.length > 0 && (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    cùng với{" "}
                                    <strong className="text-sky-600 dark:text-sky-400 font-semibold">
                                      {post.taggedFriends.join(", ")}
                                    </strong>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-400 mt-0.5">
                                <span>{post.time}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {post.privacy === "public" ? (
                                    <>
                                      <Globe2 className="h-3 w-3" />
                                      <span>Mọi người</span>
                                    </>
                                  ) : post.privacy === "friends" ? (
                                    <>
                                      <Users2 className="h-3 w-3" />
                                      <span>Bạn bè</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-3 w-3" />
                                      <span>Chỉ mình tôi</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-[12.5px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>

                        {/* Image */}
                        {post.imageUrl && (
                          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 max-h-72">
                            <img
                              src={resolveMediaUrl(post.imageUrl) || post.imageUrl}
                              alt="Ảnh đính kèm"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11.5px] text-slate-500">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-1.5 font-semibold cursor-pointer transition ${
                              isLiked ? "text-sky-600 dark:text-sky-400" : "hover:text-sky-600"
                            }`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-sky-500" : ""}`} />
                            <span>{likeCount} Thích</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.info("Tính năng bình luận đang được tối ưu")}
                            className="flex items-center gap-1.5 font-semibold hover:text-sky-600 cursor-pointer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Bình luận</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleShare}
                            className="flex items-center gap-1.5 font-semibold hover:text-sky-600 cursor-pointer"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Chia sẻ</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8. Tab Content: Hình ảnh (Photos) */}
              {activeTab === "photos" && (
                <div className="mt-3.5 grid grid-cols-3 gap-1.5">
                  {[heroImg, eventImg, heroImg, eventImg, heroImg, eventImg].map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={img} alt="" className="h-full w-full object-cover hover:scale-105 transition duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ADMIN MANAGEMENT PORTAL (Cổng Quản Trị CRM ViOne) ── */}
      <div className="mx-4 mt-4">
        <Link
          to="/admin"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-sky-500/15 p-4 transition-all hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-bold text-sky-700 dark:text-sky-300">
                  {isEn ? "ViOne CRM Admin Portal" : "Cổng Quản Trị CRM ViOne"}
                </span>
                <span className="rounded-full bg-sky-600 text-white px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {isEn ? "Member management, events, landing pages & reports" : "Bảng điều khiển hội viên, quản lý sự kiện, landing page & báo cáo"}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* ── NAVIGATION MENU (Phân hệ chức năng) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isEn ? "Functional Modules" : "Phân hệ chức năng"}
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs">
          {menu.map((m: any) => {
            const Icon = m.icon;
            if (m.onClick) {
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={m.onClick}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-sky-50/60 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {m.label}
                    </div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              );
            }
            return (
              <Link
                key={m.label}
                to={m.to}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-sky-50/60 dark:hover:bg-slate-800/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {m.label}
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── THEME & APPEARANCE PICKER ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? "Appearance & Theme" : "Giao diện & Chế độ màu"}
          </span>
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
            {theme === "light" ? (isEn ? "Light" : "Sáng") : theme === "dark" ? (isEn ? "Dark" : "Tối") : (isEn ? "Contrast" : "Tương phản")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setTheme(opt.mode)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all cursor-pointer border ${
                  active
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/50 shadow-md scale-[1.02]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[12px] font-bold text-slate-900 dark:text-white">
                  {opt.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LANGUAGE SELECTOR (Chuyển đổi ngôn ngữ hoạt động lập tức) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? "App Language (8 Languages)" : "Ngôn ngữ ứng dụng (8 Ngôn ngữ)"}
          </span>
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
            {lang === "vi" ? "Tiếng Việt" : "English"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { code: "vi" as const, name: "Tiếng Việt", flag: "🇻🇳" },
            { code: "en" as const, name: "English", flag: "🇬🇧" },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                toast.success(l.code === "en" ? "Switched to English" : `Đã chuyển sang ${l.name}`);
              }}
              className={`flex items-center justify-between rounded-xl p-3 border text-xs font-semibold transition cursor-pointer ${
                lang === l.code
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 shadow-xs font-bold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                <span className="truncate">{l.name}</span>
              </span>
              {lang === l.code && <Check className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUPPORT & LOGOUT ── */}
      <div className="mx-4 mt-6 space-y-2.5">
        <Link
          to="/install"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-white dark:bg-[#0F172A] py-3 text-[13px] font-semibold text-sky-700 dark:text-sky-400 shadow-xs transition hover:bg-sky-50 dark:hover:bg-slate-800"
        >
          {isEn ? "📲 Install App to Home Screen" : "📲 Cài đặt ứng dụng lên màn hình chính"}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer border border-rose-500/20"
        >
          <LogOut className="h-4 w-4" /> {isEn ? "Sign out" : "Đăng xuất tài khoản"}
        </button>
      </div>

      {/* ── INTERACTIVE NFC TOUCH MODAL ── */}
      {nfcModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setNfcModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-900 dark:text-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNfcModalOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Radiant NFC Wave Animation */}
            <div className="relative mx-auto my-4 grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping duration-1000" />
              <span className="absolute inset-2 rounded-full bg-sky-600/30 animate-pulse" />
              <div className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-lg shadow-sky-500/30">
                <Nfc className="h-9 w-9" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isEn ? "Tap NFC Card / Device" : "Chạm Thẻ NFC / Điện Thoại"}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
              {isEn
                ? "Hold your phone near the smart NFC card or partner's device to instantly exchange digital business cards."
                : "Đặt mặt lưng điện thoại sát thẻ thông minh NFC hoặc thiết bị của đối tác để trao đổi danh thiếp ngay lập tức."}
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 p-3 text-left space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 font-semibold">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>{isEn ? "Direct B2B Contact Exchange" : "Trao đổi liên hệ B2B trực tiếp"}</span>
              </div>
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 font-semibold">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>{isEn ? "Automatic Association CRM Sync" : "Tự động đồng bộ CRM Hiệp hội"}</span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  toast.success(isEn ? "NFC ready! Place card near phone." : "NFC đã sẵn sàng! Vui lòng chạm thẻ.");
                  setNfcModalOpen(false);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:brightness-110 active:scale-98 transition cursor-pointer"
              >
                {isEn ? "Simulate Tap Connect" : "Mô Phỏng Chạm Kết Nối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP CẬP NHẬT HỒ SƠ & QUYỀN RIÊNG TƯ TRỰC TIẾP ── */}
      {editProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in-50 duration-200"
          onClick={() => setEditProfileOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEn ? "Update Profile & Privacy" : "Cập Nhật Hồ Sơ & Quyền Riêng Tư"}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Manage personal info, card & directory visibility" : "Quản lý thông tin cá nhân & hiển thị danh bạ hội viên"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const updated = {
                    name: profileName,
                    title: profileTitle,
                    company: profileCompany,
                    phone: profilePhone,
                    email: profileEmail,
                    address: profileAddress,
                    website: profileWebsite,
                    bio: profileBio,
                    privacyDirectMsg,
                    privacyShowPhone,
                    privacyDirectory,
                  };
                  localStorage.setItem("vba_custom_profile", JSON.stringify(updated));
                } catch {}
                toast.success(isEn ? "Profile & privacy updated successfully!" : "Đã cập nhật hồ sơ và quyền riêng tư thành công!");
                setEditProfileOpen(false);
              }}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5"
            >
              {/* Họ và tên */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Full Name *" : "Họ và tên *"}
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                />
              </div>

              {/* Chức danh & Công ty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Title / Position" : "Chức vụ / Vị trí"}
                  </label>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Chủ tịch HĐQT, CEO..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Company / Enterprise" : "Doanh nghiệp / Công ty"}
                  </label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    placeholder="Tên công ty"
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Số điện thoại & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Phone Number" : "Số điện thoại"}
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Địa chỉ & Website */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Office Address" : "Địa chỉ trụ sở"}
                  </label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Website
                  </label>
                  <input
                    type="text"
                    value={profileWebsite}
                    onChange={(e) => setProfileWebsite(e.target.value)}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Giới thiệu */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Bio & Business Introduction" : "Giới thiệu bản thân & Doanh nghiệp"}
                </label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>

              {/* Cấu hình quyền riêng tư */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-3">
                <div className="text-[11.5px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  {isEn ? "Privacy & Visibility Settings" : "Thiết lập quyền riêng tư & Kết nối"}
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isEn ? "Allow direct messages from other members" : "Cho phép hội viên khác nhắn tin trực tiếp"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Receive business messages from CEO 1983 entrepreneurs" : "Nhận tin nhắn giao thương từ các hội viên trong CLB"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyDirectMsg}
                    onChange={(e) => setPrivacyDirectMsg(e.target.checked)}
                    className="h-4 w-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isEn ? "Publicize contact phone number on directory" : "Công khai số điện thoại trên danh bạ"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Show your phone number to connected peers" : "Cho phép hội viên đã kết nối nhìn thấy số điện thoại"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyShowPhone}
                    onChange={(e) => setPrivacyShowPhone(e.target.checked)}
                    className="h-4 w-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isEn ? "Show enterprise on public directory" : "Hiển thị doanh nghiệp trên danh bạ CLB"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Appear in CEO 1983 member search results" : "Xuất hiện trong kết quả tìm kiếm đối tác & kết nối"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyDirectory}
                    onChange={(e) => setPrivacyDirectory(e.target.checked)}
                    className="h-4 w-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 active:scale-98 transition cursor-pointer"
                >
                  {isEn ? "Save Profile & Privacy" : "Lưu Cập Nhật Hồ Sơ & Quyền Riêng Tư"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE POST COMPOSER MODAL (POST BÀI + GỬI LÊN MINIO + TAG BẠN BÈ + 3 CẤP PRIVACY) ── */}
      {createPostOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setCreatePostOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] p-5 shadow-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-extrabold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                {isEn ? "Create New Post" : "Tạo bài viết mới"}
              </span>
              <button
                type="button"
                onClick={() => setCreatePostOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Author bar & 3-level Privacy Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white grid place-items-center font-bold text-xs shrink-0 overflow-hidden">
                  {resolvedAvatar ? (
                    <img src={resolvedAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(member?.name)
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {profileName || member?.name || "Lê Hoàng Long"}
                  </p>
                  {/* Privacy Selector */}
                  <div className="relative inline-block mt-0.5">
                    <select
                      value={postPrivacy}
                      onChange={(e) => setPostPrivacy(e.target.value as any)}
                      className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10.5px] font-bold text-sky-700 dark:text-sky-300 px-2 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="public">🌐 {isEn ? "Public (Everyone)" : "Công khai (Mọi người)"}</option>
                      <option value="friends">👥 {isEn ? "Friends Only" : "Bạn bè trong CLB"}</option>
                      <option value="private">🔒 {isEn ? "Only Me" : "Chỉ mình tôi"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={
                isEn
                  ? "What would you like to share with CEO 1983 entrepreneurs? Announce trade deals, services, or events..."
                  : "Bạn muốn chia sẻ điều gì với các doanh nhân CEO 1983? Đăng cơ hội hợp tác, giới thiệu năng lực..."
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-500 resize-none leading-relaxed"
            />

            {/* Tagged Friends Chips */}
            {taggedFriends.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                  {isEn ? "Tagged Friends:" : "Bạn bè được gắn thẻ:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {taggedFriends.map((friend) => (
                    <span
                      key={friend}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300"
                    >
                      <span>{friend}</span>
                      <button
                        type="button"
                        onClick={() => setTaggedFriends((prev) => prev.filter((f) => f !== friend))}
                        className="hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {postImagePreview && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 max-h-56">
                <img src={postImagePreview} alt="Xem trước" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPostImageFile(null);
                    setPostImagePreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Action Bar (Attach Photo + Tag Friends) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">
                {isEn ? "Add to your post:" : "Đính kèm vào bài viết:"}
              </span>
              <div className="flex items-center gap-2">
                {/* Photo upload */}
                <label className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer transition">
                  <ImagePlus className="h-4.5 w-4.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPostImageFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setPostImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Tag friends trigger */}
                <button
                  type="button"
                  onClick={() => setTagPickerOpen((prev) => !prev)}
                  className={`grid h-8 w-8 place-items-center rounded-xl transition cursor-pointer ${
                    tagPickerOpen
                      ? "bg-sky-500 text-white"
                      : "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                  }`}
                  title={isEn ? "Tag Friends" : "Gắn thẻ bạn bè"}
                >
                  <Tag className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Friends Selector Drawer / Picker */}
            {tagPickerOpen && (
              <div className="rounded-2xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/30 p-3 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                    {isEn ? "Select Friends to Tag" : "Chọn bạn bè để gắn thẻ"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {taggedFriends.length} {isEn ? "selected" : "đã chọn"}
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-sky-100 dark:divide-sky-900/40">
                  {friendsList.map((f) => {
                    const isTagged = taggedFriends.includes(f.name);
                    return (
                      <label
                        key={f.name}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {f.avatar ? (
                            <img src={f.avatar} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-600 text-[10px] font-bold text-white shrink-0">
                              {initials(f.name)}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{f.company}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isTagged}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTaggedFriends((prev) => [...prev, f.name]);
                            } else {
                              setTaggedFriends((prev) => prev.filter((name) => name !== f.name));
                            }
                          }}
                          className="h-4 w-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Publish Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublishPost}
                disabled={isPublishing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEn ? "Uploading & Publishing..." : "Đang tải ảnh lên MinIO & Đăng bài..."}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>{isEn ? "Publish Post Now" : "Đăng Bài Viết Ngay"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
