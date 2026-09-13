import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  X,
  Terminal,
  Cpu,
  Zap,
  Sun,
  Moon,
  Contrast,
  Radio,
  Eye,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// =========================================================================
// INTERACTIVE NEURAL MATRIX CANVAS (Hero 100% Canvas interactive)
// =========================================================================
function CyberNeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 2 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.3 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Connection to mouse
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180) {
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 * (1 - mdist / 180)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Move node
        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;

        if (nodes[i].x < 0 || nodes[i].x > width) nodes[i].vx *= -1;
        if (nodes[i].y < 0 || nodes[i].y > height) nodes[i].vy *= -1;

        // Draw node
        ctx.fillStyle = "#F97316";
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-45" />;
}

// TERMINAL TEXT DECODER (Hacker cipher effect)
function DecryptedText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [display, setDisplay] = useState(text);
  const chars = "0101XYZ_#@<>%*";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((c, i) => {
            if (i < iteration) return text[i];
            if (c === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{display}</span>;
}

// 5 VẤN ĐỀ - CYBER ANOMALIES
const CYBER_PROBLEMS = [
  {
    id: 1,
    title: "Thông tin phân tán",
    code: "ERR_DISPERSED_DATA",
    desc: "Dữ liệu đối tác lưu rải rác trên danh bạ cá nhân, Zalo, danh thiếp giấy và nhiều file Excel rời rạc.",
    icon: "💾",
  },
  {
    id: 2,
    title: "Khó duy trì quan hệ",
    code: "ERR_SYNC_DROPPED",
    desc: "Thiếu hệ thống nhắc nhở thông minh, dễ quên tương tác sau sự kiện hoặc đánh mất sợi dây gắn kết.",
    icon: "📡",
  },
  {
    id: 3,
    title: "Bỏ lỡ cơ hội",
    code: "ERR_MISSED_PACKET",
    desc: "Không nắm bắt được nhu cầu hợp tác tức thời của hội viên khác trong mạng lưới kinh doanh.",
    icon: "⚠️",
  },
  {
    id: 4,
    title: "Thiếu kết nối thực chất",
    code: "ERR_SHALLOW_NET",
    desc: "Tham gia nhiều hội nhóm nhưng chỉ trao đổi bề nổi, thiếu cơ chế kết nối 1-on-1 theo đúng nhu cầu.",
    icon: "🔌",
  },
  {
    id: 5,
    title: "Khó đo lường hiệu quả",
    code: "ERR_METRICS_NULL",
    desc: "Không thống kê được giá trị giao thương sinh ra từ các mối quan hệ và sự kiện kết nối.",
    icon: "📉",
  },
];

// 9 GIẢI PHÁP - CYBER MODULES
const CYBER_SOLUTIONS = [
  {
    id: 1,
    title: "Quản lý hội viên",
    mod: "CORE_MEMBER_360",
    desc: "Hồ sơ năng lực số 360°, lưu trữ thông tin doanh nghiệp, lĩnh vực và phân hạng chính xác.",
  },
  {
    id: 2,
    title: "CRM & Quan hệ",
    mod: "RELATION_ENGINE",
    desc: "Nhật ký tương tác, timeline quan hệ, ghi chú lịch sử gặp gỡ và mức độ gắn kết.",
  },
  {
    id: 3,
    title: "Cơ hội kinh doanh",
    mod: "DEAL_RADAR_B2B",
    desc: "Đăng tin nhu cầu mua/bán, tìm kiếm đối tác cung ứng và cơ hội đầu tư B2B.",
  },
  {
    id: 4,
    title: "Sự kiện",
    mod: "EVENT_CHECKIN_NFC",
    desc: "Check-in mã QR/NFC một chạm, sơ đồ giao lưu và khảo sát phản hồi tức thì.",
  },
  {
    id: 5,
    title: "Cộng đồng & Nhóm",
    mod: "COMMUNITY_HUB",
    desc: "Không gian thảo luận chuyên sâu theo ngành nghề, phân ban và câu lạc bộ sở thích.",
  },
  {
    id: 6,
    title: "Tri thức & Nội dung",
    mod: "KNOWLEDGE_BASE",
    desc: "Thư viện tài liệu quản trị, báo cáo kinh tế và chia sẻ bài học từ chuyên gia.",
  },
  {
    id: 7,
    title: "Báo cáo & Phân tích",
    mod: "ANALYTICS_AI",
    desc: "Đo lường chỉ số kết nối, tần suất giao thương và hiệu quả các chiến dịch kết nạp.",
  },
  {
    id: 8,
    title: "AI Copilot",
    mod: "COPILOT_NEURAL",
    desc: "Gợi ý ghép đôi đối tác tự động theo nhu cầu tương thích và phân tích hồ sơ thông minh.",
  },
  {
    id: 9,
    title: "Tích hợp & Mở rộng",
    mod: "API_GATEWAY",
    desc: "Đồng bộ danh thiếp số điện tử, kết nối API linh hoạt với các hệ thống ERP/CRM có sẵn.",
  },
];

export function BusinessConnectLandingV5() {
  const [theme, setTheme] = useState<"light" | "dark" | "contrast">("dark");
  const [activeProblem, setActiveProblem] = useState<typeof CYBER_PROBLEMS[0] | null>(null);
  const [activeSolution, setActiveSolution] = useState<typeof CYBER_SOLUTIONS[0] | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Mouse spotlight coordinates
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setSpotlight({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const themeClasses = {
    light: "bg-[#E8ECEF] text-slate-900 font-mono",
    dark: "bg-[#050508] text-white font-mono",
    contrast: "bg-black text-[#00FF66] font-mono",
  };

  const cardClasses = {
    light: "bg-white/80 border border-slate-300 shadow-md backdrop-blur-md",
    dark: "bg-[#0c0d14]/80 border border-orange-500/25 shadow-[0_0_20px_rgba(249,115,22,0.1)] backdrop-blur-md",
    contrast: "bg-black border border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]",
  };

  return (
    <div className={`relative min-h-screen ${themeClasses[theme]}`}>
      {/* SPOTLIGHT MOUSE EFFECT */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          background: `radial-gradient(450px circle at ${spotlight.x}px ${spotlight.y}px, rgba(249,115,22,0.25), transparent 75%)`,
        }}
      />

      <CyberNeuralCanvas />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-orange-500/20 bg-[#050508]/85 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/40 bg-orange-500/10 text-xl shadow-lg">
              ⚡
            </span>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-widest text-orange-400">
                BUSINESS_CONNECT::CYBER
              </span>
              <span className="ml-2 text-[10px] text-emerald-400 uppercase">v5 Deep Tech</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider">
            <a href="#giai-phap" className="hover:text-orange-400 transition">&lt;Giải pháp/&gt;</a>
            <a href="#khach-hang" className="hover:text-orange-400 transition">&lt;Khách hàng/&gt;</a>
            <a href="#cau-chuyen" className="hover:text-orange-400 transition">&lt;Câu chuyện/&gt;</a>
            <a href="#bang-gia" className="hover:text-orange-400 transition">&lt;Bảng giá/&gt;</a>
            <a href="#tai-nguyen" className="hover:text-orange-400 transition">&lt;Tài nguyên/&gt;</a>
            <a href="#ve-chung-toi" className="hover:text-orange-400 transition">&lt;Về chúng tôi/&gt;</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="flex items-center rounded-full border border-orange-500/30 bg-black/60 p-1">
              <button
                onClick={() => setTheme("light")}
                title="Kim loại trắng bạc"
                className={`rounded-full p-1.5 transition ${theme === "light" ? "bg-orange-500 text-black shadow" : "text-gray-400"}`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                title="Đen Neon Cam"
                className={`rounded-full p-1.5 transition ${theme === "dark" ? "bg-orange-500 text-black shadow" : "text-gray-400"}`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("contrast")}
                title="Terminal Xanh lá"
                className={`rounded-full p-1.5 transition ${theme === "contrast" ? "bg-[#00FF66] text-black shadow" : "text-gray-400"}`}
              >
                <Contrast className="h-3.5 w-3.5" />
              </button>
            </div>

            <Link
              to="/auth"
              className="hidden sm:inline-flex rounded-xl px-4 py-2 text-xs font-semibold text-orange-400 hover:text-white transition"
            >
              [Đăng nhập]
            </Link>
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/60 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-black shadow-lg hover:shadow-orange-500/30 transition"
            >
              <span>Đặt demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* HERO SECTION */}
        <section className={`my-6 rounded-3xl p-8 sm:p-14 text-center ${cardClasses[theme]}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-orange-400 mb-6">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            <DecryptedText text="Hiểu đúng người." /> <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              <DecryptedText text="Mở ra cơ hội thật." />
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-base opacity-85 leading-relaxed mb-8">
            Business Connect giúp quản lý mối quan hệ, kết nối đúng người, đúng thời điểm nhờ AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/80 bg-orange-500 px-7 py-3.5 text-xs sm:text-sm font-black text-black shadow-xl hover:shadow-orange-500/40 transition transform hover:scale-105"
            >
              <span>Đặt demo ngay -&gt;</span>
            </button>
            <button
              onClick={() => setShowVideoModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-black/40 px-7 py-3.5 text-xs sm:text-sm font-bold backdrop-blur-md hover:bg-black/70 transition"
            >
              <Play className="h-4 w-4 text-orange-400 fill-orange-400" />
              <span>Xem video</span>
            </button>
          </div>

          {/* 4 STATS HARDWARE METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left font-mono">
            {[
              { val: "10,000+", tag: "MEMBERS_ACTIVE" },
              { val: "300+", tag: "ORGS_SYNCED" },
              { val: "50,000+", tag: "NET_CONNECTIONS" },
              { val: "20+", tag: "GLOBAL_REGIONS" },
            ].map((st, i) => (
              <div key={i} className="rounded-xl border border-orange-500/20 bg-black/40 p-3.5">
                <div className="text-xl sm:text-2xl font-black text-orange-400">{st.val}</div>
                <div className="text-[10px] opacity-60 mt-1 uppercase">{st.tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* VẤN ĐỀ (CYBER ANOMALIES) */}
        <section id="van-de" className="py-14">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              [SYSTEM_DIAGNOSTICS]
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-2">
              Quản lý quan hệ kinh doanh vẫn còn nhiều thách thức
            </h2>
            <p className="text-xs opacity-70 mt-2">
              Click vào từng mã lỗi hệ thống để xem nguyên nhân gốc rễ
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CYBER_PROBLEMS.map((prob) => (
              <motion.div
                key={prob.id}
                whileHover={{ scale: 1.05, y: -4 }}
                onClick={() => setActiveProblem(prob)}
                className={`group cursor-pointer flex flex-col items-center rounded-2xl p-5 text-center transition-all ${cardClasses[theme]}`}
              >
                <div className="text-3xl mb-3">{prob.icon}</div>
                <div className="text-[10px] text-orange-400 mb-1">{prob.code}</div>
                <h3 className="text-xs sm:text-sm font-bold">{prob.title}</h3>
                <span className="mt-3 text-[10px] opacity-60 group-hover:text-orange-400 flex items-center gap-1">
                  <Terminal className="h-3 w-3" /> Chi tiết
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GIẢI PHÁP (LƯỚI 9 TÍNH NĂNG - CYBERNETIC MODULES) */}
        <section id="giai-phap" className="py-14">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              [CORE_MODULES]
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-2">
              Quản lý kết nối. Tạo ra cơ hội.
            </h2>
            <p className="text-xs opacity-70 mt-2">
              9 phân hệ số hóa kiến tạo dòng chảy giao thương B2B tự động
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CYBER_SOLUTIONS.map((sol) => (
              <motion.div
                key={sol.id}
                whileHover={{ scale: 1.03, y: -3 }}
                onClick={() => setActiveSolution(sol)}
                className={`group cursor-pointer rounded-2xl p-5 transition-all ${cardClasses[theme]}`}
              >
                <div className="flex items-start gap-3">
                  <Cpu className="h-6 w-6 shrink-0 text-orange-400 group-hover:rotate-90 transition transform duration-300" />
                  <div>
                    <div className="text-[10px] text-emerald-400 mb-0.5">{sol.mod}</div>
                    <h3 className="text-xs sm:text-sm font-bold">{sol.title}</h3>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 mt-1">
                      <Eye className="h-3 w-3" /> Xem module
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HỆ SINH THÁI */}
        <section className={`my-14 rounded-3xl p-8 sm:p-12 text-center ${cardClasses[theme]}`}>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
            // NETWORK SYNCHRONIZATION
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-2 mb-4">
            Cùng nhau tạo ra giá trị lớn hơn
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm opacity-80 mb-8">
            Kết nối hội viên, hiệp hội, doanh nghiệp...
          </p>
          <div className="inline-block rounded-xl border border-orange-500/40 bg-black/60 px-6 py-3 text-xs sm:text-sm font-black tracking-widest text-orange-400">
            NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.
          </div>
        </section>

        {/* KHÁCH HÀNG & TESTIMONIAL */}
        <section id="khach-hang" className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-3xl font-bold">
              Những tổ chức tiên phong đã lựa chọn
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 opacity-75">
              {["VCCI", "AmCham", "EuroCham", "JCCI", "KoCham", "AusCham"].map((logo) => (
                <span
                  key={logo}
                  className="rounded-xl border border-orange-500/20 bg-black/50 px-5 py-2.5 text-xs font-bold tracking-wider"
                >
                  [{logo}]
                </span>
              ))}
            </div>
          </div>

          <div className="mt-14 text-center">
            <h3 className="text-2xl sm:text-3xl font-black mb-8">
              Kết nối đúng. Tăng trưởng thật.
            </h3>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  name: "Nguyễn Thị Lan",
                  role: "Phó Chủ tịch Hiệp hội Doanh nghiệp",
                  quote:
                    "Business Connect giúp gắn kết hơn 1,200 hội viên chặt chẽ, các buổi giao thương đều đạt tỷ lệ phản hồi tích cực trên 95%.",
                },
                {
                  name: "Trần Minh Quân",
                  role: "CEO TechCorp Global",
                  quote:
                    "Hệ thống AI gợi ý chính xác đối tác chuỗi cung ứng, giúp doanh nghiệp chúng tôi chốt được 3 hợp đồng lớn ngay quý đầu tiên.",
                },
                {
                  name: "Lê Hoàng Anh",
                  role: "Giám đốc Kết nối Mạng lưới",
                  quote:
                    "Nền tảng số hóa toàn diện biến danh thiếp và các sự kiện truyền thống thành dòng cơ hội kinh doanh liên tục.",
                },
              ].map((t, idx) => (
                <div key={idx} className={`rounded-2xl p-6 text-left ${cardClasses[theme]}`}>
                  <p className="text-xs sm:text-sm italic opacity-85 mb-4">"{t.quote}"</p>
                  <div className="text-xs font-bold text-orange-400">{t.name}</div>
                  <div className="text-[10px] opacity-60">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`mt-14 rounded-3xl p-8 sm:p-12 text-center ${cardClasses[theme]}`}>
          <h2 className="text-2xl sm:text-4xl font-black mb-6">
            Sẵn sàng mở ra nhiều cơ hội hơn?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-3.5 text-xs sm:text-sm font-black text-black shadow-xl hover:shadow-orange-500/40 transition transform hover:scale-105"
            >
              <span>Đặt demo ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-black/40 px-7 py-3.5 text-xs sm:text-sm font-bold backdrop-blur-md hover:bg-black/70 transition"
            >
              <span>Liên hệ tư vấn</span>
            </button>
          </div>
        </footer>
      </div>

      {/* POPUP CHO VẤN ĐỀ */}
      <AnimatePresence>
        {activeProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full rounded-2xl p-6 border border-orange-500 bg-[#0c0d14] text-white shadow-2xl"
            >
              <button
                onClick={() => setActiveProblem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-orange-950/60 hover:bg-orange-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-3xl mb-2">{activeProblem.icon}</div>
              <div className="text-[10px] text-orange-400">{activeProblem.code}</div>
              <h3 className="text-base font-bold text-orange-300 mt-1">{activeProblem.title}</h3>
              <p className="mt-3 text-xs opacity-85 leading-relaxed">{activeProblem.desc}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP CHO GIẢI PHÁP */}
      <AnimatePresence>
        {activeSolution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full rounded-2xl p-6 border border-emerald-500 bg-[#0c0d14] text-white shadow-2xl"
            >
              <button
                onClick={() => setActiveSolution(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-[10px] text-emerald-400 mb-1">{activeSolution.mod}</div>
              <h3 className="text-base font-bold text-emerald-300">{activeSolution.title}</h3>
              <p className="mt-3 text-xs opacity-85 leading-relaxed">{activeSolution.desc}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEMO MODAL */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full rounded-2xl p-6 border border-orange-500 bg-[#0c0d14] text-white shadow-2xl"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-orange-950/60 hover:bg-orange-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-bold text-orange-400">[INITIATE_DEMO_REQUEST]</h3>
              <p className="text-xs opacity-75 mt-1">
                Khai phá hạ tầng quản trị mạng lưới thông minh dành riêng cho tổ chức của bạn.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Yêu cầu demo đã được đồng bộ vào hệ thống!");
                  setShowDemoModal(false);
                }}
                className="mt-4 space-y-3"
              >
                <input
                  required
                  placeholder="Họ và tên của bạn"
                  className="w-full rounded-xl border border-orange-500/30 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  required
                  type="email"
                  placeholder="Email công việc"
                  className="w-full rounded-xl border border-orange-500/30 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  required
                  placeholder="Số điện thoại"
                  className="w-full rounded-xl border border-orange-500/30 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  placeholder="Tổ chức / Hiệp hội"
                  className="w-full rounded-xl border border-orange-500/30 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 py-3 text-xs font-bold text-black shadow-lg hover:shadow-orange-500/30 transition"
                >
                  XÁC NHẬN ĐẶT LỊCH DEMO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden border border-orange-500/40 bg-black p-2 shadow-2xl"
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center text-center p-6 text-white">
                <div>
                  <Play className="mx-auto h-14 w-14 text-orange-400 animate-pulse mb-3" />
                  <div className="text-base font-bold text-white">Business Connect Architecture</div>
                  <div className="text-xs text-orange-400/80 mt-1">Hệ điều hành Deep Tech & Cybernetics B2B</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default BusinessConnectLandingV5;
