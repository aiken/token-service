// Cloudflare Pages Function types
type Env = {
  DB: D1Database;
};

type PagesFunction<T = unknown> = (context: {
  request: Request;
  env: T;
  params: Record<string, string | string[]>;
  data: Record<string, unknown>;
  next: () => Promise<Response>;
}) => Promise<Response> | Response;
