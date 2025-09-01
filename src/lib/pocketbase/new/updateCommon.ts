import type { CollectionResponses, Collections } from '../pocketBaseTypes';

export type OneCollection = CollectionResponses[keyof CollectionResponses];

export type LocalUpdate =
	| {
			type: 'update';
			table: TableName;
			id: string;
			values: Partial<OneCollection>;
	  }
	| { type: 'invalidateList'; table: TableName };

export type Consumable = {
	_u: LocalUpdate[];
};

export function createTableInvalidation(table: TableName): LocalUpdate {
	return {
		type: 'invalidateList',
		table
	};
}

export function localUpdate(
	table: TableName,
	id: string,
	value: Partial<OneCollection>
): LocalUpdate {
	return {
		type: 'update',
		table,
		id,
		values: value
	};
}

export type TableName = `${Collections}`;

export function createConsumable<T>(updates: LocalUpdate[], props: T = {}) {
	return { ...props, _u: updates } as T & { _u: LocalUpdate[] };
}
