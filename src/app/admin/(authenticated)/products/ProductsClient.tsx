"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";
import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct, duplicateProduct, toggleProductStatus } from "@/app/admin/(authenticated)/products/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { 
  Trash2, 
  Edit, 
  Copy, 
  Search, 
  X, 
  Gamepad2, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown,
  Check,
  SlidersHorizontal,
  Zap,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import Image from "next/image";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function ProductsClient({ 
  initialProducts, 
  games, 
  currency = 'IDR',
  supportedCurrencies = ['IDR'],
  multiCurrencyEnabled = false,
}: { 
  initialProducts: any[], 
  games: any[], 
  currency?: Currency,
  supportedCurrencies?: Currency[],
  multiCurrencyEnabled?: boolean,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showNotification, NotificationComponent } = useNotification();

  // URL Query State Initialization
  const initialGameId = searchParams.get("gameId") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialStatus = searchParams.get("status") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "10", 10);

  // Filter & Pagination States
  const [selectedGameId, setSelectedGameId] = React.useState<string>(initialGameId);
  const [searchQuery, setSearchQuery] = React.useState<string>(initialSearch);
  const [statusFilter, setStatusFilter] = React.useState<string>(initialStatus);
  const [currentPage, setCurrentPage] = React.useState<number>(initialPage > 0 ? initialPage : 1);
  const [pageSize, setPageSize] = React.useState<number>(initialLimit);

  // Custom Dropdown Open States
  const [isGameDropdownOpen, setIsGameDropdownOpen] = React.useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);
  const [gameSearchInDropdown, setGameSearchInDropdown] = React.useState("");

  const gameDropdownRef = React.useRef<HTMLDivElement>(null);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gameDropdownRef.current && !gameDropdownRef.current.contains(event.target as Node)) {
        setIsGameDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal & CRUD States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [deleteState, setDeleteState] = React.useState<{ isOpen: boolean; id: string; name: string; loading: boolean }>({
    isOpen: false,
    id: "",
    name: "",
    loading: false,
  });

  // Calculate Product count per game for badges
  const gameProductCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      if (p.game_id) {
        counts[p.game_id] = (counts[p.game_id] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Sync state to URL Query Parameters
  const updateUrlParams = React.useCallback(
    (newParams: { gameId?: string; q?: string; status?: string; page?: number; limit?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      const g = newParams.gameId !== undefined ? newParams.gameId : selectedGameId;
      const q = newParams.q !== undefined ? newParams.q : searchQuery;
      const s = newParams.status !== undefined ? newParams.status : statusFilter;
      const p = newParams.page !== undefined ? newParams.page : currentPage;
      const l = newParams.limit !== undefined ? newParams.limit : pageSize;

      if (g && g !== "all") params.set("gameId", g);
      else params.delete("gameId");

      if (q && q.trim()) params.set("q", q.trim());
      else params.delete("q");

      if (s && s !== "all") params.set("status", s);
      else params.delete("status");

      if (p && p > 1) params.set("page", p.toString());
      else params.delete("page");

      if (l && l !== 10) params.set("limit", l.toString());
      else params.delete("limit");

      const queryStr = params.toString();
      router.replace(`${pathname}${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
    },
    [searchParams, selectedGameId, searchQuery, statusFilter, currentPage, pageSize, pathname, router]
  );

  // Chained Filter Pipeline
  const filteredProducts = React.useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Filter by Game ID
      if (selectedGameId !== "all" && product.game_id !== selectedGameId) {
        return false;
      }

      // 2. Filter by Search Query (Product Name, Game Name, Variant)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const productName = (product.name || "").toLowerCase();
        const gameName = (product.games?.name || "").toLowerCase();
        const variantType = (product.variant_type || "").toLowerCase();
        const match = productName.includes(q) || gameName.includes(q) || variantType.includes(q);
        if (!match) return false;
      }

      // 3. Filter by Status / Flash Sale
      if (statusFilter === "active" && product.active === false) return false;
      if (statusFilter === "inactive" && product.active !== false) return false;
      if (statusFilter === "flash_sale" && !product.is_flash_sale) return false;

      return true;
    });
  }, [initialProducts, selectedGameId, searchQuery, statusFilter]);

  // Filtered games inside dropdown search
  const filteredGamesList = React.useMemo(() => {
    if (!gameSearchInDropdown.trim()) return games;
    return games.filter((g) => g.name.toLowerCase().includes(gameSearchInDropdown.toLowerCase().trim()));
  }, [games, gameSearchInDropdown]);

  // Selected game object
  const selectedGameObject = React.useMemo(() => {
    if (selectedGameId === "all") return null;
    return games.find((g) => g.id === selectedGameId);
  }, [games, selectedGameId]);

  // Pagination Calculations
  const totalItems = filteredProducts.length;
  const isAll = pageSize === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedProducts = React.useMemo(() => {
    if (isAll) return filteredProducts;
    const startIndex = (activePage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, activePage, pageSize, isAll]);

  // Handlers
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentPage(1);
    setIsGameDropdownOpen(false);
    setGameSearchInDropdown("");
    updateUrlParams({ gameId, page: 1 });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrlParams({ q: val, page: 1 });
  };

  const handleStatusSelect = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setIsStatusDropdownOpen(false);
    updateUrlParams({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    updateUrlParams({ page: validPage });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateUrlParams({ limit: size, page: 1 });
  };

  const handleResetFilters = () => {
    setSelectedGameId("all");
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
    updateUrlParams({ gameId: "all", q: "", status: "all", page: 1 });
  };

  const isFilterActive = selectedGameId !== "all" || searchQuery.trim() !== "" || statusFilter !== "all";

  // CRUD Handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteState({ isOpen: true, id, name, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteState((prev) => ({ ...prev, loading: true }));
    const result = await deleteProduct(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState((prev) => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Berhasil Dihapus", `Produk "${deleteState.name}" telah berhasil dihapus.`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateProduct(id);
    if (result.error) {
      showNotification("error", "Gagal Menduplikasi", result.error);
    } else {
      showNotification("success", "Berhasil Diduplikasi", "Produk telah berhasil diduplikasi.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const nextStatus = !currentStatus;
    const result = await toggleProductStatus(id, nextStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification(
        "success",
        "Status Diperbarui",
        `Produk "${name}" sekarang ${nextStatus ? "Aktif" : "Nonaktif"}.`
      );
    }
  };

  // Pagination Window Numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (activePage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (activePage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <>
      {NotificationComponent}
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products & Prices</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                currency === "MYR"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              }`}
            >
              <span className="text-sm leading-none">{currency === "MYR" ? "🇲🇾" : "🇮🇩"}</span>
              <span>{currency === "MYR" ? "MYR (RM)" : "IDR (Rp)"}</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola katalog produk, harga nominal ({currency === "MYR" ? "Ringgit Malaysia - RM" : "Rupiah Indonesia - Rp"}), varian produk, dan filter per game.
          </p>
        </div>
        <Button onClick={handleAdd} className="shrink-0 shadow-sm font-semibold">
          + Add Product
        </Button>
      </div>

      {/* Modern Responsive Filter Toolbar with high stacking context */}
      <div className="relative z-30 bg-card/70 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-border/70 shadow-xs mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          
          {/* 1. Custom Game Selector Dropdown */}
          <div className="relative z-40 w-full md:w-72 shrink-0" ref={gameDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsGameDropdownOpen(!isGameDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className={`w-full h-10 px-3 flex items-center justify-between gap-2.5 rounded-lg border text-sm transition-all bg-background text-left ${
                isGameDropdownOpen 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-input hover:border-border hover:bg-muted/30"
              } ${selectedGameId !== "all" ? "font-semibold text-primary" : "text-foreground"}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                  {selectedGameObject?.image_url ? (
                    <Image src={selectedGameObject.image_url} alt="" fill sizes="20px" className="object-cover" />
                  ) : (
                    <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate">
                  {selectedGameObject ? selectedGameObject.name : "Semua Game"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {selectedGameId === "all" ? initialProducts.length : (gameProductCounts[selectedGameId] || 0)}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isGameDropdownOpen ? "rotate-180 text-primary" : ""}`} />
              </div>
            </button>

            {/* Floating Dropdown Menu */}
            {isGameDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                {/* Search inside Game list */}
                {games.length > 6 && (
                  <div className="px-2.5 pb-2 pt-1 border-b border-border/60">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cari game..."
                        value={gameSearchInDropdown}
                        onChange={(e) => setGameSearchInDropdown(e.target.value)}
                        className="w-full h-8 pl-8 pr-2.5 bg-muted/60 border border-transparent rounded-md text-xs focus:bg-background focus:border-input focus:outline-hidden"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto px-1 pt-1 space-y-0.5">
                  {/* All Games Option */}
                  <button
                    type="button"
                    onClick={() => handleGameSelect("all")}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedGameId === "all"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                      <span>Semua Game</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{initialProducts.length} Produk</span>
                      {selectedGameId === "all" && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </button>

                  {/* Game Items */}
                  {filteredGamesList.map((g) => {
                    const isSelected = selectedGameId === g.id;
                    const count = gameProductCounts[g.id] || 0;

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGameSelect(g.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div className="relative w-5 h-5 rounded-md bg-muted overflow-hidden shrink-0 border border-border/50">
                            {g.image_url ? (
                              <Image src={g.image_url} alt="" fill sizes="20px" className="object-cover" />
                            ) : (
                              <span className="text-[8px] flex items-center justify-center h-full text-muted-foreground font-bold">
                                {g.name.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <span className="truncate">{g.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{count} SKU</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}

                  {filteredGamesList.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Game tidak ditemukan.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Instant Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari produk, nominal, varian (iOS/Android)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-8 h-10 bg-background border-input text-sm rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full"
                title="Hapus pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 3. Status Filter Dropdown */}
          <div className="relative z-40 w-full md:w-48 shrink-0" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsGameDropdownOpen(false);
              }}
              className={`w-full h-10 px-3 flex items-center justify-between gap-2 rounded-lg border text-sm transition-all bg-background text-left ${
                isStatusDropdownOpen
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-input hover:border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate text-xs font-medium">
                  {statusFilter === "all" && "Semua Status"}
                  {statusFilter === "active" && "🟢 Aktif Saja"}
                  {statusFilter === "inactive" && "🔴 Nonaktif Saja"}
                  {statusFilter === "flash_sale" && "⚡ Flash Sale"}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isStatusDropdownOpen ? "rotate-180 text-primary" : ""}`} />
            </button>

            {/* Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                {[
                  { id: "all", label: "Semua Status", icon: SlidersHorizontal },
                  { id: "active", label: "Aktif Saja", icon: CheckCircle2, color: "text-emerald-500" },
                  { id: "inactive", label: "Nonaktif Saja", icon: XCircle, color: "text-rose-500" },
                  { id: "flash_sale", label: "Flash Sale Saja", icon: Zap, color: "text-amber-500" },
                ].map((st) => {
                  const isSelected = statusFilter === st.id;
                  const Icon = st.icon;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStatusSelect(st.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${st.color || "text-muted-foreground"}`} />
                        <span>{st.label}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Reset Button */}
          {isFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground shrink-0 border-dashed"
              title="Reset Semua Filter"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Reset</span>
            </Button>
          )}
        </div>

        {/* Results Tag & Rows Selector Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Menampilkan <strong>{totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1}</strong> -{" "}
              <strong>{isAll ? totalItems : Math.min(activePage * pageSize, totalItems)}</strong> dari{" "}
              <strong>{totalItems}</strong> produk
            </span>

            {selectedGameId !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold text-[11px] border border-primary/20">
                Game: {selectedGameObject?.name || "Selected"}
                <button type="button" onClick={() => handleGameSelect("all")} className="hover:opacity-75">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-0.5 rounded-full font-medium text-[11px] border border-border/60">
                &quot;{searchQuery}&quot;
                <button type="button" onClick={() => handleSearchChange("")} className="hover:opacity-75">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-0.5 rounded-full font-medium text-[11px] border border-border/60">
                Status: {statusFilter}
                <button type="button" onClick={() => handleStatusSelect("all")} className="hover:opacity-75">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-7 px-2 bg-background border border-input rounded-md text-xs text-foreground cursor-pointer font-medium focus:ring-1 focus:ring-primary"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="-1">Semua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative z-10 w-full overflow-auto bg-card rounded-xl border shadow-xs">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-16">Game</th>
              <th className="h-12 px-4 font-medium">Product Name</th>
              <th className="h-12 px-4 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Price</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                    {currency === "MYR" ? "🇲🇾 RM" : "🇮🇩 Rp"}
                  </span>
                </div>
              </th>
              <th className="h-12 px-4 font-medium">Status</th>
              <th className="h-12 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedProducts.map((p) => (
              <tr key={p.id} className="border-b transition-colors hover:bg-muted/40">
                <td className="p-4">
                  <div className="relative w-10 h-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shadow-2xs">
                    {p.games?.image_url ? (
                      <Image src={p.games.image_url} alt={p.games.name || "Game"} fill sizes="40px" className="object-cover" />
                    ) : (
                      <span className="text-[9px] text-muted-foreground text-center font-bold">{p.games?.name?.substring(0, 3)}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {p.variant_type && (
                      <span className="inline-flex items-center rounded-md bg-blue-500/10 text-blue-500 px-1.5 py-0.5 text-[10px] font-bold border border-blue-500/20">
                        {p.variant_type}
                      </span>
                    )}
                    {p.is_flash_sale && (
                      <span className="inline-flex items-center rounded-md bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/30">
                        ⚡ FLASH
                      </span>
                    )}
                  </div>
                  {p.names && typeof p.names === "object" && Object.keys(p.names).length > 1 && (
                    <div className="flex items-center flex-wrap gap-1 mt-1">
                      {Object.entries(p.names).map(([c, n]) => {
                        const flag = c === "MYR" ? "🇲🇾" : c === "SGD" ? "🇸🇬" : "🇮🇩";
                        return (
                          <span key={c} className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/50">
                            {flag} {String(n)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {p.games?.name && (
                    <span className="text-xs text-muted-foreground block mt-0.5 font-normal">{p.games.name}</span>
                  )}
                </td>
                <td className="p-4 font-mono">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{formatCurrency(Number(p.price), currency)}</span>
                    {p.is_flash_sale && p.original_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(Number(p.original_price), currency)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <SkeuoStatusBadge
                    checked={p.active ?? true}
                    onToggle={() => handleToggleStatus(p.id, p.active ?? true, p.name)}
                    activeText="Active"
                    inactiveText="Inactive"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                    <Edit className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(p.id)}>
                    <Copy className="h-4 w-4 mr-1" /> Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(p.id, p.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Gamepad2 className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">
                      {isFilterActive
                        ? "Tidak ada produk yang cocok dengan filter atau kata kunci."
                        : "Belum ada produk terdaftar."}
                    </p>
                    {isFilterActive && (
                      <Button variant="outline" size="sm" onClick={handleResetFilters}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filter
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Navigation Bar */}
      {!isAll && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
          <p className="text-xs text-muted-foreground">
            Halaman <strong>{activePage}</strong> dari <strong>{totalPages}</strong> ({totalItems} produk)
          </p>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={activePage === 1}
              className="h-8 w-8 p-0"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Prev Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </Button>

            {/* Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                      ...
                    </span>
                  );
                }

                const pageNumber = Number(pageNum);
                const isSelected = pageNumber === activePage;

                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`h-8 w-8 p-0 text-xs font-medium ${isSelected ? "font-bold shadow-xs" : "text-muted-foreground"}`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={activePage === totalPages}
              className="h-8 w-8 p-0"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        games={games}
        currency={currency}
        supportedCurrencies={supportedCurrencies}
        multiCurrencyEnabled={multiCurrencyEnabled}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini?"
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
