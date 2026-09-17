import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Crown,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  X,
  ChevronDown,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  RefreshCw,
  Search,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { submitClubApplication, checkClubRegistrationStatus } from "@/lib/club-application.functions";
import { fetchNestApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

/** ========================================================================= */
/** OFFICIAL DATA FROM CEO 1983 (TUYỆT ĐỐI KHÔNG DÙNG TỪ "DIỀU", "CÁ")        */
/** ========================================================================= */

const LEADERSHIP_MEMBERS = [
  {
    name: "Anh Lê Xuân Tùng",
    role: "Chủ tịch CLB CEO 1983",
    company: "Chủ tịch HĐQT Tập đoàn V-Group",
    quote: "Đoàn kết thế hệ 1983 để cùng nhau bứt phá vươn tầm quốc tế.",
    img: "/ceo1983-official-logo.png",
  },
  {
    name: "Anh Nguyễn Mạnh Thắng",
    role: "Phó Chủ tịch Thường trực",
    company: "Tổng Giám đốc TN Tech",
    quote: "Giao thương thực chất trên nền tảng công nghệ số tiên phong.",
    img: "/ceo1983-official-logo.png",
  },
  {
    name: "Chị Hoàng Thị Mai Phương",
    role: "Phó Chủ tịch Đối ngoại",
    company: "Phó Tổng Giám đốc Alphanam Group",
    quote: "Mở rộng mạng lưới hợp tác đa phương, lan tỏa vị thế doanh nhân.",
    img: "/ceo1983-official-logo.png",
  },
  {
    name: "Anh Vũ Tuấn Dũng",
    role: "Tổng Thư Ký CLB",
    company: "Chủ tịch HĐQT Dũng Việt Holdings",
    quote: "Kỷ cương, chuẩn mực và phụng sự vì sự phát triển bền vững.",
    img: "/ceo1983-official-logo.png",
  },
];

const SCENE_MENU = [
  { id: "scene-sky", num: "01", label: "Khởi Nguyên" },
  { id: "scene-birds", num: "02", label: "Liên Minh" },
  { id: "scene-kites", num: "03", label: "Vươn Tầm" },
  { id: "scene-villas", num: "04", label: "Thịnh Vượng" },
  { id: "scene-water", num: "05", label: "Trầm Lắng" },
  { id: "scene-underwater", num: "06", label: "Bản Lĩnh" },
];

export function Ceo1983CinematicInteractiveWorldLanding() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeScene, setActiveScene] = useState("scene-sky");
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal State Navigation (apply vs status)
  const [modalTab, setModalTab] = useState<"apply" | "status">("apply");
  const [lookupPhone, setLookupPhone] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    found?: boolean;
    status?: "pending" | "approved" | "rejected";
    isApproved?: boolean;
    hasAccount?: boolean;
    name?: string;
    company?: string;
    memberCode?: string;
    phone?: string;
    email?: string;
    message?: string;
    reference?: string;
  } | null>(null);

  // Account creation state on approved status
  const [accountForm, setAccountForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    revenue: "10 - 50 Tỷ VNĐ",
  });

  // Restore remembered phone from local storage when modal opens
  useEffect(() => {
    if (modalOpen && !lookupPhone) {
      try {
        const saved = localStorage.getItem("vba_last_registration");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.phone) {
            setLookupPhone(parsed.phone);
            if (!formData.phone) {
              setFormData((prev) => ({
                ...prev,
                fullName: parsed.fullName || prev.fullName,
                phone: parsed.phone,
                email: parsed.email || prev.email,
                company: parsed.company || prev.company,
              }));
            }
          }
        }
      } catch {}
    }
  }, [modalOpen]);

  const performStatusCheck = async (phoneToCheck: string, emailToCheck = "", refCodeFallback = "", silent = false) => {
    const raw = phoneToCheck.trim();
    if (!raw) {
      if (!silent) toast.error("Vui lòng nhập số điện thoại cần tra cứu");
      return;
    }
    if (!silent) setCheckingStatus(true);
    try {
      const res = await checkClubRegistrationStatus({
        data: {
          phone: raw,
          email: emailToCheck.trim() || undefined,
        },
      });

      if (res && res.found) {
        const wasNotApproved = !statusResult?.isApproved;
        setStatusResult({
          ...res,
          reference: refCodeFallback || (res as any).reference || `MB-${raw.slice(-4)}`,
        });
        if (res.isApproved) {
          if (wasNotApproved && silent) {
            toast.success("🎉 Hồ sơ của Quý CEO đã được Ban Thư Ký CLB CEO 1983 phê duyệt thành công!");
          }
          setAccountForm((prev) => ({
            ...prev,
            username: prev.username || raw,
          }));
        }
      } else {
        // If not found in members table yet, treat freshly submitted application as pending
        setStatusResult({
          found: true,
          status: "pending",
          isApproved: false,
          name: formData.fullName || "Quý CEO",
          company: formData.company || "Doanh nghiệp thành viên",
          phone: raw,
          reference: refCodeFallback || `APP-${raw.slice(-4)}`,
          message: "Hồ sơ đã được tiếp nhận và đang trong quá trình thẩm định của Ban Thư Ký CLB CEO 1983.",
        });
      }
    } catch {
      if (!silent) {
        setStatusResult({
          found: true,
          status: "pending",
          isApproved: false,
          name: formData.fullName || "Quý CEO",
          company: formData.company || "Doanh nghiệp thành viên",
          phone: raw,
          reference: refCodeFallback || `APP-${raw.slice(-4)}`,
          message: "Hồ sơ đang chờ thẩm định từ Ban Thư Ký CLB.",
        });
      }
    } finally {
      if (!silent) setCheckingStatus(false);
    }
  };

  // Tự động reload / poll trạng thái phê duyệt hồ sơ mỗi 4s khi đang mở tab trạng thái
  useEffect(() => {
    if (!modalOpen || modalTab !== "status" || !lookupPhone.trim() || statusResult?.isApproved) {
      return;
    }
    const interval = setInterval(() => {
      void performStatusCheck(lookupPhone.trim(), formData.email || "", statusResult?.reference || "", true);
    }, 4000);
    return () => clearInterval(interval);
  }, [modalOpen, modalTab, lookupPhone, statusResult?.isApproved, statusResult?.reference, formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.company.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitClubApplication({
        data: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || "",
          company: formData.company.trim(),
          title: formData.title?.trim() || "Chủ tịch / CEO",
          revenue: formData.revenue,
          industry: "Thành viên gia nhập trực tuyến",
          clubSlug: "ceo-1983",
        },
      });

      const refCode = res?.reference || `APP-MB${Date.now().toString(36).toUpperCase()}`;

      // Save to localStorage for quick retrieval
      try {
        localStorage.setItem(
          "vba_last_registration",
          JSON.stringify({
            phone: formData.phone.trim(),
            email: formData.email?.trim() || "",
            fullName: formData.fullName.trim(),
            company: formData.company.trim(),
            refCode,
            date: new Date().toISOString(),
          })
        );
      } catch {}

      toast.success("Nộp hồ sơ thành công!");

      // Set phone for lookup and immediately switch to Status tab (DO NOT CLOSE MODAL)
      setLookupPhone(formData.phone.trim());
      setAccountForm((prev) => ({
        ...prev,
        username: formData.phone.trim(),
      }));

      // Switch to status tab to show 3-state display
      setModalTab("status");

      // Check real-time status
      void performStatusCheck(formData.phone.trim(), formData.email?.trim() || "", refCode);
    } catch {
      toast.error("Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = accountForm.username.trim();
    if (!uname || !accountForm.password) {
      toast.error("Vui lòng điền tên đăng nhập và mật khẩu");
      return;
    }
    if (accountForm.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (accountForm.password !== accountForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setCreatingAccount(true);
    try {
      // 1. Call Register
      try {
        await fetchNestApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: uname,
            password: accountForm.password,
            name: statusResult?.name || formData.fullName,
            phone: statusResult?.phone || formData.phone,
          }),
        });
      } catch (regErr: any) {
        // If user already exists, proceed
        console.log("Register note:", regErr?.message);
      }

      // 2. Chuyển hướng bắt buộc qua bước đăng nhập, không tự động đi thẳng vào app
      toast.success("🎉 Tạo tài khoản thành công! Quý CEO vui lòng đăng nhập để vào App Hiệp Hội.");
      setModalOpen(false);
      navigate({
        to: "/association/login" as any,
        search: { username: uname, registered: "true" } as any,
      });
    } catch (err: any) {
      toast.error(err?.message || "Đăng ký tài khoản không thành công. Vui lòng thử lại.");
    } finally {
      setCreatingAccount(false);
    }
  };

  // Scroll spy to update active scene
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      for (const item of SCENE_MENU) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveScene(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToScene = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#f8fbff] text-slate-900 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900 font-sans">
      {/* ===================================================================== */}
      {/* FLOATING HEADER (MINIMAL, TRANSPARENT GLASS)                          */}
      {/* ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none transition-all duration-300">
        <div className="flex items-center gap-3 pointer-events-auto backdrop-blur-md bg-white/40 px-4 py-2 rounded-full border border-white/60 shadow-xs">
          <img
            src="/ceo1983-official-logo.png"
            alt="CLB CEO 1983"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <span className="text-xs font-black tracking-widest text-[#003B95] uppercase hidden sm:inline-block">
            CEO 1983 • HANOIBA
          </span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            to="/association"
            className="text-xs font-bold text-slate-700 hover:text-[#003B95] backdrop-blur-md bg-white/40 px-4 py-2 rounded-full border border-white/60 shadow-xs transition"
          >
            Cổng Hội Viên
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95 uppercase tracking-wider"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Gia Nhập CLB</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* FLOATING MINIMAL SCENE NAVIGATOR (SIDEBAR SCROLL SPY)                  */}
      {/* ===================================================================== */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 pointer-events-auto backdrop-blur-md bg-black/10 hover:bg-black/20 p-2.5 rounded-full border border-white/30 transition-all duration-300">
        {SCENE_MENU.map((scene) => {
          const isActive = activeScene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => scrollToScene(scene.id)}
              className="group relative flex items-center justify-end cursor-pointer"
              title={scene.label}
            >
              <span
                className={`absolute right-7 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider whitespace-nowrap transition-all duration-300 pointer-events-none shadow-md ${
                  isActive
                    ? "opacity-100 translate-x-0 bg-slate-900 text-white"
                    : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white/90 text-slate-800"
                }`}
              >
                {scene.num}. {scene.label}
              </span>
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "scale-150 bg-amber-400 ring-4 ring-amber-400/30"
                    : "bg-white/60 group-hover:bg-white"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* ===================================================================== */}
      {/* SCENE 01 — SKY                                                        */}
      {/* ===================================================================== */}
      <section
        id="scene-sky"
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#bde0fe] via-[#d0e8ff] to-[#e8f4fd]"
      >
        {/* Celestial Sunlight ☀️ with Volumetric God Rays */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-radial from-amber-200/90 via-amber-100/40 to-transparent blur-3xl" />
          <div className="absolute inset-[20%] rounded-full bg-radial from-white via-amber-200/60 to-transparent blur-2xl animate-pulse" style={{ animationDuration: "5s" }} />
          {/* Radial God Rays */}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,247,237,0.8)_0%,transparent_70%)] opacity-80"
            style={{
              maskImage: "repeating-conic-gradient(from 0deg, #000 0deg 15deg, transparent 15deg 30deg)",
              WebkitMaskImage: "repeating-conic-gradient(from 0deg, #000 0deg 15deg, transparent 15deg 30deg)",
            }}
          />
        </div>

        {/* Volumetric Layered Clouds ☁️ with Drifting Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Distant Upper Clouds */}
          <motion.div
            initial={{ x: "-5%" }}
            animate={{ x: "5%" }}
            transition={{ duration: 35, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute -top-10 left-[-10%] w-[120%] h-[320px] opacity-40 blur-xl bg-gradient-to-b from-white via-white/80 to-transparent rounded-[100%]"
          />
          {/* Foreground Left Cloud Bank */}
          <motion.div
            initial={{ x: "-4%", y: "0%" }}
            animate={{ x: "4%", y: "-2%" }}
            transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-[35%] -left-[15%] w-[55%] h-[280px] opacity-75 blur-2xl bg-radial from-white via-white/60 to-transparent rounded-[50%]"
          />
          {/* Foreground Right Cloud Bank */}
          <motion.div
            initial={{ x: "4%", y: "0%" }}
            animate={{ x: "-4%", y: "2%" }}
            transition={{ duration: 28, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-[45%] -right-[15%] w-[60%] h-[300px] opacity-70 blur-2xl bg-radial from-white via-white/50 to-transparent rounded-[50%]"
          />
        </div>

        {/* Floating Atmospheric Hero Text (Large Negative Space, No Cards) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-xs mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#003B95] uppercase">
              HANOIBA • CỘNG ĐỒNG DOANH NHÂN QUÝ HỢI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#002766] uppercase leading-[1.1] drop-shadow-xs"
          >
            GẮN KẾT BỀN VỮNG
            <span className="block mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500">
              HỢP LỰC DOANH NHÂN
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="mt-8 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Hành trình hội tụ bản lĩnh và khát vọng của thế hệ doanh nhân 1983.
            Cùng nhau tạo dựng liên minh kinh doanh vững mạnh, vươn tầm quốc tế.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="mt-14 flex flex-col items-center justify-center gap-2 cursor-pointer"
            onClick={() => scrollToScene("scene-birds")}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#003B95] font-bold">
              Cuộn xuống để du hành
            </span>
            <ChevronDown className="w-5 h-5 text-[#003B95] animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCENE 02 — BIRDS                                                      */}
      {/* ===================================================================== */}
      <section
        id="scene-birds"
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#e8f4fd] via-[#d6ecfd] to-[#c7e5fc]"
      >
        {/* Dynamic Flock of Birds Flying Across Screen with 3D Parallax & Depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Foreground Large Birds (Gliding Across Top-Right) */}
          <motion.div
            initial={{ x: "-20vw", y: "30vh", scale: 1.2, opacity: 0.9 }}
            whileInView={{ x: "120vw", y: "15vh", scale: 1.3, opacity: 0.95 }}
            viewport={{ once: false }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
            className="absolute top-0 left-0 w-24 h-12"
          >
            <svg viewBox="0 0 100 40" className="w-full h-full fill-slate-700/80 drop-shadow-md">
              <path d="M0 20 Q 25 5, 50 20 Q 75 5, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z">
                <animate
                  attributeName="d"
                  dur="1.2s"
                  repeatCount="indefinite"
                  values="
                    M0 20 Q 25 5, 50 20 Q 75 5, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z;
                    M0 10 Q 25 25, 50 18 Q 75 25, 100 10 Q 75 18, 50 24 Q 25 18, 0 10 Z;
                    M0 20 Q 25 5, 50 20 Q 75 5, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z
                  "
                />
              </path>
            </svg>
          </motion.div>

          {/* Main Midground Flock (V-Formation Gliding Across Center) */}
          {[
            { delay: 0, top: "25%", speed: 22, size: "w-16 h-8", opacity: 0.75 },
            { delay: 1.2, top: "28%", speed: 22, size: "w-14 h-7", opacity: 0.7 },
            { delay: 2.4, top: "23%", speed: 22, size: "w-14 h-7", opacity: 0.7 },
            { delay: 3.6, top: "31%", speed: 22, size: "w-12 h-6", opacity: 0.65 },
            { delay: 4.8, top: "21%", speed: 22, size: "w-12 h-6", opacity: 0.65 },
            { delay: 6.0, top: "34%", speed: 22, size: "w-10 h-5", opacity: 0.6 },
          ].map((bird, idx) => (
            <motion.div
              key={idx}
              initial={{ x: "-15vw", y: "0vh" }}
              whileInView={{ x: "115vw", y: "-5vh" }}
              viewport={{ once: false }}
              transition={{
                duration: bird.speed,
                delay: bird.delay,
                ease: "linear",
                repeat: Infinity,
              }}
              className={`absolute ${bird.size}`}
              style={{ top: bird.top, opacity: bird.opacity }}
            >
              <svg viewBox="0 0 100 40" className="w-full h-full fill-slate-800">
                <path d="M0 20 Q 25 6, 50 20 Q 75 6, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z">
                  <animate
                    attributeName="d"
                    dur="0.9s"
                    repeatCount="indefinite"
                    values="
                      M0 20 Q 25 6, 50 20 Q 75 6, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z;
                      M0 12 Q 25 24, 50 18 Q 75 24, 100 12 Q 75 18, 50 24 Q 25 18, 0 12 Z;
                      M0 20 Q 25 6, 50 20 Q 75 6, 100 20 Q 75 14, 50 22 Q 25 14, 0 20 Z
                    "
                  />
                </path>
              </svg>
            </motion.div>
          ))}

          {/* Distant Horizon Flock (Tiny silhouettes) */}
          <motion.div
            initial={{ x: "110vw" }}
            whileInView={{ x: "-20vw" }}
            viewport={{ once: false }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            className="absolute top-[58%] w-48 h-8 flex gap-3 opacity-40 blur-[0.5px]"
          >
            {[...Array(6)].map((_, i) => (
              <svg key={i} viewBox="0 0 50 20" className="w-6 h-3 fill-slate-600">
                <path d="M0 10 Q 12 3, 25 10 Q 37 3, 50 10 Q 37 8, 25 12 Q 12 8, 0 10 Z" />
              </svg>
            ))}
          </motion.div>
        </div>

        {/* Cinematic Atmospheric Text Floating in Space (NO KPI Cards) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-xs mb-6"
          >
            <Users className="w-3.5 h-3.5 text-[#003B95]" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#003B95] uppercase">
              KHÔNG GIAN LIÊN MINH
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-[#002766] uppercase tracking-tight leading-tight"
          >
            HỘI TỤ TINH HOA
            <span className="block mt-2 text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-600">
              SỨC MẠNH LIÊN MINH DOANH NHÂN
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Như đàn chim sải cánh hướng về một chân trời chung, hơn 200 Chủ tịch &amp; Tổng Giám đốc
            cùng thế hệ kết nối chặt chẽ, tạo nên luồng gió sức mạnh nâng tầm toàn khối doanh nghiệp.
          </motion.p>

          {/* Pure Organic Typography Metrics Floating in Space (No Boxes, No Cards) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-slate-800"
          >
            <div className="text-center">
              <span className="block text-3xl sm:text-5xl font-black text-[#003B95] tracking-tight">200+</span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-600 uppercase mt-1 block">
                Chủ Tịch &amp; C-Level
              </span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-400/40" />
            <div className="text-center">
              <span className="block text-3xl sm:text-5xl font-black text-amber-600 tracking-tight">&gt;5.000 Tỷ</span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-600 uppercase mt-1 block">
                Quy Mô Giao Thương
              </span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-400/40" />
            <div className="text-center">
              <span className="block text-3xl sm:text-5xl font-black text-[#003B95] tracking-tight">+35%</span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-600 uppercase mt-1 block">
                Tăng Trưởng Thường Niên
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCENE 03 — KITES (TUYỆT ĐỐI CẤM DÙNG TỪ "DIỀU" TRONG TEXT)             */}
      {/* ===================================================================== */}
      <section
        id="scene-kites"
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#c7e5fc] via-[#b6ddfc] to-[#a3d3fb]"
      >
        {/* Dynamic High-Flying Kites with 3D Fluttering Ribbons & Taut Strings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Soaring Primary Kite (Upper Center-Right, Gold & Ivory Diamond) */}
          <motion.div
            initial={{ y: "15px", rotate: -3 }}
            animate={{ y: "-20px", rotate: 4 }}
            transition={{ duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-[18%] right-[18%] w-36 h-48 sm:w-48 sm:h-64 filter drop-shadow-xl"
          >
            {/* Kite Body Diamond */}
            <svg viewBox="0 0 100 140" className="w-full h-full">
              <defs>
                <linearGradient id="kiteGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="kiteGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopColorOpacity="0.9" />
                  <stop offset="100%" stopColor="#E0F2FE" stopColorOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* Left Wing Facet */}
              <polygon points="50,10 10,65 50,110" fill="url(#kiteGrad1)" />
              {/* Right Wing Facet */}
              <polygon points="50,10 90,65 50,110" fill="url(#kiteGrad2)" />
              {/* Central Cross Frame */}
              <line x1="50" y1="10" x2="50" y2="110" stroke="#78350F" strokeWidth="1.5" />
              <line x1="10" y1="65" x2="90" y2="65" stroke="#78350F" strokeWidth="1.5" />
              {/* Fluttering Long Silk Tail Ribbons */}
              <path
                d="M50 110 Q 40 140, 60 170 T 45 220 T 65 270 T 50 320"
                fill="none"
                stroke="#D97706"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  dur="2.5s"
                  repeatCount="indefinite"
                  values="
                    M50 110 Q 40 140, 60 170 T 45 220 T 65 270 T 50 320;
                    M50 110 Q 65 140, 35 170 T 60 220 T 40 270 T 55 320;
                    M50 110 Q 40 140, 60 170 T 45 220 T 65 270 T 50 320
                  "
                />
              </path>
              {/* Fine Kite String Reaching Far Below */}
              <line x1="50" y1="75" x2="-80" y2="500" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            </svg>
          </motion.div>

          {/* Distant High Kite (Upper Left, Azure & Coral) */}
          <motion.div
            initial={{ y: "-10px", rotate: 5 }}
            animate={{ y: "15px", rotate: -4 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-[14%] left-[15%] w-24 h-32 opacity-70 filter drop-shadow-md"
          >
            <svg viewBox="0 0 100 140" className="w-full h-full">
              <polygon points="50,10 15,65 50,110" fill="#0284C7" />
              <polygon points="50,10 85,65 50,110" fill="#38BDF8" />
              <line x1="50" y1="10" x2="50" y2="110" stroke="#0C4A6E" strokeWidth="1" />
              <line x1="15" y1="65" x2="85" y2="65" stroke="#0C4A6E" strokeWidth="1" />
              <path
                d="M50 110 Q 35 135, 55 160 T 40 195 T 50 230"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
              >
                <animate
                  attributeName="d"
                  dur="3s"
                  repeatCount="indefinite"
                  values="
                    M50 110 Q 35 135, 55 160 T 40 195 T 50 230;
                    M50 110 Q 60 135, 40 160 T 55 195 T 45 230;
                    M50 110 Q 35 135, 55 160 T 40 195 T 50 230
                  "
                />
              </path>
              <line x1="50" y1="75" x2="180" y2="480" stroke="#CBD5E1" strokeWidth="0.6" opacity="0.5" />
            </svg>
          </motion.div>

          {/* Deep Background Micro Kite (Center Distant Horizon) */}
          <motion.div
            initial={{ y: "5px" }}
            animate={{ y: "-8px" }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-[32%] left-[48%] w-10 h-14 opacity-50"
          >
            <svg viewBox="0 0 100 140" className="w-full h-full">
              <polygon points="50,10 20,65 50,110" fill="#EA580C" />
              <polygon points="50,10 80,65 50,110" fill="#FDBA74" />
            </svg>
          </motion.div>
        </div>

        {/* Majestic Floating Text (STRICT: NO WORDS "DIỀU" / "CÁ") */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-xs mb-6"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#003B95] uppercase">
              TẦM NHÌN THẾ HỆ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-[#002766] uppercase tracking-tight leading-tight"
          >
            KHÁT VỌNG VƯƠN TẦM
            <span className="block mt-2 text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-600">
              BỨT PHÁ MỌI GIỚI HẠN
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Càng đón gió lớn của thời đại, bản lĩnh doanh nhân càng vươn cao kiêu hãnh.
            Mỗi thành viên là một điểm tựa vững vàng, cùng nhau chinh phục những đỉnh cao mới
            trong kỷ nguyên kinh tế số và hội nhập toàn cầu.
          </motion.p>

          {/* Delicate Celestial Value Constellations (No 4 Cards) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            {[
              "Tín Nhiệm Danh Dự",
              "Giao Thương Thực Chất",
              "Tiên Phong Công Nghệ",
              "Phụng Sự Cộng Đồng",
            ].map((pillar, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-xs border border-white/60 text-xs font-bold text-[#003B95] uppercase tracking-wider"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{pillar}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCENE 04 — VILLAS (VILLAS OCCUPY ONLY 20-25% BOTTOM; 75-80% IS SKY)   */}
      {/* ===================================================================== */}
      <section
        id="scene-villas"
        className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#a3d3fb] via-[#8fc4f7] to-[#7db4f0]"
      >
        {/* Upper 75-80% Sky / Atmospheric Space with Typography */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-28 sm:pt-36">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-xs mb-6"
          >
            <Building2 className="w-3.5 h-3.5 text-[#003B95]" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#003B95] uppercase">
              CƠ NGHIỆP TRƯỜNG TỒN
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-[#002766] uppercase tracking-tight leading-tight"
          >
            KIẾN TẠO VỊ THẾ
            <span className="block mt-2 text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-700">
              NỀN TẢNG THỊNH VƯỢNG BỀN LÂU
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Không gian của những giá trị trường tồn. Nơi hội tụ các tập đoàn đa ngành dẫn dắt
            nền kinh tế, kiến tạo chuỗi giá trị khép kín và dựng xây cơ nghiệp bền vững cho thế hệ tương lai.
          </motion.p>
        </div>

        {/* Lower 20-25% Horizon: Authentic Architectural Luxury Villa Landscape */}
        <div className="relative w-full h-[22vh] sm:h-[25vh] overflow-hidden">
          {/* Subtle Warm Atmospheric Glow at Horizon */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-100/30 to-transparent pointer-events-none" />

          {/* Panoramic Luxury Modern Villa Landscape SVG Silhouette with Warm Interior Lights */}
          <svg
            viewBox="0 0 1600 280"
            preserveAspectRatio="none"
            className="w-full h-full object-cover select-none"
          >
            <defs>
              <linearGradient id="villaWall" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" stopColorOpacity="0.9" />
                <stop offset="100%" stopColor="#F59E0B" stopColorOpacity="0.75" />
              </linearGradient>
              <linearGradient id="lawnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#0F1E36" />
              </linearGradient>
            </defs>

            {/* Horizon Lawns & Foundations */}
            <rect x="0" y="220" width="1600" height="60" fill="url(#lawnGrad)" />

            {/* Villa Complex 1 (Left Wing Modernist Cantilever) */}
            <g>
              {/* Foundation deck */}
              <rect x="60" y="200" width="340" height="25" fill="#334155" />
              {/* Ground floor glass pavilion */}
              <rect x="80" y="140" width="160" height="60" fill="url(#windowGlow)" opacity="0.85" />
              {/* Mullions */}
              <line x1="120" y1="140" x2="120" y2="200" stroke="#0F172A" strokeWidth="3" />
              <line x1="160" y1="140" x2="160" y2="200" stroke="#0F172A" strokeWidth="3" />
              <line x1="200" y1="140" x2="200" y2="200" stroke="#0F172A" strokeWidth="3" />
              {/* Solid upper block */}
              <rect x="70" y="80" width="320" height="60" fill="url(#villaWall)" />
              {/* Upper ribbon window */}
              <rect x="100" y="95" width="220" height="25" fill="url(#windowGlow)" opacity="0.9" />
              {/* Cantilever roofline */}
              <rect x="50" y="70" width="360" height="10" fill="#475569" />
              {/* Minimalist garden trees */}
              <circle cx="430" cy="180" r="28" fill="#14532D" opacity="0.8" />
              <rect x="428" y="180" width="4" height="40" fill="#0F172A" />
            </g>

            {/* Villa Complex 2 (Center Grand Masterpiece Pavilion) */}
            <g>
              <rect x="540" y="190" width="520" height="30" fill="#334155" />
              {/* Dual level glass architecture */}
              <rect x="580" y="120" width="440" height="70" fill="url(#windowGlow)" opacity="0.9" />
              {/* Vertical architectural fins */}
              {[620, 660, 700, 740, 780, 820, 860, 900, 940, 980].map((x, i) => (
                <line key={i} x1={x} y1="120" x2={x} y2="190" stroke="#0F172A" strokeWidth="4" />
              ))}
              {/* Floating cantilever roof */}
              <rect x="520" y="110" width="560" height="12" fill="#64748B" />
              {/* Modern penthouse tier */}
              <rect x="660" y="60" width="280" height="50" fill="url(#villaWall)" />
              <rect x="700" y="70" width="200" height="30" fill="url(#windowGlow)" opacity="0.95" />
              <rect x="640" y="50" width="320" height="10" fill="#94A3B8" />
              {/* Infinity pool glass edge in front of center villa */}
              <rect x="600" y="215" width="400" height="8" fill="#38BDF8" opacity="0.9" />
            </g>

            {/* Villa Complex 3 (Right Wing Luxury Estate) */}
            <g>
              <rect x="1180" y="195" width="360" height="25" fill="#334155" />
              <rect x="1200" y="130" width="320" height="65" fill="url(#windowGlow)" opacity="0.8" />
              <rect x="1190" y="75" width="340" height="55" fill="url(#villaWall)" />
              <rect x="1230" y="90" width="180" height="25" fill="url(#windowGlow)" opacity="0.9" />
              <rect x="1170" y="65" width="380" height="10" fill="#475569" />
              <circle cx="1140" cy="175" r="32" fill="#14532D" opacity="0.8" />
              <rect x="1138" y="175" width="4" height="45" fill="#0F172A" />
            </g>
          </svg>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCENE 05 — WATER (GIANT INFINITY POOL & DIVE-THROUGH TRANSITION)       */}
      {/* ===================================================================== */}
      <section
        id="scene-water"
        className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#7db4f0] via-[#38bdf8] to-[#0284c7]"
      >
        {/* Floating Atmospheric Typography (NO Cards in Center) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-28 sm:pt-36">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#003B95]" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#003B95] uppercase">
              TÂM THỨC DOANH NHÂN
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-[#002766] uppercase tracking-tight leading-tight"
          >
            TÂM THỨC TRẦM LẮNG
            <span className="block mt-2 text-xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-md">
              BẢN LĨNH ĐƯƠNG ĐẦU MỌI THỬ THÁCH
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-900 max-w-2xl mx-auto font-semibold leading-relaxed"
          >
            Mặt nước phẳng lặng phản chiếu sự kiên định của người lãnh đạo.
            Trước khi mở ra đại dương lớn, mọi quyết sách đều được đúc kết từ chiều sâu tư duy
            và sự trầm tĩnh chiến lược.
          </motion.p>
        </div>

        {/* Colossal Infinity Pool Surface with Caustics & Gentle Waves */}
        <div className="relative w-full h-[45vh] overflow-hidden flex flex-col justify-end">
          {/* Animated Water Mesh Surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/40 via-[#0284c7]/80 to-[#0369a1]">
            {/* Water Caustics Shimmer */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-overlay animate-pulse"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 60%)",
                backgroundSize: "80px 40px",
              }}
            />

            {/* Ripple Wave SVG Curves */}
            <svg
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              className="absolute bottom-0 w-full h-48 opacity-70"
            >
              <path
                fill="#0284c7"
                d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,165.3C672,160,768,192,864,202.7C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              >
                <animate
                  attributeName="d"
                  dur="8s"
                  repeatCount="indefinite"
                  values="
                    M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,165.3C672,160,768,192,864,202.7C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z;
                    M0,140L48,150C96,170,192,200,288,205C384,210,480,190,576,180C672,170,768,180,864,195C960,210,1056,190,1152,170C1248,150,1344,140,1392,130L1440,120L1440,320L0,320Z;
                    M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,165.3C672,160,768,192,864,202.7C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z
                  "
                />
              </path>
            </svg>
          </div>

          {/* CRITICAL TRANSITION: SUBMERGE THROUGH WATER SURFACE */}
          <div className="relative z-20 w-full text-center pb-8 flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/90 font-black drop-shadow-md">
              Lặn xuyên qua mặt nước vào đại dương số
            </span>
            <ChevronDown className="w-6 h-6 text-white animate-bounce mt-2 drop-shadow-md" />
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCENE 06 — UNDERWATER (OCEAN DEPTHS, 3D SHARKS, LEADERSHIP BEACONS)   */}
      {/* STRICT: TUYỆT ĐỐI CẤM DÙNG TỪ "CÁ", "CÁ MẬP" TRONG TEXT               */}
      {/* ===================================================================== */}
      <section
        id="scene-underwater"
        className="relative min-h-[220vh] w-full flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#0369a1] via-[#041c32] via-[40%] via-[#021324] to-[#010912] text-white"
      >
        {/* Ocean Atmosphere: Light Rays from Surface Above */}
        <div className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 left-1/4 w-[400px] h-[800px] bg-gradient-to-b from-cyan-200/30 via-cyan-400/10 to-transparent transform -rotate-12 blur-2xl"
          />
          <div
            className="absolute -top-20 right-1/4 w-[500px] h-[900px] bg-gradient-to-b from-amber-200/20 via-cyan-300/10 to-transparent transform rotate-15 blur-2xl"
          />
        </div>

        {/* Floating Ocean Particles / Bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", opacity: 0 }}
              animate={{ y: "-10vh", opacity: [0, 0.7, 0] }}
              transition={{
                duration: 12 + (i % 8) * 2,
                repeat: Infinity,
                delay: (i % 6) * 1.5,
                ease: "linear",
              }}
              className="absolute rounded-full bg-cyan-200/40 backdrop-blur-xs border border-white/40"
              style={{
                width: 4 + (i % 4) * 3,
                height: 4 + (i % 4) * 3,
                left: `${(i * 4.2) % 96}%`,
              }}
            />
          ))}
        </div>

        {/* 3D SHARKS SWIMMING WITH DEPTH & FLUID TAIL MOVEMENT (VISUAL ONLY) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Alpha Apex Shark 1 (Foreground, Sleek Predatory Silhouette Swimming Across) */}
          <motion.div
            initial={{ x: "-30vw", y: "45vh", scale: 1 }}
            whileInView={{ x: "125vw", y: "55vh", scale: 1.1 }}
            viewport={{ once: false }}
            transition={{ duration: 24, ease: "linear", repeat: Infinity }}
            className="absolute top-0 left-0 w-80 h-36 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] opacity-90"
          >
            <svg viewBox="0 0 400 160" className="w-full h-full fill-[#0A2540]">
              {/* Shark Torso, Dorsal Fin & Tail */}
              <path d="M20,80 Q 90,40 180,50 L 220,10 L 235,55 Q 310,65 370,80 L 395,50 L 385,85 L 398,115 L 365,95 Q 310,105 230,110 L 190,135 L 180,108 Q 100,115 20,80 Z" />
              {/* Pectoral Fin */}
              <polygon points="170,85 130,135 155,130" fill="#061826" />
              {/* Subtle Ambient Light Shimmer on Shark Back */}
              <path
                d="M30,80 Q 90,45 180,52 Q 280,65 360,82"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                opacity="0.4"
              />
            </svg>
          </motion.div>

          {/* Deep Ocean Shark 2 (Midground, Turning Smoothly in Deep Blue) */}
          <motion.div
            initial={{ x: "120vw", y: "85vh", scale: 0.65 }}
            whileInView={{ x: "-25vw", y: "78vh", scale: 0.65 }}
            viewport={{ once: false }}
            transition={{ duration: 32, ease: "linear", repeat: Infinity, delay: 4 }}
            className="absolute top-0 left-0 w-64 h-28 opacity-60 filter blur-[0.8px]"
          >
            <svg viewBox="0 0 400 160" className="w-full h-full fill-[#031320] transform scale-x-[-1]">
              <path d="M20,80 Q 90,40 180,50 L 220,10 L 235,55 Q 310,65 370,80 L 395,50 L 385,85 L 398,115 L 365,95 Q 310,105 230,110 L 190,135 L 180,108 Q 100,115 20,80 Z" />
            </svg>
          </motion.div>
        </div>

        {/* TOP SECTION OF UNDERWATER: THE INITIATION */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 backdrop-blur-md border border-cyan-500/40 shadow-xs mb-6 text-cyan-300"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase">
              BẢN LĨNH TIÊN PHONG
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-lg"
          >
            ĐẠI DƯƠNG SỐ
            <span className="block mt-2 text-xl sm:text-3xl md:text-4xl font-extrabold text-cyan-400">
              VỊ THẾ DẪN ĐẦU THỊ TRƯỜNG
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Giữa biển lớn kinh tế nhiều biến động, bản lĩnh và kinh nghiệm thực chiến của người thuyền trưởng
            là kim chỉ nam định hình tương lai doanh nghiệp.
          </motion.p>
        </div>

        {/* MONOLITHIC LUMINOUS LEADERSHIP FIGURES (NOT PROFILE CARDS) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-amber-400 uppercase">
              BAN LÃNH ĐẠO TIÊN PHONG • CLB CEO 1983
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase mt-2">
              NHỮNG CỘT TRỤ BẢN LĨNH
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {LEADERSHIP_MEMBERS.map((leader, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 1, delay: idx * 0.15 }}
                className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-white/5 via-white/[0.02] to-transparent border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition-all duration-500 hover:-translate-y-2"
              >
                {/* Luminous Aura Beacon behind Leader */}
                <div className="absolute -top-4 w-32 h-32 rounded-full bg-cyan-400/10 group-hover:bg-amber-400/20 blur-2xl transition-all duration-500" />

                {/* Monolithic Portrait / Emblem */}
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400/60 to-cyan-400/60 mb-5 shadow-lg shadow-black/60">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-1">
                  {leader.role}
                </span>
                <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  {leader.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">{leader.company}</p>
                <div className="w-8 h-px bg-white/20 my-3 group-hover:w-16 group-hover:bg-amber-400 transition-all" />
                <p className="text-xs text-slate-300 italic font-normal leading-relaxed">
                  "{leader.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION: UNDERWATER CALMS DOWN -> SACRED BRAND MESSAGE -> MASTER CTA */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center pt-24 pb-36">
          {/* Water Calming Ethereal Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.4 }}
            className="space-y-6"
          >
            <span className="text-xs font-mono font-black tracking-[0.3em] text-amber-400 uppercase">
              THÔNG ĐIỆP THƯƠNG HIỆU
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
              GẮN KẾT BỀN — PHÁT TRIỂN VỮNG
            </h2>

            <p className="text-base sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Liên minh thế hệ doanh nhân 1983 vững bước giữa đại dương số.
              Đồng hành kiến tạo giá trị thực chất và vị thế tự hào của doanh nhân Việt.
            </p>

            {/* MASTER CTA BUTTON */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-black text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all duration-300 cursor-pointer active:scale-95 uppercase tracking-wider"
              >
                <Crown className="w-5 h-5 text-slate-900" />
                <span>Nộp Hồ Sơ Gia Nhập Liên Minh</span>
                <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/association"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Vào Cổng Hội Viên CEO 1983</span>
              </Link>
            </div>

            <div className="pt-4 text-xs text-slate-400 font-mono">
              ★ 100% Thẩm định tín nhiệm chuẩn mực HanoiBA • Cấp thẻ Titanium VIP NFC
            </div>
          </motion.div>
        </div>

        {/* Minimalist Submerged Footer */}
        <div className="relative z-10 w-full border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500">
          <p>© 2026 CLB Doanh Nhân CEO 1983 • HanoiBA. Bảo lưu mọi quyền.</p>
          <p className="text-amber-400/80 mt-1 font-mono">Khẩu hiệu: Gắn kết bền — Phát triển vững</p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* MODAL NỘP HỒ SƠ HỘI VIÊN VIP (PRESERVED FUNCTIONALITY)                */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-400/30 overflow-hidden text-slate-900"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                      CỔNG HỘI VIÊN CEO 1983
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-semibold">
                      Hội Doanh Nhân Trẻ Hà Nội • HanoiBA
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-100/70 p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalTab("apply")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalTab === "apply"
                      ? "bg-white text-[#003B95] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Đăng Ký Hồ Sơ VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalTab("status");
                    if (lookupPhone && !statusResult) {
                      void performStatusCheck(lookupPhone);
                    }
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalTab === "status"
                      ? "bg-white text-[#003B95] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Trạng Thái & Kích Hoạt</span>
                </button>
              </div>

              {/* TAB 1: FORM NỘP HỒ SƠ */}
              {modalTab === "apply" && (
                <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto [scrollbar-width:thin]">
                  <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-900 leading-snug font-medium">
                      Hồ sơ gia nhập CLB Doanh Nhân CEO 1983 sẽ được chuyển trực tiếp tới hệ thống CRM &amp; Hội đồng Thẩm định của HanoiBA.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        Họ và tên Chủ tịch / CEO *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0988 888 888"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ceo@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Tên doanh nghiệp *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Tập đoàn / Công ty..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Chức danh</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Chủ tịch HĐQT / CEO"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        Doanh thu bình quân hàng năm
                      </label>
                      <select
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#003B95]"
                      >
                        <option value="Dưới 10 Tỷ VNĐ">Dưới 10 Tỷ VNĐ</option>
                        <option value="10 - 50 Tỷ VNĐ">10 - 50 Tỷ VNĐ</option>
                        <option value="50 - 200 Tỷ VNĐ">50 - 200 Tỷ VNĐ</option>
                        <option value="Trên 200 Tỷ VNĐ">Trên 200 Tỷ VNĐ</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 active:scale-95 transition shadow-lg shadow-amber-500/25 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Đang gửi hồ sơ lên CRM...</span>
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4" />
                            <span>Xác Nhận Nộp Hồ Sơ VIP</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setModalTab("status");
                          if (formData.phone) {
                            setLookupPhone(formData.phone);
                            void performStatusCheck(formData.phone);
                          }
                        }}
                        className="text-[11.5px] font-bold text-[#003B95] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Đã nộp hồ sơ trước đó? Tra cứu trạng thái tại đây</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: TRA CỨU TRẠNG THÁI & KÍCH HOẠT TÀI KHOẢN (3 TRẠNG THÁI) */}
              {modalTab === "status" && (
                <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto [scrollbar-width:thin] space-y-4">
                  {/* Phone Lookup Bar */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value)}
                        placeholder="Nhập số điện thoại đã đăng ký..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#003B95]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={checkingStatus}
                      onClick={() => performStatusCheck(lookupPhone)}
                      className="px-4 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#003B95]/20 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {checkingStatus ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>Tra cứu</span>
                    </button>
                  </div>

                  {/* Loading indicator */}
                  {checkingStatus && (
                    <div className="p-6 text-center text-slate-500 text-xs space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                      <p className="font-semibold">Đang kết nối hệ thống CRM đối soát hồ sơ...</p>
                    </div>
                  )}

                  {/* RESULT DISPLAY */}
                  {!checkingStatus && statusResult && (
                    <div className="space-y-4">
                      {/* ======================================================= */}
                      {/* TRẠNG THÁI 1: CHỜ PHÊ DUYỆT (PENDING)                   */}
                      {/* ======================================================= */}
                      {statusResult.status === "pending" && (
                        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-amber-800">
                            <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                            <h4 className="text-xs sm:text-sm font-black uppercase">
                              TRẠNG THÁI: ĐANG CHỜ PHÊ DUYỆT
                            </h4>
                          </div>

                          <div className="rounded-xl bg-white/80 p-3 border border-amber-200/80 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mã hồ sơ:</span>
                              <span className="font-mono font-bold text-amber-700">
                                {statusResult.reference || `APP-${statusResult.phone?.slice(-4)}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Họ và tên:</span>
                              <span className="font-bold text-slate-900">{statusResult.name || formData.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Doanh nghiệp:</span>
                              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                                {statusResult.company || formData.company}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Số điện thoại:</span>
                              <span className="font-semibold text-slate-800">{statusResult.phone}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                            {statusResult.message ||
                              "Hồ sơ của Quý CEO đã được gửi thành công đến hệ thống CRM của CLB Doanh Nhân CEO 1983. Ban Thẩm Định đang đối soát thông tin (thường hoàn tất trong 24 giờ làm việc). Quý CEO có thể bấm 'Làm mới' bất kỳ lúc nào để theo dõi kết quả."}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => performStatusCheck(lookupPhone)}
                              className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Làm mới trạng thái</span>
                            </button>
                            <a
                              href="tel:0983331983"
                              className="px-3 py-2 rounded-xl border border-amber-300 bg-white text-amber-800 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Hotline Ban Thư Ký</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* TRẠNG THÁI 2: ĐÃ PHÊ DUYỆT (APPROVED) -> ĐĂNG KÝ TK    */}
                      {/* ======================================================= */}
                      {statusResult.status === "approved" && (
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-4">
                          <div className="flex items-center gap-2 text-emerald-800">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-black uppercase">
                                🎉 HỒ SƠ ĐÃ ĐƯỢC PHÊ DUYỆT!
                              </h4>
                              <p className="text-[10.5px] text-emerald-700 font-semibold">
                                Chào mừng Quý CEO chính thức gia nhập CLB CEO 1983
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white/90 p-3 border border-emerald-200 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mã hội viên:</span>
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                {statusResult.memberCode || "M1983-VIP"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">CEO:</span>
                              <span className="font-bold text-slate-900">{statusResult.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Doanh nghiệp:</span>
                              <span className="font-semibold text-slate-800">{statusResult.company}</span>
                            </div>
                          </div>

                          {/* Account Creation Form */}
                          <form onSubmit={handleCreateAccount} className="space-y-3 pt-1">
                            <div className="border-t border-emerald-200/80 pt-3">
                              <h5 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 mb-2">
                                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                <span>KÍCH HOẠT TÀI KHOẢN APP HIỆP HỘI</span>
                              </h5>
                              <p className="text-[11px] text-slate-600 mb-3">
                                Thiết lập mật khẩu để hoàn tất tạo tài khoản và đăng nhập vào ứng dụng hội viên:
                              </p>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Tên đăng nhập / Số điện thoại
                              </label>
                              <input
                                type="text"
                                required
                                value={accountForm.username || statusResult.phone || lookupPhone}
                                onChange={(e) =>
                                  setAccountForm({ ...accountForm, username: e.target.value })
                                }
                                placeholder="0988 888 888"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#003B95]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Mật khẩu mới *
                                </label>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={accountForm.password}
                                    onChange={(e) =>
                                      setAccountForm({ ...accountForm, password: e.target.value })
                                    }
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#003B95] pr-8"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Xác nhận mật khẩu *
                                </label>
                                <input
                                  type={showPassword ? "text" : "password"}
                                  required
                                  minLength={6}
                                  value={accountForm.confirmPassword}
                                  onChange={(e) =>
                                    setAccountForm({
                                      ...accountForm,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  placeholder="Nhập lại mật khẩu"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#003B95]"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={creatingAccount}
                              className="w-full py-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-105 active:scale-95 transition shadow-lg shadow-emerald-600/25 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                              {creatingAccount ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Đang tạo tài khoản &amp; đăng nhập...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Kích Hoạt &amp; Vào App Hiệp Hội</span>
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* TRẠNG THÁI 3: CẦN BỔ SUNG / CHƯA ĐẠT (REJECTED)        */}
                      {/* ======================================================= */}
                      {statusResult.status === "rejected" && (
                        <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-rose-800">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                            <h4 className="text-xs sm:text-sm font-black uppercase">
                              HỒ SƠ CẦN BỔ SUNG THÔNG TIN
                            </h4>
                          </div>

                          <p className="text-[11.5px] text-rose-900 leading-relaxed">
                            {statusResult.message ||
                              "Hồ sơ của Quý CEO chưa đạt tiêu chuẩn phê duyệt hoặc cần bổ sung thông tin đăng ký doanh nghiệp theo quy chế HanoiBA."}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setModalTab("apply")}
                              className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <span>Chỉnh sửa &amp; Nộp lại</span>
                            </button>
                            <a
                              href="tel:0983331983"
                              className="px-3 py-2 rounded-xl border border-rose-300 bg-white text-rose-800 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Hotline Ban Thư Ký</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!checkingStatus && !statusResult && (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                      <Search className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">
                        Vui lòng nhập Số điện thoại và bấm "Tra cứu" để kiểm tra trạng thái hồ sơ.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Hoặc chuyển sang tab "Đăng Ký Hồ Sơ VIP" nếu Quý CEO chưa nộp hồ sơ gia nhập.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
