const winston = require('winston');
const moment = require('moment-timezone'); 
const config = require('../config/env');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(info => {
        const timestampIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        return `${timestampIST} ${info.level} ${info.message}`;
    })
);

const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    new winston.transports.File({ filename: 'logs/all.log' }),
];

const logger = winston.createLogger({
    level: config.nodeEnv === 'development' ? 'debug' : 'warn',
    levels,
    format,
    transports,
});

module.exports = logger;
