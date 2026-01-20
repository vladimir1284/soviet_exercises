/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Locals {
      user: {
        id: number;
        clerkId: string;
        email: string;
        name: string;
      } | null;
    }
    interface Platform {
      env: {
        DB: D1Database;
        PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      };
      context: ExecutionContext;
      caches: CacheStorage;
    }
  }
}

export {};
