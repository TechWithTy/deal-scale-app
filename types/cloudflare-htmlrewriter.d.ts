// Minimal ambient declaration for Cloudflare Workers HTMLRewriter
// to satisfy TypeScript when building outside the Workers runtime.
// If you later install @cloudflare/workers-types, this can be removed.

declare class HTMLRewriter {
  constructor();
  on(
    selector: string,
    handlers: {
      element?(el: unknown): void;
      comments?(c: unknown): void;
      text?(t: unknown): void;
    }
  ): HTMLRewriter;
  transform(response: Response): Response | Promise<Response>;
}

