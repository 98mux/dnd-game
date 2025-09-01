import { authenticated, func, t } from '$lib/trpc/t';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import PocketBase from 'pocketbase';
import { pbAdmin } from '$lib/pocketbase/pocketbaseAdmin.server';
import dayjs from 'dayjs';
import type { UsersResponse } from '$lib/pocketbase/pocketBaseTypes';
import { fallBackPBUrl } from '$lib/pocketbase/pocketbaseFallback';

export const trpcGame = t.router({
	test: func(async () => {
		return { message: 'successfully ran test' };
	})
});
