# Project Test Automation

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan dan menjalankan proyek otomatisasi **End-to-End (E2E)** menggunakan **Playwright + Cucumber**, yang dipicu melalui **server Express** lokal.

---

## 1. Prerequisites (Prasyarat)

Pastikan perangkat berikut sudah terinstal:

* **Node.js & npm** – Untuk menjalankan server API dan skrip otomatisasi.
* **Git** – Untuk mengkloning repositori (jika diperlukan).
* **cURL / Postman** – Untuk mengirim request HTTP ke server API pemicu tes.

---

## 2. Setup dan Instalasi Proyek

Struktur proyek ini memiliki dua sub-direktori:

* `api` → Server Express untuk memicu tes.
* `automation` → Proyek Playwright + Cucumber untuk menjalankan E2E.

Ikuti langkah-langkah berikut.

---

## 2.1. Direktori `api` (Server Pemicu Tes)

Direktori ini berisi server Express yang berfungsi sebagai endpoint untuk memicu skenario E2E dari sistem eksternal.

1. Arahkan ke direktori:

```bash
cd api
```

2. Instal dependensi **production**:

```bash
npm install dotenv express
```

3. Instal dependensi **development**:

```bash
npm install --save-dev @types/express @types/node ts-node ts-node-dev typescript
```

---

## 2.2. Direktori `automation` (Proyek E2E)

1. Arahkan ke direktori:

```bash
cd ../automation
```

2. Instal dependensi utama:

```bash
npm install @playwright/test @types/pg cucumber-js pdf-parse pdf-parser pg
```

3. Instal dependensi development:

```bash
npm install --save-dev @cucumber/cucumber @types/node allure-commandline allure-cucumberjs playwright ts-node typescript
```

4. Instal browser Playwright:

```bash
npx playwright install
```

---

## 3. Menjalankan Server API

1. Pastikan berada di **root proyek** (satu level di atas `api` dan `automation`).
2. Jalankan server:

```bash
npm run server
```

Server berjalan di:

```
http://localhost:3000
```

Server siap menerima request POST untuk memicu tes.

---

## 4. Menjalankan Tes Otomatisasi

Terdapat dua cara menjalankan tes:

* **A. Via API server** (untuk CI/CD)
* **B. Manual melalui CLI**

---

## 4.1. Memicu Tes via API Server (HTTP POST)

Kirim request POST:

```
POST /run-test
```

### A. Memicu Berdasarkan Tag (@)

```bash
curl --request POST \
  --url http://localhost:3000/run-test \
  --header 'Content-Type: application/json' \
  --data '{"tag":"@mapcluster"}'
```

### B. Memicu Berdasarkan File Feature

```bash
curl --request POST \
  --url http://localhost:3000/run-test \
  --header 'Content-Type: application/json' \
  --data '{"feature":"example.feature"}'
```

Output tes akan muncul real-time pada console server.

---

## 4.2. Menjalankan Tes Secara Manual

Pindah ke direktori automation:

```bash
cd automation
```

### Menjalankan semua tes:

```bash
npm test
```

atau:

```bash
npx cucumber-js
```

### Menjalankan berdasarkan tag:

```bash
npx cucumber-js --tags "@regression"
```

### Menjalankan berdasarkan file feature:

```bash
npx cucumber-js src/features/finance/portofolio.feature
```

---

## Selesai

README ini dapat langsung digunakan untuk dokumentasi proyek Anda.
