import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { log } from '../logger/logger';
import { spawn } from 'child_process';
import path from 'path';

const apiServerDir = process.cwd();
const projectRoot = path.join(apiServerDir, '..');
const automationDir = path.join(projectRoot, 'automation');

dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url } = req;
    log.info(`Incoming Request: ${method} ${url}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;

        if (statusCode >= 500) {
            log.error(`Request Finished: ${method} ${url} ${statusCode} - ${duration}ms`);
        } else if (statusCode >= 400) {
            log.warn(`Request Finished: ${method} ${url} ${statusCode} - ${duration}ms`);
        } else {
            log.pass(`Request Finished: ${method} ${url} ${statusCode} - ${duration}ms`);
        }
    });

    next();
});

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    log.step('User accessing route /');
    res.status(200).send('Welcome to the test trigger server!');
});

app.post('/run-test', async (req: Request, res: Response, next: NextFunction) => {
    log.step('Received /run-test request...');

    try {
        const { feature, tag } = req.body;
        log.info(`Payload received: feature='${feature}', tag='${tag}'`);

        let command = "npx cucumber-js --config cucumber.js";

        if (feature && typeof feature === 'string') {
            const safeFeature = feature.replace(/[^a-zA-Z0-9_\-\.\/]/g, '');
            command += ` src/features/${safeFeature}`;
            log.info(`Adding feature path: src/features/${safeFeature}`);
        }

        if (tag && typeof tag === 'string') {
            const safeTag = tag.replace(/[^a-zA-Z0-9_@\s\(\)!\&\|]/g, '');
            command += ` --tags "${safeTag}"`;
            log.info(`Adding tag filter: ${safeTag}`);
        }

        log.warn(`Executing command: ${command}`);
        log.warn(`Inside CWD: ${automationDir}`);

        const isWindows = process.platform === 'win32';
        const shell = isWindows ? 'cmd.exe' : 'sh';
        const shellArgs = isWindows ? ['/c', command] : ['-c', command];

        const { fullStdout, fullStderr } = await new Promise<{ fullStdout: string; fullStderr: string }>((resolve, reject) => {
            
            const child = spawn(shell, shellArgs, {
                cwd: automationDir,
                env: {
                    ...process.env,
                    FORCE_COLOR: '1'
                }
            });

            let fullStdout = "";
            let fullStderr = "";

            child.stdout.on('data', (data: Buffer) => {
                const chunk = data.toString();
                fullStdout += chunk;
                process.stdout.write(chunk);
            });

            child.stderr.on('data', (data: Buffer) => {
                const chunk = data.toString();
                fullStderr += chunk;
                process.stderr.write(chunk);
            });

            child.on('error', (err) => {
                log.error(`Failed to start child process: ${err.message}`);
                reject(err);
            });

            child.on('exit', (code) => {
                log.info(`Test process finished with exit code: ${code}`);
                if (code === 0) {
                    resolve({ fullStdout, fullStderr });
                } else {
                    const err = new Error(`Test process failed with exit code: ${code}`);
                    (err as any).stdout = fullStdout;
                    (err as any).stderr = fullStderr;
                    reject(err);
                }
            });
        });

        log.pass('Test Successful. (Check console log above for details)');
        res.status(200).json({ code: 200, status: 'success', output: "Check server log for details." });

    } catch (error: any) {
        log.error(`Test Process Failed: ${error.message}`);
        res.status(500).json({
            code: '500',
            status: 'failed',
            message: error.message,
            error: 'Failed to run process. Check server log for details.',
        });
    }
});

app.get('/error-test', (req: Request, res: Response, next: NextFunction) => {
    log.warn('Triggering intentional error...');
    next(new Error('This is an intentional error for testing!'));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    log.error(`Unexpected Error: ${err.message}`);

    res.status(500).json({
        status: 'error',
        message: 'An error occurred on the server.',
        error: err.message,
    });
});

app.listen(port, () => {
    log.pass(`🚀 Express Server running at http://localhost:${port}`);
    log.info(`Current log level set to: ${process.env.LOG_LEVEL}`);
});