import { useState, useEffect } from "react";
import style from './ConsoleLogger.module.scss';

const ConsoleLogger = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const handleLog = (type: LogType, ...args: unknown[]) => {
      setLogs((prevLogs) => [...prevLogs, { type, message: args.join(" ") }]);
      originalLog(...args); // Keep default logging
    };

    console.log = (...args: unknown[]) => handleLog("log", ...args);
    console.error = (...args: unknown[]) => handleLog("error", ...args);
    console.warn = (...args: unknown[]) => handleLog("warn", ...args);
    console.info = (...args: unknown[]) => handleLog("info", ...args);

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  return (
    <div className={style.logContainer}>
      {logs.map((log, index) => (
        <div key={index}>
          [{log.type.toUpperCase()}] {log.message}
        </div>
      ))}
    </div>
  );
};

type LogType = "log" | "error" | "warn" | "info";
type Log = {
  type: LogType;
  message: string;
};

export default ConsoleLogger;
