import { pbAdmin } from '$lib/pocketbase/pocketbaseAdmin.server';

export const common = {
	getHero: async (userId: string) => {
		const user = await pbAdmin.collection('users').getOne(userId);
		const hero = await pbAdmin.collection('heroes').getOne(user.heroId);
		return { user, hero };
	}
};
