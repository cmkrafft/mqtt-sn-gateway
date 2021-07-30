import winston from 'winston';

export class Logger {

    public static getLogger(clazz?: string): winston.Logger {
        return winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.colorize(),
                        winston.format.splat(),
                        winston.format.simple(),
                        winston.format.align(),
                        winston.format.printf((object) => {
                            const message = `${object.timestamp}   ${`[${object.level}]`.padEnd(18)} [ ${`${clazz ? `${clazz.substring(0, 13)}` : ``}`.padEnd(13)} ] ${object.message}`;
                            if (object.meta) {
                                return `${message}\n${JSON.stringify(object.meta, null, 2)}`;
                            }
                            return message;
                        }),
                    ),
                }),
            ],
        });
    }

}
