import { InjectableManager } from "../../injectable/mod.ts";
import { LogColor } from "./colors.ts";

export type LogFunction = (
  type: LogType,
  service: string,
  ...messages: unknown[]
) => void;

export type LogType = "info" | "warn" | "error" | "debug" | "log";

const LogTypeOption: Record<LogType, { short: string; color: string }> = {
  info: { short: "INF", color: LogColor.bg.green },
  warn: { short: "WRN", color: LogColor.bg.yellow },
  error: { short: "ERR", color: LogColor.bg.red },
  debug: { short: "DBG", color: LogColor.bg.blue },
  log: { short: "LOG", color: LogColor.bg.white },
};

export class Logger {
  send: LogFunction;

  constructor() {
    // Default logger function which logs to the console with colors
    this.send = (type: LogType, service: string, ...messages: unknown[]) => {
      const timestamp = LogColor.dim +
        new Date().toISOString() + LogColor.reset;

      const logOption = LogTypeOption[type];
      const logType = LogColor.bright + logOption.color +
        ` ${logOption.short} ` + LogColor.reset;

      const serviceFormat = `<${LogColor.fg.cyan + service + LogColor.reset}>`;

      console[type](
        `${timestamp} ${logType} ${serviceFormat}:`,
        ...messages,
      );
    };
  }

  info(service: string, ...messages: unknown[]) {
    this.send("info", service, ...messages);
  }

  warn(service: string, ...messages: unknown[]) {
    this.send("warn", service, ...messages);
  }

  error(service: string, ...messages: unknown[]) {
    this.send("error", service, ...messages);
  }

  debug(service: string, ...messages: unknown[]) {
    this.send("debug", service, ...messages);
  }

  log(service: string, ...messages: unknown[]) {
    this.send("log", service, ...messages);
  }
}

// workaround to avoid decorators directly
new InjectableManager(Logger).declare([]);
