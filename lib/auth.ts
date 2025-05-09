import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";

import type { Session, User } from "lucia";
import type { DatabaseUser } from "./db";

// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;

const adapter = new BetterSqlite3Adapter(db, {
	user: "user",
	session: "session"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

export const validateRequest = cache(
	async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
			const cookiesInstance = await cookies(); // cookies() を await で取得
			const sessionId = cookiesInstance.get(lucia.sessionCookieName)?.value ?? null;
			if (!sessionId) {
					return {
							user: null,
							session: null
					};
			}

			const result = await lucia.validateSession(sessionId);
			// next.js throws when you attempt to set cookie when rendering page
			try {
					if (result.session && result.session.fresh) {
							const sessionCookie = lucia.createSessionCookie(result.session.id);
							cookiesInstance.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
					}
					if (!result.session) {
							const sessionCookie = lucia.createBlankSessionCookie();
							cookiesInstance.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
					}
			} catch {}
			return result;
	}
);

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}
