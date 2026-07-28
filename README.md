<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🚀 Intern Backend Boilerplate (NestJS)

Selamat datang di *Template Backend* resmi untuk program Internship. Boilerplate ini dibangun menggunakan **NestJS**, **Prisma ORM**, dan database **TiDB Serverless (MySQL)** dengan berlandaskan arsitektur **Modular Monolith**.

Tujuan utama dari *boilerplate* ini adalah memberikan contoh struktur kode kelas *Production* yang kokoh, sehingga Anda memiliki referensi (contekan) mutlak tentang bagaimana menulis kode yang benar, aman, dan mudah dipelihara.

---

## 🏗️ Cara Menggunakan Template Ini (Untuk Project Baru)

Jika Anda ditugaskan untuk membuat proyek backend baru berdasarkan kerangka ini, **JANGAN melakukan *clone* biasa**. Gunakan fitur Template GitHub agar riwayat *commit* lama tidak ikut terbawa:

1. Di halaman utama repositori GitHub ini, klik tombol hijau bertuliskan **"Use this template"** (di pojok kanan atas).
2. Pilih **"Create a new repository"**.
3. Beri nama repositori baru Anda (contoh: `backend-kasir-api`), lalu klik **Create repository**.
4. Setelah repositori baru Anda terbuat, silakan di-*clone* ke komputer lokal Anda:
   ```bash
   git clone https://github.com/diskominfo-intern/backend-kasir-api.git
   ```
5. Ubah judul di baris pertama `README.md` ini dengan nama proyek baru Anda, lalu jalankan `npm install`.

---

## 🌐 Panduan Deployment ke cPanel Diskominfo (1 Slot Node.js App)

Untuk mempublikasikan (*deploy*) backend NestJS ini ke cPanel Diskominfo bersama dengan frontend Next.js menggunakan **1 Slot Node.js App (Phusion Passenger)** tanpa akses SSH:

1. **Kompilasi Build**:
   ```bash
   npm run build
   ```
   Hasil kompilasi TypeScript akan tersimpan di folder `dist/`.

2. **Migrasi & Seed Database dari Lokal**:
   Hubungkan `DATABASE_URL` di file `.env` ke MySQL cPanel (izinkan IP lokal Anda di menu **Remote MySQL** cPanel):
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Deploy & Master Gateway**:
   Backend akan dijalankan di port internal (misal `3002`) oleh Master Gateway (`app.js`).
   Panduan lengkap 1-click packing (`deploy-cpanel.tar.gz`) dapat dilihat pada repositori blueprint **[how-to-deploy](https://github.com/diskominfo-intern/how-to-deploy)**.

---

## 📂 Panduan Navigasi Direktori (PENTING!)

Seluruh kode Anda akan hidup di dalam folder `src/`. Kami membagi kode menjadi dua bagian utama: **`core/`** dan **`modules/`**.

**Visualisasi Struktur Folder:**
```text
src/
├── core/                   # Inti penyokong aplikasi (Global)
│   ├── dto/                # Global DTOs (contoh: pagination)
│   ├── filters/            # Global Exception Filters (Error format)
│   ├── guards/             # Penjaga rute keamanan (JWT Guard)
│   ├── interceptors/       # Global Interceptors (Success format)
│   └── prisma/             # Konfigurasi Database Prisma
│
└── modules/                # Tempat seluruh fitur aplikasi hidup (Area Kerja)
    ├── auth/               # Modul Login & Register
    ├── product/            # Modul CRUD Referensi Utama
    └── user/               # Modul Pengguna
```

### 1. `src/core/` (Infrastruktur & Pondasi)
Folder ini mengurus urusan di belakang layar (sistem keamanan, penangkap error, validasi). **Secara umum, JANGAN UBAH isi folder ini** kecuali Anda mengerti apa yang Anda lakukan.
- **`dto/pagination.dto.ts`**: Kelas standar parameter (*page* dan *limit*). Selalu gunakan ini jika fitur Anda membutuhkan *List* data berjumlah banyak.
- **`filters/`**: Menangkap semua jenis error (*crash*) dan merapikannya menjadi JSON agar tidak merusak frontend (Termasuk menangkap error duplikasi `P2002` dari Prisma).
- **`guards/`**: Berisi `JwtAuthGuard` yang bertugas sebagai *satpam* penjaga rute API dari user yang belum login.

---

### 2. `src/modules/` (Area Kerja Anda!)
Di sinilah Anda akan *ngoding* setiap hari. Setiap fitur/tabel dalam database **HARUS** dipisah menjadi satu folder di sini (misal: `user/`, `order/`, `payment/`). 

Berikut penjelasan untuk modul bawaan *template* ini:

#### 📌 Modul `auth/` (Sistem Login & Register)
Menangani pembuatan **Token JWT** dan pencocokan **Password bcrypt**.
- **Apakah perlu diubah?** Secara standar, **TIDAK PERLU**. Proses login (menghasilkan *access_token*) dan register (insert ke database) sudah siap pakai.
- **Kapan harus diedit?** Jika pembimbing/klien meminta fitur tambahan seperti *Forgot Password*, *Reset Password*, atau *Login with Google/SSO*. Anda bisa menambahkannya di `auth.controller.ts` dan melampirkan logikanya di `auth.service.ts`.

#### 📌 Modul `product/` (CONTOH "CRUD" REFERENSI UTAMA)
Folder ini **sengaja kami lengkapi secara sempurna** agar bisa Anda jadikan *benchmark* atau acuan saat Anda ditugaskan membuat modul/tabel baru! 

- **Bagaimana cara memvalidasi Request (DTO)?** 
  Coba buka `src/modules/product/dto/create-product.dto.ts`. Perhatikan bagaimana kita mendefinisikan *class* dengan `@IsString()` dan `@Min(0)`. Jika *Frontend* berulah dan mengirim harga minus, permintaan tersebut otomatis tertolak! Selalu gunakan pola ini!
  
- **Di mana logika Database ditulis? (Contoh GetAll Paginasi)**
  Buka `product.service.ts`. **Controller dilarang menyentuh database**, maka fungsi pencarian data ditulis di Service.
  Contoh cara membuat fitur "*Get All*" menggunakan Prisma lengkap dengan Paginasi:
  ```typescript
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit; // Hitung offset

    // Panggil tabel dari database secara paralel
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ skip, take: limit }), // Ambil data
      this.prisma.product.count(),                         // Ambil total
    ]);
    
    // Response dengan struktur meta yang elegan
    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }
  ```

- **Bagaimana membatasi hak akses Endpoint?**
  Lihat `product.controller.ts`. Jika Anda ingin Endpoint (misal `POST`) **HANYA BISA DIAKSES** oleh orang yang sudah Login, bubuhkan `@UseGuards(JwtAuthGuard)` tepat di atas fungsi *Controller*-nya. Endpoint tersebut akan aman seketika.

#### 📌 Modul `user/` (Contoh Data Profil)
Buka `user.controller.ts`, di sana ada fungsi `getProfile()`. Karena endpoint ini dijaga oleh `@UseGuards(JwtAuthGuard)`, Anda bisa dengan mudah mengambil data sesi login pengguna dengan param `@Request() req`, lalu me-return `req.user`. Sesederhana itu!

---

## 🛠️ Panduan Standar Respons & Error Handling

Template ini sudah memiliki sistem otomatis untuk membungkus balasan API (*Interceptor*) dan menangkap *error* (*Exception Filter*). Anda **DILARANG KERAS** menggunakan manipulasi response manual seperti `res.status(200).send()`.

### 1. Membalas Request Berhasil (Success Response)
Semua fungsi di *Controller* yang me-return sesuatu akan otomatis dibungkus menjadi JSON standar: `{ status, message, data }`.

**Contoh A: Pesan Default "Success"**
```typescript
// Di Service / Controller cukup return data mentah:
return [{ id: 1, name: 'Baju' }];

// 🪄 Output JSON ke Frontend Otomatis:
// { "status": "success", "message": "Success", "data": [{ "id": 1, "name": "Baju" }] }
```

**Contoh B: Pesan Custom**
```typescript
// Jika ingin pesan spesifik, return object { message, data }:
return { message: 'Produk berhasil dicheckout!', data: newOrder };

// 🪄 Output JSON ke Frontend Otomatis:
// { "status": "success", "message": "Produk berhasil dicheckout!", "data": { ... } }
```

### 2. Melempar Error (Error Handling / Throwing)
Jika validasi logika bisnis gagal (contoh: barang habis, atau data tidak ada), Anda cukup menggunakan keyword `throw` milik NestJS di dalam file *Service*.

```typescript
// Contoh implementasi di dalam product.service.ts
async findOne(id: number) {
  const product = await this.prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    // ❌ SALAH BESAR: return { status: 'error', message: 'Tidak ketemu' }
    
    // ✅ BENAR: Lempar error bawaan NestJS!
    throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
  }
  
  return product;
}
```
*Daftar Exception NestJS yang paling sering digunakan intern:*
- `BadRequestException('Pesan')` ➡️ Validasi gagal / input salah (HTTP 400)
- `UnauthorizedException('Pesan')` ➡️ Gagal login / Token JWT expired (HTTP 401)
- `ForbiddenException('Pesan')` ➡️ Akses ditolak / Fitur khusus Admin (HTTP 403)
- `NotFoundException('Pesan')` ➡️ Data tidak ada di database (HTTP 404)
- `ConflictException('Pesan')` ➡️ Data bentrok / Saldo minus (HTTP 409)

> **✨ MAGIC PRISMA**: Khusus error teknis database Prisma (seperti gagal insert karena `email` sudah ada di tabel User), Anda tidak perlu *throw* secara manual! Biarkan Prisma memprosesnya, *Global Filter* kita akan menyulap kode error `P2002` Prisma tersebut menjadi JSON berstatus `409 Conflict` secara gaib.

---

## 🛡️ Standar Kode Enterprise (Wajib Dibaca!)

Proyek ini telah dibekali dengan penjaga otomatis agar kualitas kode Anda setara dengan *engineer* profesional:

1. **Auto-Formatting (Husky + Prettier + Lint-Staged)**
   Setiap kali Anda mengetik `git commit`, robot bernama **Husky** akan mencegatnya dan menjalankan linter serta **Prettier**. Ia akan otomatis memperbaiki spasi, *indentation*, *single-quote*, dan titik koma (*semicolon*) di seluruh file `.ts` Anda. Jika ada *error* Typescript parah, *commit* akan digagalkan! Tulis kode serapi mungkin.
2. **Scalar API Reference**
   Kami menggunakan ekosistem `@scalar/nestjs-api-reference`. Semua endpoint yang Anda buat akan otomatis terdokumentasi dengan UI yang interaktif dan mewah bak Postman di dalam browser.
3. **Git Commit Convention (Aturan Wajib)**
   Anda DILARANG keras menulis pesan commit sembarangan (contoh: "update", "fix bug", "bismillah"). Gunakan format **Conventional Commits**:
   - `feat: [pesan]` ➡️ Untuk menambah fitur baru (contoh: `feat: buat endpoint get product`).
   - `fix: [pesan]` ➡️ Untuk memperbaiki *bug* (contoh: `fix: perbaiki error prisma saat checkout`).
   - `chore: [pesan]` ➡️ Untuk perubahan konfigurasi/alat (contoh: `chore: tambah linter`).
   - `refactor: [pesan]` ➡️ Untuk merapikan kode tanpa mengubah fitur.

---

## 🚀 Cara Menjalankan Project (Getting Started)

1. **Instal Dependencies**: `npm install`
2. **Setup File `.env` & Database**: Salin konfigurasi ini ke file `.env` (sejajar dengan package.json)
   ```env
   # Contoh 1: Menggunakan TiDB Serverless (MySQL)
   DATABASE_URL="mysql://<user>:<password>@<host>:4000/<dbname>?sslaccept=strict"
   
   # Contoh 2: Menggunakan MySQL Local (XAMPP/Laragon)
   # DATABASE_URL="mysql://root:@localhost:3306/db_intern"

   # Contoh 3: Menggunakan PostgreSQL Local
   # DATABASE_URL="postgresql://postgres:password@localhost:5432/db_intern?schema=public"
   
   JWT_SECRET="secret-key-super-aman-anda"
   ```
   > ⚠️ **PENTING JIKA PAKAI POSTGRESQL**:
   > Secara default template ini menggunakan MySQL. Jika Anda menggunakan **PostgreSQL**, Anda WAJIB membuka file `prisma/schema.prisma` dan mengubah `provider = "mysql"` menjadi `provider = "postgresql"`.
3. **Generate & Sync Prisma**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. **Jalankan Aplikasi**: `npm run start:dev`

Server menyala di `http://localhost:3000`. Langsung buka browser dan tes API Anda di **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**.

---

## 🔄 Alur Permintaan (Lifecycle of a Request)

Pahami bagaimana sebuah *request* berjalan dari awal hingga akhir di dalam sistem NestJS kita:
**`Client`** ➡️ **`Global ValidationPipe`** *(Cek DTO)* ➡️ **`Controller`** *(Terima Request)* ➡️ **`Service`** *(Proses Logika)* ➡️ **`Prisma`** *(Akses DB)* ➡️ **`Service`** ➡️ **`Global Interceptor`** *(Bungkus JSON)* ➡️ **`Client`**

> Semua error yang Anda lempar (*throw*) di tengah jalan akan dicegat otomatis oleh `Global Exception Filter` sebelum sampai ke `Client`.

---

## 💡 Aturan Emas (The Golden Rules)

Agar kode Anda tidak ditolak saat *Code Review*, Anda **WAJIB** mematuhi 4 aturan mutlak ini:

1. **Service is the King:** Segala bentuk *business logic* (aturan bisnis, perhitungan, validasi status) WAJIB berada di `Service` (kelas yang dihiasi `@Injectable()`). Jangan pernah menaruh logika bisnis di `Controller`!
2. **Controller is Just a Butler:** Tugas `Controller` HANYA tiga: Menerima *request*, memanggil `Service`, dan mengembalikan *response*.
3. **Strict Isolation (Isolasi Ketat Antar Modul):** Modul `Product` **DILARANG KERAS** melakukan query ke tabel user secara langsung (`this.prisma.user`). Jika `Product` butuh data dari tabel User, maka `ProductModule` harus meng-import `UserModule`, dan memanggil metode milik `UserService`.
4. **Validasi Mutlak Lewat DTO:** Validasi *request body* murni dilakukan menggunakan *class-validator* di dalam file DTO (*Data Transfer Object*). Jangan pernah melakukan `if(!req.body.name)` secara manual!

---

## 🏗️ Advanced Architecture (Panduan Skala Besar)

Jika sewaktu-waktu Anda ditugaskan untuk mengimplementasikan fitur-fitur berskala besar (*advanced*), ikuti acuan peletakan file ini agar pola *Modular Monolith* kita tetap bersih dan terisolasi:

1. **Redis (Caching)**
   - **Setup/Koneksi:** Konfigurasi dasar diletakkan di `src/core/redis/` atau `app.module.ts`.
   - **Eksekusi:** Digunakan (di-*inject*) langsung di dalam `Service`. (Contoh: *Cache* daftar harga dipanggil di dalam `product.service.ts`).
2. **Cron Jobs (Task Scheduling / Penjadwalan Otomatis)**
   - **Lokasi File:** Buat file khusus dengan akhiran `.cron.ts` atau `.task.ts` **di dalam folder modul** yang bersangkutan.
   - **Contoh:** Tugas otomatis untuk mereset stok produk diletakkan di `src/modules/product/product.cron.ts`. *DILARANG* membuat folder `cron` global yang mencampuradukkan semua tugas domain bisnis!
3. **Background Workers (Queues / BullMQ / RabbitMQ)**
   - **Setup Infrastruktur:** Konfigurasi antrean berada di `src/core/queue/`.
   - **Producer (Pembuat Antrean):** Diletakkan di dalam `Service` biasa.
   - **Consumer/Processor (Pekerja Background):** Buat file berakhiran `.processor.ts` di dalam modul terkait. (Contoh: Pekerja yang mengirimkan email diletakkan di `src/modules/notification/notification.processor.ts`).
4. **Aturan Multi-Service dalam Satu Modul**
   - **Skala Kecil (2-3 Service):** Jika Anda membuat fitur ekstra kecil (misal `product-discount.service.ts`), biarkan sejajar dengan `product.service.ts` di dalam folder modul `product/`.
   - **Skala Besar (>3 Service):** Jika servis mulai menumpuk, buat sub-folder `services/` dan `controllers/` di dalam modul tersebut agar tetap sejajar. Sebagai contoh:
     ```text
     src/
     └── modules/
         └── product/                  <-- (Folder Utama Modul Product)
             ├── controllers/          <-- (Sejajar)
             │   ├── product.controller.ts
             │   └── product-review.controller.ts
             │
             ├── services/             <-- (Sejajar)
             │   ├── product.service.ts
             │   ├── product-discount.service.ts
             │   └── product-review.service.ts
             │
             ├── dto/                  <-- (Sejajar)
             │   └── create-product.dto.ts
             │
             └── product.module.ts     <-- (Berada di luar agar mengikat semuanya)
     ```
   - **⚠️ Lampu Kuning:** Jika sebuah modul dirasa memiliki terlalu banyak *Service*, itu pertanda arsitekturnya salah. Pisahkan fitur tersebut menjadi Modul baru yang mandiri! (Contoh: Pisahkan fitur *Review* dari Modul `Product` menjadi `ReviewModule` tersendiri).
