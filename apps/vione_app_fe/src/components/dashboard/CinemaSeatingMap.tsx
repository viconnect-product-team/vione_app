import React, { useState } from "react";
import { Check, Plus, Trash2, Edit3, RotateCcw, Lock, Crown, Minus } from "lucide-react";

export type SeatInfo = {
  id: string;
  label: string;
  category: "vip" | "standard" | "table";
  row?: string;
  number?: number;
};

export type CinemaRowConfig = {
  id: string;
  rowLetter: string;
  name: string;
  category: "vip" | "standard";
  seatsCount: number;
};

export type BanquetTable = {
  id: string;
  name: string;
  shape: "round" | "rect";
  seatsCount: number;
  isVip?: boolean;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
};

type Props = {
  currentSeat?: string;
  occupiedSeats?: Record<string, { attendeeName: string; attendeeCode?: string }>;
  onSelectSeat: (seatLabel: string) => void;
  initialMode?: "cinema" | "banquet";
};

const DEFAULT_BANQUET_TABLES: BanquetTable[] = [
  { id: "T1", name: "Bàn VIP 01 - Ban Chủ Tọa", shape: "round", seatsCount: 8, isVip: true, x: 25, y: 22 },
  { id: "T2", name: "Bàn VIP 02 - Khách Mời Danh Dự", shape: "round", seatsCount: 8, isVip: true, x: 75, y: 22 },
  { id: "T3", name: "Bàn 03 - Ban Xúc Tiến B2B", shape: "round", seatsCount: 10, isVip: false, x: 20, y: 56 },
  { id: "T4", name: "Bàn 04 - Hội Viên CEO 1983", shape: "round", seatsCount: 10, isVip: false, x: 50, y: 56 },
  { id: "T5", name: "Bàn 05 - Đối Tác Chiến Lược", shape: "rect", seatsCount: 10, isVip: false, x: 80, y: 56 },
  { id: "T6", name: "Bàn 06 - Doanh Nghiệp Trẻ", shape: "rect", seatsCount: 8, isVip: false, x: 35, y: 84 },
  { id: "T7", name: "Bàn 07 - Báo Chí & Truyền Thông", shape: "rect", seatsCount: 8, isVip: false, x: 65, y: 84 },
];

const DEFAULT_CINEMA_ROWS: CinemaRowConfig[] = [
  { id: "row-A", rowLetter: "A", name: "Hàng VIP A", category: "vip", seatsCount: 10 },
  { id: "row-B", rowLetter: "B", name: "Hàng VIP B", category: "vip", seatsCount: 10 },
  { id: "row-C", rowLetter: "C", name: "Hàng Tiêu Chuẩn C", category: "standard", seatsCount: 12 },
  { id: "row-D", rowLetter: "D", name: "Hàng Tiêu Chuẩn D", category: "standard", seatsCount: 12 },
  { id: "row-E", rowLetter: "E", name: "Hàng Doanh Nhân E", category: "standard", seatsCount: 12 },
];

export function CinemaSeatingMap({
  currentSeat = "",
  occupiedSeats = {},
  onSelectSeat,
  initialMode = "cinema",
}: Props) {
  const [mode, setMode] = useState<"cinema" | "banquet">(initialMode);
  const [selectedSeatId, setSelectedSeatId] = useState<string>(currentSeat);
  const [hoveredSeat, setHoveredSeat] = useState<{ id: string; label: string; occupant?: string } | null>(null);

  // Cinema Dynamic Rows & Stage Seats
  const [cinemaRows, setCinemaRows] = useState<CinemaRowConfig[]>(DEFAULT_CINEMA_ROWS);
  const [stageSeatsCount, setStageSeatsCount] = useState<number>(6);
  const [showStageSeats, setShowStageSeats] = useState<boolean>(true);

  // Banquet State
  const [tables, setTables] = useState<BanquetTable[]>(DEFAULT_BANQUET_TABLES);
  const [activeTableId, setActiveTableId] = useState<string | null>("T1");
  const activeTable = (tables || []).find((t) => t.id === activeTableId);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<BanquetTable | null>(null);

  // New table form state
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<"round" | "rect">("round");
  const [newTableSeats, setNewTableSeats] = useState<number>(10);
  const [newTableIsVip, setNewTableIsVip] = useState<boolean>(false);

  // Stage Seats (Ghế trên sân khấu / Chủ tọa & Diễn giả)
  const stageSeats: SeatInfo[] = Array.from({ length: stageSeatsCount }, (_, i) => ({
    id: `SK-${String(i + 1).padStart(2, "0")}`,
    label: `Sân Khấu - Ghế SK-${String(i + 1).padStart(2, "0")}`,
    category: "vip",
    row: "SK",
    number: i + 1,
  }));

  // Cinema Dynamic Row Generator
  const getRowSeats = (row: CinemaRowConfig): SeatInfo[] => {
    return Array.from({ length: row.seatsCount }, (_, i) => ({
      id: `${row.rowLetter}-${String(i + 1).padStart(2, "0")}`,
      label: `${row.name} - Ghế ${row.rowLetter}-${String(i + 1).padStart(2, "0")}`,
      category: row.category,
      row: row.rowLetter,
      number: i + 1,
    }));
  };

  const handleAddRow = () => {
    const existingLetters = cinemaRows.map((r) => r.rowLetter);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const nextLetter = alphabet.find((l) => !existingLetters.includes(l)) || `R${cinemaRows.length + 1}`;
    const newRow: CinemaRowConfig = {
      id: `row-${nextLetter}-${Date.now()}`,
      rowLetter: nextLetter,
      name: `Hàng Ghế ${nextLetter}`,
      category: "standard",
      seatsCount: 12,
    };
    setCinemaRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (rowId: string) => {
    setCinemaRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleAdjustSeatsCount = (rowId: string, delta: number) => {
    setCinemaRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const nextCount = Math.max(4, Math.min(24, r.seatsCount + delta));
        return { ...r, seatsCount: nextCount };
      })
    );
  };

  const handleResetCinema = () => {
    setCinemaRows(DEFAULT_CINEMA_ROWS);
    setStageSeatsCount(6);
    setShowStageSeats(true);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    if (activeTableId === tableId) {
      setActiveTableId(null);
    }
  };

  const moveTable = (tableId: string, dx: number, dy: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          x: Math.max(5, Math.min(95, t.x + dx)),
          y: Math.max(5, Math.min(95, t.y + dy)),
        };
      })
    );
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const newId = `T${tables.length + 1}-${Date.now().toString().slice(-4)}`;
    const newTable: BanquetTable = {
      id: newId,
      name: newTableName.trim(),
      shape: newTableShape,
      seatsCount: newTableSeats,
      isVip: newTableIsVip,
      x: 50,
      y: 50,
    };
    setTables((prev) => [...prev, newTable]);
    setActiveTableId(newId);
    setShowAddTableModal(false);
    setNewTableName("");
    setNewTableIsVip(false);
  };

  const handleUpdateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    setTables((prev) =>
      prev.map((t) => (t.id === editingTable.id ? editingTable : t))
    );
    setEditingTable(null);
  };

  // --- Seat Selection Handler ---
  const handleSeatClick = (seatLabel: string, seatId: string) => {
    const occupant = occupiedSeats[seatId] || occupiedSeats[seatLabel];
    const isOccupied = !!occupant && seatLabel !== currentSeat && seatId !== currentSeat;
    if (isOccupied) return;

    setSelectedSeatId(seatLabel);
    onSelectSeat(seatLabel);
  };

  const getSeatStatus = (seatLabel: string, seatId: string) => {
    const isSelected =
      selectedSeatId === seatLabel ||
      selectedSeatId === seatId ||
      currentSeat === seatLabel ||
      currentSeat === seatId;
    const occupant = occupiedSeats[seatId] || occupiedSeats[seatLabel];
    const isOccupied = !!occupant && !isSelected;

    return { isSelected, isOccupied, occupant };
  };

  // --- Render Single Cinema Seat ---
  const renderCinemaSeatBtn = (seat: SeatInfo) => {
    const { isSelected, isOccupied, occupant } = getSeatStatus(seat.label, seat.id);

    let bgClass = "bg-muted text-muted-foreground border-border hover:border-primary/60 hover:bg-primary/10";
    if (seat.category === "vip") {
      bgClass = "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500";
    }

    if (isOccupied) {
      bgClass = "bg-rose-500/10 text-rose-500/70 dark:text-rose-400/60 border-rose-500/30 cursor-not-allowed opacity-60 line-through select-none";
    }

    if (isSelected) {
      bgClass = "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105 ring-2 ring-emerald-400";
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSeatClick(seat.label, seat.id)}
        onMouseEnter={() =>
          setHoveredSeat({
            id: seat.id,
            label: seat.label,
            occupant: occupant?.attendeeName,
          })
        }
        onMouseLeave={() => setHoveredSeat(null)}
        title={
          isOccupied
            ? `${seat.label} - [ĐÃ CÓ CHỦ: ${occupant?.attendeeName || "Hội viên"}] - Không thể chọn`
            : isSelected
            ? `${seat.label} (Đang chọn)`
            : `${seat.label} (Còn trống - Click để chọn)`
        }
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-[10px] sm:text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center ${
          isOccupied ? "cursor-not-allowed" : "cursor-pointer"
        } ${bgClass}`}
      >
        {isSelected ? (
          <Check className="w-4 h-4 stroke-[3]" />
        ) : isOccupied ? (
          <Lock className="w-3.5 h-3.5 text-rose-500/80" />
        ) : (
          <span className="leading-none">{seat.number}</span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full select-none rounded-2xl border border-border bg-card/60 p-4 sm:p-6 backdrop-blur-md shadow-inner text-center">
      {/* 1. Mode Switcher: Cinema vs Banquet */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3 mb-5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
          <button
            type="button"
            onClick={() => setMode("cinema")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "cinema"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hội Trường / Sân Khấu Sự Kiện
          </button>
          <button
            type="button"
            onClick={() => setMode("banquet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "banquet"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bàn Tiệc Hội Nghị / Gala Dinner
          </button>
        </div>

        {/* Toolbar based on mode */}
        {mode === "cinema" ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Thêm hàng ghế mới ở hội trường"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Hàng Ghế</span>
            </button>
            <button
              type="button"
              onClick={() => setStageSeatsCount((c) => Math.min(12, c + 2))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
              title="Thêm 2 ghế trên bục sân khấu chính"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>+ Ghế Sân Khấu</span>
            </button>
            {stageSeatsCount > 2 && (
              <button
                type="button"
                onClick={() => setStageSeatsCount((c) => Math.max(2, c - 2))}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Bớt 2 ghế trên sân khấu"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleResetCinema}
              title="Đặt lại sơ đồ ghế mặc định"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddTableModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bàn Tiệc</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTables(DEFAULT_BANQUET_TABLES);
                setActiveTableId("T1");
              }}
              title="Đặt lại sơ đồ mặc định"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. CINEMA / STAGE THEATER MODE */}
      {mode === "cinema" && (
        <div>
          {/* Cinema Stage Arc with Actual Stage Seating */}
          <div className="mx-auto max-w-xl mb-6">
            <div className="relative flex flex-col items-center">
              <div className="w-full py-2.5 px-4 rounded-t-2xl rounded-b-[60px] border-2 border-amber-500/70 bg-gradient-to-b from-amber-500/10 via-amber-500/20 to-amber-500/30 shadow-[0_10px_25px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-800 dark:text-amber-300 font-mono">
                    SÂN KHẤU CHÍNH / BỤC CHỦ TỌA & DIỄN GIẢ ({stageSeatsCount} GHẾ)
                  </span>
                </div>

                {/* Seats directly arranged ON the stage */}
                {showStageSeats && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {stageSeats.map(renderCinemaSeatBtn)}
                  </div>
                )}
              </div>
              <div className="w-64 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] -mt-0.5" />
            </div>
          </div>

          {/* Rows of the Auditorium */}
          <div className="space-y-4 max-w-3xl mx-auto overflow-x-auto pb-4">
            {(cinemaRows || []).map((row) => {
              const seats = getRowSeats(row);
              const half = Math.ceil(seats.length / 2);
              const leftGroup = seats.slice(0, half);
              const rightGroup = seats.slice(half);

              return (
                <div
                  key={row.id}
                  className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
                    row.category === "vip"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          row.category === "vip"
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-foreground"
                        }`}
                      >
                        {row.name} ({row.seatsCount} ghế)
                      </span>
                      {row.category === "vip" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
                          VIP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustSeatsCount(row.id, -1)}
                        title="Bớt 1 ghế ở hàng này"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground px-1">
                        {row.seatsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustSeatsCount(row.id, 1)}
                        title="Thêm 1 ghế vào hàng này"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      {cinemaRows.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          title={`Xóa ${row.name}`}
                          className="ml-2 p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seat Buttons with aisle in the middle */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <span className="w-5 text-xs font-black font-mono text-muted-foreground">
                      {row.rowLetter}
                    </span>
                    <div className="flex gap-1 sm:gap-1.5">{leftGroup.map(renderCinemaSeatBtn)}</div>
                    <div className="w-3 sm:w-6 flex items-center justify-center">
                      <span className="h-4 w-[1px] bg-border" />
                    </div>
                    <div className="flex gap-1 sm:gap-1.5">{rightGroup.map(renderCinemaSeatBtn)}</div>
                    <span className="w-5 text-xs font-black font-mono text-muted-foreground">
                      {row.rowLetter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Seat Status Legend */}
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-border bg-muted" />
              <span className="text-muted-foreground">Ghế trống</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-amber-500/40 bg-amber-500/20" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">Ghế VIP / Sân khấu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-emerald-500 bg-emerald-600 flex items-center justify-center text-white text-[10px]">
                ✓
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Đang chọn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-rose-500/40 bg-rose-500/20 flex items-center justify-center text-rose-500 text-[10px]">
                ✕
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">Đã có chủ (Disable)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. BANQUET TABLE MODE */}
      {mode === "banquet" && (
        <div className="space-y-4">
          {/* Stage / Backdrop Top Header */}
          <div className="mx-auto max-w-md">
            <div className="py-2 px-6 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300 font-mono">
                SÂN KHẤU CHÍNH & BACKDROP DẠ TIỆC
              </span>
            </div>
          </div>

          {/* Active Table Quick Control Bar */}
          {activeTable && (
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl border border-border bg-muted/40 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Đang chọn: <strong className="text-amber-600 dark:text-amber-400">{activeTable.name}</strong> ({activeTable.seatsCount} chỗ)
                </span>
                <button
                  type="button"
                  onClick={() => setEditingTable(activeTable)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Chỉnh sửa thông tin bàn"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTable(activeTable.id)}
                  className="p-1 rounded text-rose-500 hover:text-rose-600 cursor-pointer"
                  title="Xóa bàn này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* D-Pad Position Adjuster */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] font-medium text-muted-foreground mr-1">Chỉnh vị trí:</span>
                <button
                  type="button"
                  onClick={() => moveTable(activeTable.id, -5, 0)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-bold cursor-pointer"
                >
                  ← Trái
                </button>
                <button
                  type="button"
                  onClick={() => moveTable(activeTable.id, 5, 0)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-bold cursor-pointer"
                >
                  Phải →
                </button>
                <button
                  type="button"
                  onClick={() => moveTable(activeTable.id, 0, -5)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-bold cursor-pointer"
                >
                  ↑ Lên
                </button>
                <button
                  type="button"
                  onClick={() => moveTable(activeTable.id, 0, 5)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-bold cursor-pointer"
                >
                  Xuống ↓
                </button>
              </div>
            </div>
          )}

          {/* Interactive 2D Banquet Hall Canvas */}
          <div className="relative w-full h-[520px] rounded-2xl border border-border bg-slate-950/40 dark:bg-black/50 overflow-hidden p-4 shadow-inner">
            {/* Floor Grid Lines */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(216,178,130,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(216,178,130,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Banquet Tables Render */}
            {(tables || []).map((table) => {
              const isSelectedTable = activeTableId === table.id;

              // Generate seats for this table
              const tableSeats = Array.from({ length: table.seatsCount }, (_, i) => {
                const seatNum = i + 1;
                const seatId = `${table.id}-${String(seatNum).padStart(2, "0")}`;
                const seatLabel = `${table.name} - Ghế ${seatNum}`;
                return { seatId, seatNum, seatLabel };
              });

              return (
                <div
                  key={table.id}
                  onClick={() => setActiveTableId(table.id)}
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute transition-all duration-150 cursor-pointer ${
                    isSelectedTable ? "z-20 scale-105" : "z-10 hover:scale-102"
                  }`}
                >
                  {table.shape === "round" ? (
                    // --- Round Table ---
                    <div className="relative flex items-center justify-center">
                      {/* Central Table Surface */}
                      <div
                        className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                          table.isVip
                            ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : isSelectedTable
                            ? "bg-primary/20 border-primary text-foreground shadow-[0_0_15px_rgba(0,75,145,0.3)]"
                            : "bg-muted/70 border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <span className="text-[11px] font-black leading-tight line-clamp-2">
                          {table.name}
                        </span>
                        <span className="text-[9px] font-mono mt-0.5 opacity-70">
                          {table.seatsCount} chỗ
                        </span>
                      </div>

                      {/* Surrounding Round Table Seats */}
                      {tableSeats.map((s, idx) => {
                        const angle = (idx / table.seatsCount) * (2 * Math.PI) - Math.PI / 2;
                        const radius = 66; // Distance from center
                        const seatX = Math.cos(angle) * radius;
                        const seatY = Math.sin(angle) * radius;

                        const { isSelected, isOccupied, occupant } = getSeatStatus(s.seatLabel, s.seatId);

                        let seatClass = "bg-muted/90 text-foreground border-border hover:border-primary hover:bg-primary/20";
                        if (table.isVip) {
                          seatClass = "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30";
                        }
                        if (isOccupied) {
                          seatClass = "bg-slate-700 text-slate-400 border-slate-600/30 cursor-not-allowed opacity-60";
                        }
                        if (isSelected) {
                          seatClass = "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-110";
                        }

                        return (
                          <button
                            key={s.seatId}
                            type="button"
                            disabled={isOccupied}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(s.seatLabel, s.seatId);
                            }}
                            onMouseEnter={() =>
                              setHoveredSeat({
                                id: s.seatId,
                                label: s.seatLabel,
                                occupant: occupant?.attendeeName,
                              })
                            }
                            onMouseLeave={() => setHoveredSeat(null)}
                            style={{
                              transform: `translate(${seatX}px, ${seatY}px)`,
                            }}
                            title={
                              isOccupied
                                ? `${s.seatLabel} - Đã có: ${occupant?.attendeeName}`
                                : isSelected
                                ? `${s.seatLabel} (Đang chọn)`
                                : `${s.seatLabel} (Click để chọn)`
                            }
                            className={`absolute w-7 h-7 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${seatClass}`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.seatNum}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // --- Rectangular Table ---
                    <div className="relative flex flex-col items-center justify-center">
                      {/* Top Row Seats */}
                      <div className="flex gap-2 mb-1.5">
                        {tableSeats.slice(0, Math.ceil(table.seatsCount / 2)).map((s) => {
                          const { isSelected, isOccupied, occupant } = getSeatStatus(s.seatLabel, s.seatId);
                          let seatClass = "bg-muted/90 text-foreground border-border hover:border-primary hover:bg-primary/20";
                          if (table.isVip) seatClass = "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30";
                          if (isOccupied) seatClass = "bg-slate-700 text-slate-400 border-slate-600/30 cursor-not-allowed opacity-60";
                          if (isSelected) seatClass = "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 shadow-md scale-110";

                          return (
                            <button
                              key={s.seatId}
                              type="button"
                              disabled={isOccupied}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(s.seatLabel, s.seatId);
                              }}
                              onMouseEnter={() =>
                                setHoveredSeat({
                                  id: s.seatId,
                                  label: s.seatLabel,
                                  occupant: occupant?.attendeeName,
                                })
                              }
                              onMouseLeave={() => setHoveredSeat(null)}
                              title={
                                isOccupied
                                  ? `${s.seatLabel} - Đã có: ${occupant?.attendeeName}`
                                  : isSelected
                                  ? `${s.seatLabel} (Đang chọn)`
                                  : `${s.seatLabel} (Click để chọn)`
                              }
                              className={`w-7 h-7 rounded-lg border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${seatClass}`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.seatNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Central Rectangular Table Surface */}
                      <div
                        className={`w-44 h-16 rounded-xl border-2 flex flex-col items-center justify-center px-2 text-center transition-all ${
                          table.isVip
                            ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : isSelectedTable
                            ? "bg-primary/20 border-primary text-foreground shadow-[0_0_15px_rgba(0,75,145,0.3)]"
                            : "bg-muted/70 border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <span className="text-[11px] font-black leading-tight line-clamp-1">
                          {table.name}
                        </span>
                        <span className="text-[9px] font-mono mt-0.5 opacity-70">
                          {table.seatsCount} chỗ ngồi
                        </span>
                      </div>

                      {/* Bottom Row Seats */}
                      <div className="flex gap-2 mt-1.5">
                        {tableSeats.slice(Math.ceil(table.seatsCount / 2)).map((s) => {
                          const { isSelected, isOccupied, occupant } = getSeatStatus(s.seatLabel, s.seatId);
                          let seatClass = "bg-muted/90 text-foreground border-border hover:border-primary hover:bg-primary/20";
                          if (table.isVip) seatClass = "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30";
                          if (isOccupied) seatClass = "bg-slate-700 text-slate-400 border-slate-600/30 cursor-not-allowed opacity-60";
                          if (isSelected) seatClass = "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 shadow-md scale-110";

                          return (
                            <button
                              key={s.seatId}
                              type="button"
                              disabled={isOccupied}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(s.seatLabel, s.seatId);
                              }}
                              onMouseEnter={() =>
                                setHoveredSeat({
                                  id: s.seatId,
                                  label: s.seatLabel,
                                  occupant: occupant?.attendeeName,
                                })
                              }
                              onMouseLeave={() => setHoveredSeat(null)}
                              title={
                                isOccupied
                                  ? `${s.seatLabel} - Đã có: ${occupant?.attendeeName}`
                                  : isSelected
                                  ? `${s.seatLabel} (Đang chọn)`
                                  : `${s.seatLabel} (Click để chọn)`
                              }
                              className={`w-7 h-7 rounded-lg border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${seatClass}`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.seatNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Hover & Selected Status Bar */}
      <div className="mt-4 min-h-[28px] text-xs font-medium">
        {hoveredSeat ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border">
            <span>{hoveredSeat.label}</span>
            {hoveredSeat.occupant ? (
              <span className="text-rose-600 font-bold">• Đã xếp: {hoveredSeat.occupant}</span>
            ) : (
              <span className="text-emerald-600 font-bold">• Ghế còn trống (Click để chọn)</span>
            )}
          </span>
        ) : selectedSeatId ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>Vị trí đã chọn: {selectedSeatId}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Click vào ghế bất kỳ trên sơ đồ để chọn chỗ ngồi</span>
        )}
      </div>

      {/* 5. Clean Geometric Legend (No random tacky icons) */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500" />
          <span className="text-muted-foreground">Bàn / Ghế VIP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-muted border border-border" />
          <span className="text-muted-foreground">Tiêu chuẩn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-700 border border-slate-500/20" />
          <span className="text-muted-foreground">Đã có người</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-emerald-500 ring-1 ring-emerald-400" />
          <span className="text-emerald-600 font-bold">Đang chọn</span>
        </div>
      </div>

      {/* Modal Thêm Bàn Tiệc Mới */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-left">
            <h4 className="text-sm font-bold text-foreground mb-3">Thêm Bàn Tiệc Mới Vào Sơ Đồ</h4>
            <form onSubmit={handleAddTable} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tên Bàn Tiệc</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Ví dụ: Bàn 08 - Doanh Nghiệp FDI"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Kiểu Bàn</label>
                  <select
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value as "round" | "rect")}
                    className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs text-foreground outline-none"
                  >
                    <option value="round">Bàn Tròn</option>
                    <option value="rect">Bàn Chữ Nhật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Lượng Ghế</label>
                  <select
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs text-foreground outline-none"
                  >
                    <option value={6}>6 Ghế</option>
                    <option value={8}>8 Ghế</option>
                    <option value={10}>10 Ghế</option>
                    <option value={12}>12 Ghế</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newTableVip"
                  checked={newTableIsVip}
                  onChange={(e) => setNewTableIsVip(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="newTableVip" className="text-xs text-foreground font-medium cursor-pointer">
                  Đặt làm Bàn VIP (Viền Vàng Hoàng Gia)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Tạo Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Bàn Tiệc */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-left">
            <h4 className="text-sm font-bold text-foreground mb-3">Chỉnh Sửa Thông Tin Bàn Tiệc</h4>
            <form onSubmit={handleUpdateTable} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tên Bàn Tiệc</label>
                <input
                  type="text"
                  required
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Kiểu Bàn</label>
                  <select
                    value={editingTable.shape}
                    onChange={(e) => setEditingTable({ ...editingTable, shape: e.target.value as "round" | "rect" })}
                    className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs text-foreground outline-none"
                  >
                    <option value="round">Bàn Tròn</option>
                    <option value="rect">Bàn Chữ Nhật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Lượng Ghế</label>
                  <select
                    value={editingTable.seatsCount}
                    onChange={(e) => setEditingTable({ ...editingTable, seatsCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs text-foreground outline-none"
                  >
                    <option value={6}>6 Ghế</option>
                    <option value={8}>8 Ghế</option>
                    <option value={10}>10 Ghế</option>
                    <option value={12}>12 Ghế</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editTableVip"
                  checked={editingTable.isVip || false}
                  onChange={(e) => setEditingTable({ ...editingTable, isVip: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="editTableVip" className="text-xs text-foreground font-medium cursor-pointer">
                  Bàn VIP (Viền Vàng)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
