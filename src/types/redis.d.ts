
declare module "redis" {
  import { EventEmitter } from "events";

  export interface RedisClientOptions {
    url?: string;
  }

  export interface RedisClientType extends EventEmitter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    ping(): Promise<string>;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export function createClient(options?: RedisClientOptions): RedisClientType;
}
