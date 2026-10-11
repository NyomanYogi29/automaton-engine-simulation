import { useState, useRef, type ChangeEvent } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { PRESET_DFAS } from '@/core/presets';
import { useToast } from '@/hooks/useToast';
import { exportDFAAsJSON, parseDFAJSON, exportCanvasAsPNG } from '@/lib/exportImport';
import { Button } from '@/components/common';
import {
  Layers,
  BookOpen,
  Download,
  Upload,
  Image as ImageIcon,
  Network,
  ChevronDown,
} from 'lucide-react';

export interface TopNavbarProps {
  onOpenAlphabetDrawer: () => void;
  onOpenLanguageDrawer: () => void;
  canvasContainerId?: string;
}

export function TopNavbar({
  onOpenAlphabetDrawer,
  onOpenLanguageDrawer,
  canvasContainerId = 'automaton-canvas',
}: TopNavbarProps) {
  const { dfa, loadPreset, setDFA } = useAutomatonStore();
  const { showToast } = useToast();
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger JSON download for current DFA
  const handleExportJSON = () => {
    try {
      exportDFAAsJSON(dfa);
      showToast('success', 'Ekspor JSON Berhasil', `File konfigurasi "${dfa.name}" berhasil diunduh.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekspor file JSON.';
      showToast('error', 'Ekspor Gagal', msg);
    }
  };

  // Trigger hidden file picker
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Parse imported JSON file and update DFA store
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        showToast('error', 'Impor Gagal', 'Isi berkas tidak dapat dibaca.');
        return;
      }

      const result = parseDFAJSON(content);
      if (result.success && result.dfa) {
        setDFA(result.dfa);
        showToast(
          'success',
          'Impor JSON Berhasil',
          `Mesin "${result.dfa.name}" berhasil dimuat ke kanvas.`,
        );
      } else {
        showToast(
          'error',
          'Format File Tidak Sesuai',
          result.error || 'Pastikan file memiliki 5-tuple DFA yang lengkap.',
        );
      }
    };

    reader.onerror = () => {
      showToast('error', 'Impor Gagal', 'Terjadi kesalahan saat membaca file.');
    };

    reader.readAsText(file);
  };

  // Export current canvas diagram to PNG image
  const handleExportPNG = async () => {
    const element = document.getElementById(canvasContainerId);
    if (!element) {
      showToast('error', 'Ekspor Gagal', 'Elemen kanvas diagram tidak ditemukan.');
      return;
    }

    try {
      setIsExportingPNG(true);
      await exportCanvasAsPNG(element, `otomata_${dfa.name}`);
      showToast(
        'success',
        'Ekspor PNG Berhasil',
        'Diagram kanvas berhasil disimpan sebagai berkas gambar PNG.',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat merender kanvas.';
      showToast('error', 'Ekspor Gagal', msg);
    } finally {
      setIsExportingPNG(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between select-none">
      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Unggah file JSON DFA"
      />

      {/* Left: Branding & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Otomata Lab</h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              DFA / NFA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            Simulator Teori Bahasa & Otomata
          </p>
        </div>
      </div>

      {/* Center: Preset Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="dfa-preset-picker" className="text-xs text-slate-400 hidden lg:inline">
          Preset:
        </label>
        <div className="relative">
          <select
            id="dfa-preset-picker"
            value={dfa.name}
            onChange={(e) => loadPreset(e.target.value)}
            className="h-8 pl-2.5 pr-7 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
          >
            {PRESET_DFAS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
            {/* If current DFA is a custom name not in presets, keep it selected */}
            {!PRESET_DFAS.some((p) => p.name === dfa.name) && (
              <option value={dfa.name}>{dfa.name} (Kustom)</option>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Drawer Triggers & Import/Export Utilities */}
      <div className="flex items-center gap-1.5">
        {/* Level 1 & 2 Drawers */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenAlphabetDrawer}
          icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />}
          className="text-xs h-8"
          title="Buka Alfabet & String Playground (Level 1)"
        >
          <span className="hidden sm:inline">Alfabet (L1)</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenLanguageDrawer}
          icon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
          className="text-xs h-8"
          title="Buka Pemeriksaan Bahasa (Level 2)"
        >
          <span className="hidden sm:inline">Bahasa (L2)</span>
        </Button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Export / Import Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          icon={<Download className="w-3.5 h-3.5 text-slate-300" />}
          className="text-xs h-8"
          title="Ekspor DFA ke format JSON"
        >
          <span className="hidden md:inline">Ekspor JSON</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTriggerFileInput}
          icon={<Upload className="w-3.5 h-3.5 text-slate-300" />}
          className="text-xs h-8"
          title="Impor konfigurasi DFA dari file JSON"
        >
          <span className="hidden md:inline">Impor JSON</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportPNG}
          isLoading={isExportingPNG}
          icon={<ImageIcon className="w-3.5 h-3.5 text-cyan-400" />}
          className="text-xs h-8 bg-slate-800 hover:bg-slate-700"
          title="Simpan diagram kanvas ke format gambar PNG"
        >
          <span className="hidden md:inline">Ekspor PNG</span>
        </Button>
      </div>
    </header>
  );
}
