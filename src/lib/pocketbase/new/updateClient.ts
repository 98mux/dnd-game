import type { Collections, CollectionResponses, BaseSystemFields } from '../pocketBaseTypes';
import { invalidateList } from './table.svelte';
import { table } from './tables.svelte';
import { type Consumable, type LocalUpdate, type OneCollection } from './updateCommon';

/* HOW TO HANDLE LISTS: */
/* ALL LIST NEEDS TO DEFINE WHICH TABLES THEY ARE LINKED TO */
/* WHEN A ROW IN A TABLE GETS UPDATED - THE LIST IS RE-FETCHED */

export function consume(consumable: Consumable | Promise<Consumable>) {
	if (consumable instanceof Promise) {
		consumable.then((consumable) => {
			updateLocally(consumable._u);
		});
	} else {
		console.log('CONSUME', consumable._u);
		updateLocally(consumable._u);
	}
}

export async function updateLocally(updates: LocalUpdate[]) {
	if (!updates) {
		throw new Error('Updates undefined');
	}

	console.log('UPDATELOCALLY', updates);
	const invalidateLists = updates.filter((update) => update.type === 'invalidateList');
	const tablesToInvalidate = Array.from(new Set(invalidateLists.map((update) => update.table)));

	for (const tableToInvalidate of tablesToInvalidate) {
		console.log('INVALIDATE LIST', tableToInvalidate);
		invalidateList(tableToInvalidate);
	}

	const updates2 = updates.filter((update) => update.type === 'update');
	for (const update of updates2) {
		console.log('UPDATE!!!', update);
		//REMEMBER TO UPDATE habitEntry og hero to heroes etc etc etc
		const t = table[update.table] as unknown as any;
		if (!t) {
			continue;
		}
		const row = await t.getOne(update.id); //, update.values);
		if (!row) {
			continue;
		}
		console.log('ROW TABLE', update.table, 'ROW UPDATE VALUE', update.values);
		row.updateLocal(update.values as Partial<BaseSystemFields>);
	}
}
