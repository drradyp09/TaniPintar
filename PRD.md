# Product Requirement Document (PRD) - TaniPintar

## 1. Pendahuluan
**TaniPintar** adalah aplikasi teknologi pertanian yang dirancang untuk memantau, mengambil data, dan mengintegrasikan sensor di lahan pertanian. Aplikasi ini bertujuan untuk mendukung pertanian presisi melalui sistem akuisisi data lokal dan cloud, serta fitur cerdas berbasis pengolahan citra untuk kesehatan tanaman.

## 2. Target Pengguna
- Dosen dan Peneliti (bidang Agroekoteknologi)
- Mahasiswa Pertanian
- Petani modern
- penyuluh pertanian
- Kelompok tani
- Admin / Superadmin Sistem

## 3. Lingkup Aplikasi
Aplikasi ini berbasis web (Web Application) yang dioptimalkan untuk tampilan mobile (Mobile-First Design) dan dikembangkan sebagai Progressive Web App (PWA) agar dapat diinstal pada perangkat Android layaknya aplikasi native.

## 4. Fitur Utama

### 4.1. Manajemen Pengguna (User Management)
- **Registrasi**: Pengguna baru wajib mendaftar dengan menyertakan:
  - Username
  - Email
  - Password
- **Login**: Akses aplikasi dibatasi hanya untuk pengguna yang telah login.

### 4.2. Integrasi IoT & Monitoring Lahan
- **Arsitektur Sistem IoT**: Sensor terhubung ke Datalogger mandiri (standalone) yang mengirim data via internet, bukan terhubung fisik ke HP.
- **Registrasi Perangkat**: Datalogger wajib didaftarkan (register) ke dalam sistem TaniPintar sebelum dapat mengirim data.
- **Protokol Komunikasi**: Pengiriman data menggunakan HTTP API (REST) dengan payload JSON.
- **Keamanan**: Autentikasi perangkat (misal: API Key/Token) saat transmisi data.
- **Visualisasi Data**: Menampilkan grafik dan indikator real-time dari data sensor (misal: suhu, kelembaban, pH tanah).
- **Histori Data**: Menyimpan dan menampilkan riwayat data sensor untuk analisis jangka panjang.
- **Akuisisi Data**: Mendukung sinkronisasi data baik secara lokal maupun ke cloud server.

### 4.3. Pengukuran Kadar Klorofil Daun
- **Analisis Citra**: Menggunakan kamera smartphone untuk mengambil gambar daun dan mengestimasi kadar klorofilnya.
- **Non-Destruktif**: Metode pengukuran tanpa merusak tanaman.

### 4.4. Sistem Rekomendasi Cerdas
- **Rekomendasi Pupuk**: Memberikan saran dosis dan jenis pupuk berdasarkan:
  - Hasil pengukuran kadar klorofil daun.
  - Usia tanaman.
  - Fase pertumbuhan tanaman (vegetatif/generatif).

### 4.5. Manajemen Admin (Back-Office)
- **Role Management (RBAC)**: Admin dapat mengatur level akses pengguna (misal: membatasi fitur tertentu untuk user gratis vs berbayar, atau akses khusus peneliti).
- **User Management**: Mengelola data pengguna (blokir, reset password, verifikasi).
- **System Monitoring**: Memantau kesehatan sistem dan statistik penggunaan aplikasi.

### 4.6. Asisten Cerdas (Chatbot AI)
- **Interaksi Pengguna**: Fitur chating interaktif untuk membantu pengguna.
- **Topik Bantuan**:
  - Konsultasi kebutuhan pupuk dan kesehatan tanaman.
  - Panduan teknis integrasi sensor IoT ke sistem TaniPintar.
  - Navigasi dan penggunaan fitur aplikasi.

## 5. Spesifikasi Teknis

### 5.1. Platform
- **Frontend**: Web Technology (HTML, CSS, JavaScript/Framework Modern).
- **PWA**: Manifest dan Service Worker untuk dukungan installable di Android.
- **Backend & Database**: Menyediakan API untuk autentikasi, penyimpanan data sensor, dan logika rekomendasi.

### 5.2. Konektivitas & Protokol
- **IoT Ingestion**: Endpoint API khusus untuk menerima data JSON dari datalogger.
- **Dukungan**: Mode online (Cloud) untuk monitoring real-time.

## 6. Alur Pengguna (User Flow) Ringkas
1. Pengguna membuka aplikasi (atau menginstal PWA).
2. Halaman Login/Register muncul.
3. Setelah login, masuk ke Dashboard Utama.
4. Menu tersedia:
   - **Monitoring**: Lihat data sensor.
   - **Scan Daun**: Buka kamera -> Foto Daun -> Hasil Klorofil -> Rekomendasi Pupuk.
   - **Tanya Tani (Chatbot)**: Buka chat -> Tanyakan masalah -> Dapatkan solusi instan.
   - **Profil/Pengaturan**: Manajemen akun dan perangkat sensor.
