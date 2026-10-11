# Otomata Lab

Web application interaktif untuk simulasi, verifikasi formal, dan visualisasi teori bahasa dan otomata (DFA & NFA). Aplikasi ini dibangun dengan pendekatan *Canvas-First Workspace*, menyinkronkan grafik diagram mesin secara dua arah dengan matriks tabel transisi.

---

## Fitur Utama

### 1. Alfabet & String Playground (Level 1)
- **Definisi Alfabet Formal ($\Sigma$):** Notasi himpunan formal dengan validasi penolakan simbol duplikat dan simbol kosong.
- **Validasi String:** Pendeteksian keabsahan string $w \in \Sigma^*$ dengan penyorotan simbol yang tidak dikenal.
- **Operasi Panjang & Konkatenasi:** Perhitungan $|w|$, verifikasi sifat non-komutatif $w \cdot v \ne v \cdot w$, dan hukum identitas string kosong $w \cdot \varepsilon = w$.
- **Generator $\Sigma^n$ & $\Sigma^*$:** Pembangkit kombinasi string dengan panjang tepat $n$ serta deret bintang Kleene $\Sigma^*$ terurut bergradasi.

### 2. Pemeriksaan Aturan Bahasa (Level 2)
- **5 Preset Aturan Bahasa Formal:**
  1. Diawali simbol 'a'
  2. Diakhiri simbol 'b'
  3. Panjang string tepat 2 ($|w| = 2$)
  4. Hanya berisi simbol 'b' ($w \in \{b\}^*$)
  5. Jumlah kemunculan 'a' bernilai genap
- **Uji Keanggotaan String:** Evaluasi deterministik dengan penjelasan formal penyebab diterima atau ditolaknya string.
- **Visualisasi Subset $L \subseteq \Sigma^*$:** Pemetaan visual himpunan bagian string $\Sigma^*$ hingga panjang $k$ dengan rasio persentase keterisian.

### 3. DFA Engine & Diagram Kanvas Interaktif (Level 3 & 4)
- **Representasi 5-Tuple Formal:** $M = (Q, \Sigma, \delta, q_0, F)$ dengan validasi kelengkapan deterministik penuh.
- **Sinkronisasi Dua Arah:** Modifikasi pada tabel transisi otomatis merender node dan edge pada kanvas `@xyflow/react`, dan sebaliknya.
- **Rendering Simbol Gabungan & Busur Lengkung:** Kurva offset dua arah tanpa tumpang tindih, self-loop melingkar, dan penggabungan simbol menuju target yang sama (`0, 1`).
- **Simulasi Langkah demi Langkah:** Penelusuran pita string simbol demi simbol, node aktif menyala (*infrantery active glow*), selebrasi confetti pada string diterima, dan banner hasil ringkas formal.
- **Bantuan Dead-State Otomatis:** Deteksi sel transisi kosong dan pengarahan otomatis ke state $q_{dead}$.

### 4. Penguji Massal (Batch Test Runner)
- Uji massal daftar string input beserta harapan (diterima / ditolak).
- Ringkasan statistik rasio kelulusan.
- Peringatan dini jika daftar uji tidak memuat string kosong $\varepsilon$.

### 5. Utilitas Ekspor & Impor
- **Ekspor & Impor JSON:** Menyimpan dan memuat konfigurasi mesin otomata formal dalam format JSON.
- **Ekspor Gambar PNG:** Mengunduh diagram visual kanvas ke format gambar PNG berkualitas tinggi.

---

## Preset Bawaan Perkuliahan

1. **Diakhiri 1** ($\Sigma = \{0, 1\}$)
2. **Diawali a** ($\Sigma = \{a, b\}$, dengan dead state $q_2$)
3. **Jumlah a genap** ($\Sigma = \{a, b\}$, state awal sekaligus akhir)
4. **Aturan Menulis Aksara Bali** ($\Sigma = \{K, V\}$)
5. **Verifikasi PIN ATM 3 Digit** ($\Sigma = \{0, 1, C, E\}$, studi kasus dunia nyata)

---

## Teknologi yang Digunakan

- **Runtime & Package Manager:** Bun
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Diagram Canvas:** `@xyflow/react` (React Flow v12)
- **State Management:** Zustand
- **Styling & UI:** Tailwind CSS v4 + Lucide Icons
- **Pengujian Logika Formal:** Vitest
- **Utilitas Visual:** `canvas-confetti`, `html-to-image`

---

## Cara Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
bun install
```

### 2. Menjalankan Server Pengembang
```bash
bun run dev
```
Buka browser pada alamat `http://localhost:5173`.

### 3. Menjalankan Seluruh Pengujian (Vitest)
```bash
bun run test
```

### 4. Kompilasi & Build Produksi
```bash
bun run build
```
Hasil build produksi siap didistribusikan pada folder `dist/`.
