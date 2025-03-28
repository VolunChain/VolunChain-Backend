// src/utils/logger.ts
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta && { meta })
    });
  }

  info(message: string, meta?: any) {
    console.log(this.formatMessage('INFO', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('ERROR', message, error));
  }
}