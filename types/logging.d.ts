type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface Log {
  /** Logs belong to a group (e.g. a class, anything to distinguish the source) */
  groupId: string;
  time: number;
  /** Time, but nicely formatted */
  niceTime: string;
  level: LogLevel;
  /** A log could be composed of an array of messages */
  messages: string[];
}
