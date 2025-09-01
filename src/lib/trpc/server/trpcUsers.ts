import { authenticated, func, t } from '$lib/trpc/t';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import PocketBase from 'pocketbase';
import { pbAdmin } from '$lib/pocketbase/pocketbaseAdmin.server';
import dayjs from 'dayjs';
import type { UsersResponse } from '$lib/pocketbase/pocketBaseTypes';
import { fallBackPBUrl } from '$lib/pocketbase/pocketbaseFallback';

const jwtSecret = '373E6917ECC82D53D4B8641C656CB';

export function validateJWT(token: string) {
	//Validate with pocketbase
	try {
		const decoded = jwt.verify(token, jwtSecret);
		return decoded?.userId;
	} catch {
		return undefined;
	}
}

export const trpcUser = t.router({
	getServerTime: authenticated(z.object({}), async ({ userId }) => {
		return { time: dayjs().toISOString() };
	}),

	functionCall: authenticated(z.object({}), async ({ userId }) => {}),

	turnAdmin: authenticated(
		z.object({ secret: z.string(), off: z.boolean().optional() }),
		async ({ userId, secret, off }) => {
			if (off) {
				await pbAdmin.collection('users').update(userId, {
					admin: false
				});
				return { userId };
			}
			if (secret !== 'mammamia') {
				return;
			}
			await pbAdmin.collection('users').update(userId, {
				admin: true
			});
			return { userId };
		}
	),

	deleteThrowawayUserIfExists: func<{ email: string }>(async ({ email }) => {
		if (!email.startsWith('test') || !email.endsWith('@example.com')) {
			return { email };
		}
		try {
			const user = await pbAdmin.collection('users').getFirstListItem(`email="${email}"`);
			if (user) {
				await pbAdmin.collection('users').delete(user.id);
			}
		} catch (e) {
			return { email };
		}
		return { email };
	}),

	initializeUser: authenticated(z.object({}), async ({ userId }) => {
		return { userId };
	}),

	deleteUser: authenticated(z.object({}), async ({ userId }) => {
		await pbAdmin.collection('users').delete(userId);
		//In the future do a cleanup every x that deletes all
		//Challenges, heros, chatmessages that has undefined userId
		// and chats with only one user
		return { userId };
	}),
	createJWT: func<{ pocketbaseToken: string }>(async ({ pocketbaseToken }) => {
		const pb = new PocketBase(fallBackPBUrl);
		//Set token
		pb.authStore.save(pocketbaseToken, null);
		//Verify token
		await pb.collection('users').authRefresh();
		const userId = pb.authStore.model?.id;
		//Validate with pocketbase
		const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '100y' });
		return { token };
	}),
	delete: authenticated(z.object({}), async ({ userId }) => {
		// await sql`DELETE FROM public.user WHERE id = ${user_id}`;
		return {};
	}),

	logout: func(async () => {})
});
