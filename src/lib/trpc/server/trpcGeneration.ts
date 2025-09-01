import { authenticated, func, t } from '$lib/trpc/t';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import PocketBase from 'pocketbase';
import { pbAdmin } from '$lib/pocketbase/pocketbaseAdmin.server';
import dayjs from 'dayjs';
import type { UsersResponse } from '$lib/pocketbase/pocketBaseTypes';
import { fallBackPBUrl } from '$lib/pocketbase/pocketbaseFallback';

export async function generateImageNanoBanano(prompt: string) {
	return { message: 'successfully ran test' };
}

export const trpcGeneration = t.router({
	generateImageNanoBanano: authenticated(
		z.object({ prompt: z.string() }),
		async ({ userId, prompt }) => {
			return generateImageNanoBanano(prompt);
		}
	)
});
