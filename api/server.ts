import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
// Path ini mengasumsikan 'logger' ada di root, di samping folder 'api'
import { log } from '../logger/logger'; 
import { spawn } from 'child_process'; // Gunakan 'spawn' untuk streaming
import util from 'util';
import path from 'path';

// --- Setup Eksternal Perintah ---
// Menggunakan process.cwd() untuk path yang stabil
// 'process.cwd()' akan menjadi /.../api saat dijalankan via 'npm --prefix'
const apiServerDir = process.cwd();
const projectRoot = path.join(apiServerDir, '..');
// Sesuaikan 'automation' jika nama folder Anda 'automation_project'
const automationDir = path.join(projectRoot, 'automation');
// ---------------------------------

// Muat environment variables dari .env
dotenv.config({ path: path.join(projectRoot, '.env') }); // Tentukan path .env di root

const app = express();
const port = process.env.PORT || 3000;

// =================================================================
// 1. MIDDLEWARE: REQUEST LOGGER (Kode Anda)
// =================================================================
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url } = req;
    log.info(`Request Masuk: ${method} ${url}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;

        if (statusCode >= 500) {
            log.error(`Request Selesai: ${method} ${url} ${statusCode} - ${duration}ms`);
        } else if (statusCode >= 400) {
            log.warn(`Request Selesai: ${method} ${url} ${statusCode} - ${duration}ms`);
        } else {
            log.pass(`Request Selesai: ${method} ${url} ${statusCode} - ${duration}ms`);
        }
    });

    next();
});

// Middleware untuk parsing JSON
app.use(express.json());

// =================================================================
// 2. ROUTES
// =================================================================

app.get('/', (req: Request, res: Response) => {
    log.step('User mengakses route /');
    res.status(200).send('Selamat datang di server pemicu tes!');
});

// --- RUTE '/run-test' DENGAN LOG REAL-TIME ---
app.post('/run-test', async (req: Request, res: Response, next: NextFunction) => {
    log.step('Menerima permintaan /run-test...');

    try {
        const { feature, tag } = req.body;
        log.info(`Payload diterima: feature='${feature}', tag='${tag}'`);

        // --- 1. Bangun Perintah Dinamis ---
        // Perintah ini dijalankan dari 'cwd: automationDir', jadi path config
        // harus relatif dari sana (naik satu, masuk ke 'js')
        let command = "npx cucumber-js --config cucumber.js";

        // Tambahkan path fitur jika ada
        if (feature && typeof feature === 'string') {
            const safeFeature = feature.replace(/[^a-zA-Z0-9_\-\.\/]/g, '');
            // Path fitur relatif terhadap CWD (yaitu folder 'automation')
            command += ` src/features/${safeFeature}`;
            log.info(`Menambahkan path fitur: src/features/${safeFeature}`);
        }

        // Tambahkan filter tag jika ada
        if (tag && typeof tag === 'string') {
            const safeTag = tag.replace(/[^a-zA-Z0-9_@\s\(\)!\&\|]/g, '');
            command += ` --tags "${safeTag}"`;
            log.info(`Menambahkan filter tag: ${safeTag}`);
        }

        log.warn(`Menjalankan perintah: ${command}`);
        log.warn(`Di dalam CWD: ${automationDir}`);

        // --- 2. Jalankan Perintah dengan 'spawn' ---
        const { fullStdout, fullStderr } = await new Promise<{ fullStdout: string; fullStderr: string }>((resolve, reject) => {
            
            // Gunakan 'sh -c' untuk mengeksekusi string perintah lengkap
            const child = spawn('sh', ['-c', command], {
                cwd: automationDir, // Atur direktori kerja
                env: {
                    ...process.env, // Warisi env
                    FORCE_COLOR: '1'  // Paksa output berwarna
                }
            });

            let fullStdout = "";
            let fullStderr = "";

            // Tangkap Aliran 'stdout' (Real-time)
            child.stdout.on('data', (data: Buffer) => {
                const chunk = data.toString();
                fullStdout += chunk;
                process.stdout.write(chunk); // Cetak langsung ke konsol server
            });

            // Tangkap Aliran 'stderr' (Real-time)
            child.stderr.on('data', (data: Buffer) => {
                const chunk = data.toString();
                fullStderr += chunk;
                process.stderr.write(chunk); // Cetak langsung ke konsol server
            });

            // Tangani Error 'spawn'
            child.on('error', (err) => {
                log.error(`Gagal memulai child process: ${err.message}`);
                reject(err);
            });

            // Tangani Selesainya Proses
            child.on('exit', (code) => {
                log.info(`Proses tes selesai dengan exit code: ${code}`);
                if (code === 0) {
                    resolve({ fullStdout, fullStderr });
                } else {
                    const err = new Error(`Proses tes gagal dengan exit code: ${code}`);
                    (err as any).stdout = fullStdout;
                    (err as any).stderr = fullStderr;
                    reject(err);
                }
            });
        });

        // --- 3. Kirim Respon (Hanya jika 'resolve' / Sukses) ---
        log.pass('Test Berhasil. (Lihat log konsol di atas untuk detail)');
        res.status(200).json({ status: 'success', output: fullStdout });

    } catch (error: any) {
        // --- 4. Tangkap Error (jika 'reject' atau 'throw') ---
        log.error(`Proses Tes Gagal: ${error.message}`);
        res.status(500).json({
            status: 'failed',
            message: error.message,
            output: error.stdout || '',
            error: error.stderr || 'Gagal menjalankan proses.',
        });
    }
});
// ----------------------------------------

app.get('/error-test', (req: Request, res: Response, next: NextFunction) => {
    log.warn('Akan memicu error yang disengaja...');
    next(new Error('Ini adalah error yang disengaja untuk pengujian!'));
});

// =================================================================
// 3. MIDDLEWARE: ERROR HANDLER (Kode Anda)
// =================================================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    log.error(`Error tidak terduga: ${err.message}`);
    log.debug(err.stack || 'Tidak ada stack trace');

    res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server.',
        error: err.message,
    });
});

// =================================================================
// MULAI SERVER
// =================================================================
app.listen(port, () => {
    log.pass(`🚀 Server Express berjalan di http://localhost:${port}`);
    log.info(`Log level saat ini diatur ke: ${process.env.LOG_LEVEL}`);
});