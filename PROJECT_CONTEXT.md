# Project Context - Migunani

## Ringkasan

Migunani adalah prototype frontend marketplace event volunteer untuk kategori Web Design SEFEST 2026. Aplikasi ini fokus pada tampilan, UX, dan interaksi frontend tanpa backend, database, atau auth sungguhan.

Konsep utama:

- Public user dapat menemukan event volunteer.
- Volunteer dapat masuk melalui role gateway, mendaftar event, melihat status aplikasi, dan melihat sertifikat.
- Organizer dapat masuk melalui role gateway, mengelola event, melihat applicant, dan membuat event baru dengan live preview.

Nama produk: **Migunani**.

## Konteks SEFEST 2026

Tema SEFEST 2026:

```txt
Gen-Z TechPreneur: Digital Solutions for a Sustainable Future
```

Project ini diposisikan ke:

```txt
SDG 8 - Decent Work and Economic Growth
```

Narasi SDG 8:

- Membantu mahasiswa/relawan muda membangun pengalaman dan skill.
- Menyediakan portofolio kontribusi berupa status aplikasi, jam kontribusi, dan sertifikat.
- Membantu organisasi/komunitas mengelola rekrutmen relawan dan performa event.

Rulebook meminta proposal PDF dan link GitHub. Nama repo/proposal sebaiknya mengikuti format:

```txt
SEFEST26WEBDESIGN_NamaTim
```

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Framer Motion dependency tersedia
- Static dummy data

Tidak ada:

- backend
- database
- auth asli
- API eksternal untuk data aplikasi

## Cara Menjalankan

Gunakan Node 22.

```bash
nvm use 22
npm install
npm run dev
```

Build dan lint:

```bash
npm run build
npm run lint
```

Di environment Codex sebelumnya, shell default masih Node 18, jadi command sering dijalankan dengan:

```bash
source /home/eggnocent/.nvm/nvm.sh && nvm exec 22 npm run build
```

## Struktur Route

Public:

```txt
/
/events
/events/:slug
/login
```

Volunteer:

```txt
/volunteer/dashboard
/volunteer/events
/volunteer/events/:slug
/volunteer/apply/:eventId
```

Organizer:

```txt
/organizer
/organizer/events
/organizer/events/:slug
/organizer/applicants
/organizer/applicants?event=<eventId>
/organizer/create
```

## Role Flow

Public tidak boleh menampilkan data personal role.

Public hanya menampilkan:

- landing marketplace
- search event
- featured events
- teaser role relawan dan organizer
- link ke login gateway

Login gateway:

```txt
/login
```

Role gateway memiliki dua card:

- Masuk sebagai Relawan
- Masuk sebagai Organizer

Jika URL memiliki query `next`, role card akan mengarah ke next route yang sesuai, misalnya:

```txt
/login?next=/volunteer/apply/evt-001
```

## Perilaku Volunteer

Volunteer area tidak boleh tiba-tiba kembali ke public kecuali user klik logout.

Navigasi volunteer:

- Dashboard
- Explore
- Apps
- Logout

Explore volunteer:

```txt
/volunteer/events
```

Detail event volunteer:

```txt
/volunteer/events/:slug
```

Jika event sudah pernah didaftari oleh volunteer, detail event tidak boleh menampilkan tombol `Daftar sekarang`. Saat ini diganti menjadi:

```txt
Sudah terdaftar · Status ...
Lihat aplikasi
```

Apply flow:

```txt
/volunteer/apply/:eventId
```

Apply flow memiliki step:

- Role
- Motivasi
- Waktu
- Review

Setelah submit, user diarahkan untuk membuka dashboard.

## Perilaku Organizer

Organizer area tidak boleh tiba-tiba kembali ke public kecuali user klik logout.

Navigasi organizer:

- Organizer
- Applicants
- Explore Events
- Create Event
- Logout

Explore organizer:

```txt
/organizer/events
```

Detail event organizer:

```txt
/organizer/events/:slug
```

Detail event organizer tidak boleh menampilkan tombol daftar relawan. Saat ini menampilkan:

```txt
Event dikelola organizer
Kelola applicant
```

Tombol `Kelola applicant` menuju:

```txt
/organizer/applicants?event=<eventId>
```

Halaman applicants:

```txt
/organizer/applicants
```

Isi halaman:

- stats total applicant
- accepted
- submitted
- search applicant
- select status UI
- tabel applicant

Create event:

```txt
/organizer/create
```

Create event bersifat frontend-only dengan live preview. Untuk event baru, `registered` harus `0`, bukan angka awal dummy.

## File Penting

Routing:

```txt
src/routes/AppRoutes.tsx
```

Layout:

```txt
src/layouts/AppLayout.tsx
src/layouts/DashboardLayout.tsx
src/layouts/SiteHeader.tsx
src/layouts/DashboardSidebar.tsx
src/layouts/MobileNav.tsx
src/layouts/Logo.tsx
```

Pages:

```txt
src/pages/HomePage.tsx
src/pages/EventsPage.tsx
src/pages/EventDetailPage.tsx
src/pages/LoginPage.tsx
src/pages/ApplyPage.tsx
src/pages/VolunteerDashboardPage.tsx
src/pages/OrganizerDashboardPage.tsx
src/pages/OrganizerApplicantsPage.tsx
src/pages/CreateEventPage.tsx
```

Components:

```txt
src/components/EventCard.tsx
src/components/OrganizerEventRow.tsx
src/components/EventDetailPanel.tsx
src/components/FilterBar.tsx
src/components/StatusBadge.tsx
src/components/CategoryChip.tsx
src/components/StatsCard.tsx
src/components/CertificateCard.tsx
src/components/RegistrationStepper.tsx
src/components/PageHeader.tsx
```

Data:

```txt
src/data/events.ts
src/data/organizers.ts
src/data/profile.ts
src/data/categories.ts
src/data/index.ts
src/types/migunani.ts
```

## Design Direction

Palette terinspirasi dari PSS Day:

```txt
#FEDA00
#00913D
#004225
#000000
```

Font:

- Heading: Poppins
- Body/UI: Rubik

Style:

- clean modern SaaS
- sedikit colorful
- tetap rapi dan fungsional
- full edge-to-edge layout, bukan boxed center layout

Home hero dibuat sebagai first viewport highlight.

## Catatan Aset

Event image saat ini menggunakan URL Unsplash sebagai placeholder. Untuk submission final, pastikan aset aman secara lisensi dan dicantumkan di proposal bila diperlukan.

## Status Verifikasi Terakhir

Terakhir dicek:

```bash
npm run build
npm run lint
```

Keduanya berhasil.

## Catatan Untuk Lanjutan

Saat menambah fitur, jaga aturan role:

- Public route tidak menampilkan data personal.
- Volunteer route tetap di namespace `/volunteer`.
- Organizer route tetap di namespace `/organizer`.
- Logout selalu kembali ke `/`.
- Jangan arahkan link role ke public route kecuali memang keluar/logout.

