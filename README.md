# Migunani - SEFEST 2026 Web Design

Migunani adalah prototype frontend marketplace event volunteer untuk mahasiswa, relawan umum, dan organisasi penyelenggara event. Project ini dibuat untuk kategori Web Design SEFEST 2026 dengan fokus pada website yang menarik, fungsional, dan sesuai tema.

## Tema dan SDGs

Tema SEFEST 2026: **Gen-Z TechPreneur: Digital Solutions for a Sustainable Future**.

Migunani mengacu pada **SDG 8: Decent Work and Economic Growth**. Produk ini membantu relawan muda, khususnya mahasiswa, menemukan pengalaman volunteer yang relevan untuk mengembangkan skill, membangun portofolio kontribusi, dan mengumpulkan bukti aktivitas. Untuk organizer, Migunani menyediakan alur publikasi event, pengelolaan applicant, dan pemantauan performa kegiatan.

## Fitur Utama

- Public marketplace untuk eksplorasi event volunteer.
- Filter dan search event berdasarkan kategori, mode, dan kata kunci.
- Detail event dengan benefit, skill, role relawan, kuota, dan organizer.
- Role gateway untuk simulasi masuk sebagai relawan atau organizer.
- Apply flow multi-step untuk relawan.
- Volunteer dashboard untuk aplikasi, sertifikat, dan impact summary.
- Organizer dashboard untuk event, applicant preview, dan performance overview.
- Create event form dengan live preview card.

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Framer Motion
- Static dummy data

## Routing

```txt
Public
/
/events
/events/:slug
/login

Volunteer
/volunteer/dashboard
/volunteer/apply/:eventId

Organizer
/organizer
/organizer/create
```

## Cara Menjalankan

Project ini menggunakan Node 22.

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

## Catatan Submission SEFEST

Sesuai rulebook Web Design SEFEST 2026, repository/proposal sebaiknya mengikuti format:

```txt
SEFEST26WEBDESIGN_NamaTim
```

Submission perlu menyertakan:

- Proposal PDF.
- Link GitHub project.
- README berisi deskripsi singkat dan panduan menjalankan karya.

## Aset

Gambar event pada prototype menggunakan URL Unsplash sebagai placeholder visual. Untuk pengumpulan final, pastikan semua aset yang digunakan memiliki lisensi yang aman dan dicantumkan di proposal apabila diperlukan.
