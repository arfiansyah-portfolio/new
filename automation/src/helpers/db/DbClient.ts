// import { Pool } from 'pg'; // Perlu 'npm install pg @types/pg'
// import { log } from '../../logger/logger';

// export class DbClient {
//     private pool: Pool;

//     constructor() {
//         this.pool = new Pool({
//             user: process.env.DB_USER,
//             host: process.env.DB_HOST,
//             database: process.env.DB_NAME,
//             password: process.env.DB_PASSWORD,
//             port: parseInt(process.env.DB_PORT || '5432'),
//         });
//     }

//     async connect() {
//         await this.pool.connect();
//         log.info("🔌 Koneksi Database berhasil.");
//     }

//     async disconnect() {
//         await this.pool.end();
//         log.info("👋 Koneksi Database ditutup.");
//     }

//     /**
//      * Menjalankan query SELECT dan mengembalikan baris.
//      */
//     async query(sql: string, params: any[] = []): Promise<any[]> {
//         log.debug(`[DB] QUERY: ${sql} [PARAMS: ${params}]`);
//         try {
//             const result = await this.pool.query(sql, params);
//             return result.rows;
//         } catch (e) {
//             log.error(`[DB] Query Gagal: ${(e as Error).message}`);
//             throw e;
//         }
//     }

//     /**
//      * Menjalankan UPDATE, INSERT, DELETE.
//      */
//     async execute(sql: string, params: any[] = []) {
//         log.debug(`[DB] EXECUTE: ${sql} [PARAMS: ${params}]`);
//         try {
//             await this.pool.query(sql, params);
//         } catch (e) {
//             log.error(`[DB] Execute Gagal: ${(e as Error).message}`);
//             throw e;
//         }
//     }
// }