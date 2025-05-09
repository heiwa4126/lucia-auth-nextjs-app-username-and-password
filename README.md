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

↑ から上はオリジナルのまま

## 自分用メモ

(2025-05)

[Username and password auth in Next.js App Router](https://v3.lucia-auth.com/tutorials/username-and-password/nextjs-app)
にあったサンプルを、とりあえずクローンして実行してみた。

モジュールを全部更新した。

細かいエラーと警告を治して `pnpm build` も通るようにした。

## メモ: main.db

```console
sqlite> .tables

session  user

sqlite> SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'user';

CREATE TABLE user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
)

sqlite> SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'session';

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)
```

参照:

- [lib/db.ts](lib/db.ts)
- <https://v3.lucia-auth.com/database/sqlite>

いまのままだとプロジェクトルートに `main.db` が出来るので、
Vercel とか Cloudflare Workers では動かない。
ローカルで `pnpm dev` で動くだけ。
