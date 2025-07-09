import { PrismaClient } from "@prisma/client";
import { performance } from "perf_hooks";

type QueryEvent = {
  query: string;
  params: unknown[];
  duration: number;
  timestamp: Date;
};

export class DatabaseMonitor {
  private prisma: PrismaClient;
  private queryLogs: Map<string, number[]>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.queryLogs = new Map();
    this.setupQueryLogging();
  }

  private setupQueryLogging() {
    if (process.env.ENABLE_QUERY_LOGGING === "true") {
      this.prisma.$on("query", (e: QueryEvent) => {
        const startTime = performance.now();
        const queryId = `${e.query}${Date.now()}`;

        // Log query start
        console.log(`[Query Start] ${e.query}`);

        // Store timing
        this.queryLogs.set(queryId, [startTime]);

        // Add completion handler
        setTimeout(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.log(`[Query End] Duration: ${duration.toFixed(2)}ms`);

          // Store the duration
          const timings = this.queryLogs.get(queryId) || [];
          timings.push(endTime);
          this.queryLogs.set(queryId, timings);
        }, 0);
      });
    }
  }

  public getQueryStats() {
    const stats = new Map<string, number>();

    this.queryLogs.forEach((timings, queryId) => {
      if (timings.length === 2) {
        const duration = timings[1] - timings[0];
        stats.set(queryId, duration);
      }
    });

    return stats;
  }

  public getAverageQueryTime() {
    const stats = this.getQueryStats();
    if (stats.size === 0) return 0;

    const total = Array.from(stats.values()).reduce(
      (sum, duration) => sum + duration,
      0
    );
    return total / stats.size;
  }
}
