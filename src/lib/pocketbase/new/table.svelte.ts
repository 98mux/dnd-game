import { pb } from '../pocketbase';
import _ from 'lodash';
import type { BaseSystemFields, Collections } from '../pocketBaseTypes';
import type { RecordSubscription } from 'pocketbase';
import { getRow, type Row } from './row.svelte';
import keyvalue from '../keyValueStore';
import type { TableName } from './updateCommon';
import { getUserPromise } from '$lib/state/userState.svelte';
import { nanoid } from 'nanoid';
// type TableName = (typeof Collections)[keyof typeof Collections];
// export type TableName = `${Collections}`;
// { list: Array<Row<T>>; updateList: () => Promise<void> }
export type ListWrapper<T extends BaseSystemFields> = {
	list: Array<Row<T>>;
	updateList: () => Promise<void>;
};

export const allLists: { lists: Array<{ dependencies: Array<string>; list: ListWrapper<any> }> } =
	$state({
		lists: []
	});

export function addList(dependencies: Array<string>, list: any) {
	allLists.lists.push({ dependencies, list });
}
export function invalidateList(table: TableName) {
	console.log(_.cloneDeep(allLists));
	allLists.lists.forEach((list) => {
		if (list.dependencies.includes(table)) {
			const l = list.list;
			l.updateList();
		}
	});
}

// Helper functions for optimistic create
function generateOptimisticState<T>(state: T): { tempId: string; optimisticState: T } {
	const tempId = nanoid();
	const now = new Date().toISOString();
	const optimisticState = {
		...(state as any),
		id: tempId,
		created: (state as any)?.created ?? now,
		updated: (state as any)?.updated ?? now
	} as T;
	return { tempId, optimisticState };
}

async function addOptimisticRowToLists<T extends BaseSystemFields>(
	table: TableName,
	tempId: string,
	optimisticState: T
): Promise<Row<T>> {
	const optimisticRow = await getRow<T>(tempId, table, { initialState: optimisticState });
	allLists.lists.forEach((entry) => {
		if (entry.dependencies.includes(table)) {
			const l = entry.list as ListWrapper<T>;
			if (!l.list.find((r) => r.id === tempId)) {
				l.list = [optimisticRow, ...l.list];
			}
		}
	});
	return optimisticRow;
}

function removeOptimisticFromLists(table: TableName, tempId: string) {
	allLists.lists.forEach((entry) => {
		if (entry.dependencies.includes(table)) {
			const l = entry.list as ListWrapper<any>;
			l.list = l.list.filter((r) => r.id !== tempId);
		}
	});
}

async function createOnServer<T>(table: TableName, state: T, tempId: string) {
	try {
		return await pb.collection(table).create({ ...(state as any), id: tempId });
	} catch (e) {
		return await pb.collection(table).create(state as any);
	}
}

async function reconcileAfterServerCreate<T extends BaseSystemFields>(
	table: TableName,
	tempId: string,
	optimisticRow: Row<T>,
	serverRes: any
): Promise<Row<T>> {
	let finalRow: Row<T>;
	if (serverRes?.id && serverRes.id !== tempId) {
		finalRow = await getRow<T>(serverRes.id, table, { overrideState: serverRes });
		allLists.lists.forEach((entry) => {
			if (entry.dependencies.includes(table)) {
				const l = entry.list as ListWrapper<T>;
				l.list = l.list.map((r) => (r.id === tempId ? finalRow : r));
			}
		});
	} else {
		optimisticRow.setLocal(serverRes);
		finalRow = optimisticRow;
	}
	return finalRow;
}

async function optimisticCreate<T extends BaseSystemFields>(
	table: TableName,
	state: T
): Promise<Row<T>> {
	const { tempId, optimisticState } = generateOptimisticState<T>(state);
	const optimisticRow = await addOptimisticRowToLists<T>(table, tempId, optimisticState);
	let serverRes: any;
	try {
		serverRes = await createOnServer<T>(table, state, tempId);
	} catch (e) {
		removeOptimisticFromLists(table, tempId);
		throw e;
	}
	const finalRow = await reconcileAfterServerCreate<T>(table, tempId, optimisticRow, serverRes);
	invalidateList(table);
	return finalRow;
}

// export type TableWrapper<T extends BaseSystemFields> = {
// 	create: (state: T) => Promise<Row<T>>;
// 	getOne: (id: string, upToDateState?: T) => Promise<Row<T>>;
// 	// Add other methods as needed, for example:
// 	getList: () => ListWrapper<T>;
// 	// update: (id: string, data: Partial<T>) => Promise<Row<T>>;
// 	// delete: (id: string) => Promise<boolean>;
// };

//Creates superpowered api for a table, combining the powers of pocketbase and svelte
export function tableWrapper<T extends BaseSystemFields>(table: TableName) {
	function Subscription() {
		async function tableSubscription(e: RecordSubscription<T>) {
			// console.log("TABLE SUBSCRIPTION")
			const id = e.record.id;
			switch (e.action) {
				case 'insert':
					// cache.push({ id, state: e.record });
					break;
				case 'update':
					const id = e.record.id;
					let row = await getRow(id, table);
					row.sync(e.record, e.record.updated);
					break;
				case 'delete':
					// const fromCacheIndex = cache.findIndex((c) => c.id === id);
					// if (fromCacheIndex > -1) {
					// 	cache[fromCacheIndex].state.isDeleted = true;
					// }
					break;
			}
		}
		type Callback = (e: RecordSubscription<T>) => void;
		const callbacks: Array<Callback> = [];
		function subscribe(callback: Callback) {
			callbacks.push(callback);
		}
		subscribe(tableSubscription);
		// getUser().then(() => {
		// 	pb.collection(table).subscribe<T>('*', (e) => {
		// 		console.log('TABLE SUBSCRIPTION', table, e.record);
		// 		// To make subscriptions work again, uncomment below
		// 		// callbacks.map((cb) => cb(e));
		// 	});
		// });
		return subscribe;
	}
	// if (dev) {
	// 	const subscribe = Subscription();
	// }

	const api = {
		create: async (state: T) => {
			return optimisticCreate<T>(table, state);
		},
		delete: async (id: string) => {
			await pb.collection(table).delete(id);
			invalidateList(table);
		},
		getOne: async (id: string, upToDateState?: T) => {
			const result = await getRow(id, table, { initialState: upToDateState });
			return result;
			// const derived = $derived.by(() => {
			// 	return {
			// 		...result.state,
			// 		calls: result
			// 	};
			// });

			// return derived;
		},
		getList: (page: number, perPage: number, options: any) => {
			let list: ListWrapper<T> = $state({ list: [] });
			let fromCache = false;

			async function getCache() {
				await getUserPromise();
				const cache2 = await getListCache({ page, perPage, options, table });
				if (cache2) {
					const list2 = await Promise.all(
						cache2.map(async (id) => {
							//I don't need to pass initialState here, as it should be trying to get it from it's own cache
							//preventInvalidate is used to prevent the row from invalidating the row - as this will be done by the list
							let row = await getRow(id, table, { preventInvalidate: true });
							return row;
						})
					);
					list.list = list2;
					fromCache = true;
				}
			}
			async function setCache(ids: Array<string>) {
				setListCache({ page, perPage, options, table }, ids);
			}
			getCache();

			let initializeList = true;

			const updateList = async () => {
				const result = await pb.collection(table).getList(page, perPage, options);
				const items = result.items;

				//use the data retrived from list
				list.list = await Promise.all(
					items.map(async (item) => {
						if (initializeList) {
							let row = await getRow(item.id, table, { overrideState: item });
							return row;
						} else {
							let row = await getRow(item.id, table);
							row.setLocal(item);
							return row;
						}
					})
				);
				//Really unsure how i should deal with expand, getOne probably shouldn't support expand
				//... or should it? I guess it could, just had to cache on the options
				//Yeah, getOne should support expand!!!
				// const expand = result.items.map((item) => item.expand);
				// list.expand = expand;

				const ids = items.map((item) => item.id);
				setCache(ids);
				initializeList = false;
			};
			updateList();
			// subscribe((e) => {
			// 	//OBS, with sort, the order can change
			// 	if (e.action === 'create' || e.action === 'delete') {
			// 		updateList();
			// 	}
			// });
			list.updateList = updateList;
			addList([table], list);
			return list;
		}
		// subscribe
	};
	return api;
}

const indexeddbCacheList = new keyvalue('listCache');

type listCache = { page: number; perPage: number; options: any; table: TableName };

async function setListCache(listCacheKey: listCache, ids: Array<string>) {
	const key = JSON.stringify(sortObjectDeeplyBasedOnKeyName(listCacheKey));
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Cache storage timeout')), 500);
	});
	try {
		await Promise.race([indexeddbCacheList.set(key, ids), timeoutPromise]);
	} catch (error) {
		console.error('Cache storage failed:', error);
	}
}

async function getListCache(listCacheKey: listCache): Promise<Array<string> | undefined> {
	const key = JSON.stringify(sortObjectDeeplyBasedOnKeyName(listCacheKey));
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Cache retrieval timeout')), 500);
	});
	try {
		return (await Promise.race([indexeddbCacheList.get(key), timeoutPromise])) as
			| Array<string>
			| undefined;
	} catch (error) {
		console.error('Cache retrieval failed:', error);
		return undefined;
	}
}

const sortObjectDeeplyBasedOnKeyName = (object) => {
	for (let [key, value] of Object.entries(object)) {
		if (typeof value === 'object') {
			object[key] = sortObjectDeeplyBasedOnKeyName(value);
		}
	}
	return order(object);
};
const order = (unordered) =>
	Object.keys(unordered)
		.sort()
		.reduce((obj, key) => {
			obj[key] = unordered[key];
			return obj;
		}, {});
