import Link from "next/link";

import { lucia, validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { Form } from "@/lib/form";
import { hash } from "@node-rs/argon2";
import { SqliteError } from "better-sqlite3";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/");
	}
	return (
		<>
			<h1>Create an account</h1>
			<Form action={signup}>
				<label htmlFor="username">Username</label>
				<input name="username" id="username" />
				<br />
				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />
				<br />
				<button type="submit">Continue</button>
			</Form>
			<Link href="/login">Sign in</Link>
		</>
	);
}

async function signup(_: unknown, formData: FormData): Promise<ActionResult> {
	"use server";
	const username = formData.get("username");
	// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
	// keep in mind some database (e.g. mysql) are case insensitive
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return {
			error:
				"Invalid username. Username must be a string between 3 and 31 characters long and can only contain lowercase letters, numbers, underscores, or hyphens.",
		};
	}
	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: "Invalid password. Password must be a string between 6 and 255 characters long.",
		};
	}

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});
	const userId = generateId(15);

	try {
		db.prepare("INSERT INTO user (id, username, password_hash) VALUES(?, ?, ?)").run(
			userId,
			username,
			passwordHash,
		);

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return {
				error: "Username already used",
			};
		}
		return {
			error: "An unknown error occurred",
		};
	}
	return redirect("/");
}
