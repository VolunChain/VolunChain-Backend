export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
    });
  }

  info(message: string, meta?: object) {
    console.log(this.formatMessage("INFO", message, meta));
  }

  warn(message: string, meta?: object) {
    console.warn(this.formatMessage("WARN", message, meta));
  }

  error(message: string, error?: object) {
    console.error(this.formatMessage("ERROR", message, error));
  }
}
