import { pbAdmin } from '../pocketbaseAdmin.server';
import type { Collections, CollectionResponses, BaseSystemFields } from '../pocketBaseTypes';
import {
	localUpdate,
	type TableName,
	type LocalUpdate,
	createTableInvalidation
} from './updateCommon';
export type OneCollection = CollectionResponses[keyof CollectionResponses];

export function updates(...args: Array<LocalUpdate | Array<LocalUpdate | undefined> | undefined>) {
	if (args === undefined) {
		return [];
	}
	if (args.length === 0) {
		return [];
	}
	const flatten = args.flat(5);
	const a2 = flatten.filter((f) => f !== undefined);
	return a2;
}

export const crud = {
	update: async (table: TableName, id: string, value: Partial<OneCollection>) => {
		const localUpdate2 = localUpdate(table, id, value);
		await pbAdmin.collection(table).update(id, value);
		return localUpdate2;
	},
	create: async (table: TableName, value: Partial<OneCollection>) => {
		await pbAdmin.collection(table).create(value);
		return createTableInvalidation(table);
	},
	delete: async (table: TableName, id: string) => {
		await pbAdmin.collection(table).delete(id);
		return createTableInvalidation(table);
	}
};
