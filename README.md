# Username and password example in Next.js App router

Uses SQLite (`main.db`) database.

```sh
pnpm i
pnpm dev
```

## Polyfill

If you're using Node 16 or 18, uncomment the code in `lib/auth.ts`. This is not required in Node 20, Bun, and Cloudflare Workers.

```typescript
// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;
```

---

(2025-05)

[Username and password auth in Next.js App Router](https://v3.lucia-auth.com/tutorials/username-and-password/nextjs-app)
にあったサンプルを、とりあえずクローンして実行してみた。
