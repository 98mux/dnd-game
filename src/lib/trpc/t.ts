import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import type { z } from 'zod';

export const t = initTRPC.context<Context>().create();

export function func<T>(func2: (input: T, event: any) => any) {
	return t.procedure
		.input((input: T) => input)
		.mutation(async ({ input, ctx }) => {
			const i = input as T;
			return await func2(i, ctx);
		});
}

export function authenticated<T extends z.AnyZodObject>(
	zod: T,
	func2: (input: z.infer<T> & { userId: string }) => any
) {
	return t.procedure.input(zod).mutation(async ({ input, ctx }) => {
		return await func2({ ...input, userId: ctx.userId });
	});
}
export function admin<T extends z.AnyZodObject>(
	zod: T,
	func2: (input: z.infer<T> & { userId: string }) => any
) {
	//Some kind of rule to check that the user is an admin user
	return t.procedure.input(zod).mutation(async ({ input, ctx }) => {
		return await func2({ ...input, userId: ctx.userId });
	});
}
