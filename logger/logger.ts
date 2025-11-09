import winston from "winston";
import chalk from "chalk";
import dotenv from "dotenv";

// Define custom log levels
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        pass: 2,
        step: 2,   // 👈 custom level baru
        debug: 3,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "blue",
        pass: "green",
        step: '#FFA500',   // 👈 semua log step pakai 1 warna (bisa ganti sesuai selera)
        debug: "magenta",
    },
};

// Add colors to winston
winston.addColors(customLevels.colors);

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorized: string;
    switch (level) {
        case "info":
            colorized = chalk.blue(`[INFO ] ${message}`);
            break;
        case "warn":
            colorized = chalk.yellow(`[WARN ] ${message}`);
            break;
        case "error":
            colorized = chalk.red(`[ERROR] ${message}`);
            break;
        case "debug":
            colorized = chalk.magenta(`[DEBUG] ${message}`);
            break;
        case "pass":
            colorized = chalk.green(`[PASS ] ${message}`);
            break;
        case "step":
            colorized = chalk.hex('#FFA500')(`[STEP ] ${message}`); // 👈 warna khusus step
            break;
        default:
            colorized = `[${level.toUpperCase()}] ${message}`;
    }
    return `${chalk.gray(timestamp)} ${colorized}`;
});

export const Logger = winston.createLogger({
    levels: customLevels.levels,
    level: process.env.LOG_LEVEL || "info", // bisa diatur via ENV misal LOG_LEVEL=info
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        customFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: "reports/logs/test.log",
        }),
    ],
});

export const log = {
    info: (msg: string) => Logger.info(msg),
    warn: (msg: string) => Logger.warn(msg),
    error: (msg: string) => Logger.error(msg),
    debug: (msg: string) => Logger.debug(msg),
    pass: (msg: string) => Logger.log("pass", msg),
    step: (msg: string) => Logger.log("step", msg), // 👈 bisa dipanggil log.step("...")
};
