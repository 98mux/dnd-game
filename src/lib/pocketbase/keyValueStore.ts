/* global indexedDB */
// use global to allow use in web workers

import { browser } from '$app/environment';

//https://github.com/KayleePop/idb-kv/blob/master/index.js

export async function clearKeyValueStore() {
	const db = new keyvalue('store');
	const clearPromise = db.clear();
	// await clearPromise;
	const timeoutPromise = new Promise((resolve) => {
		setTimeout(() => {
			console.error('timeout delete indexeddb error');
			resolve(void 0);
		}, 1000);
	});
	await Promise.race([clearPromise, timeoutPromise]);
}
const delay = async (time: number) => {
	await new Promise((resolve) => setTimeout(resolve, time));
};

const databaseName = 'db';

const stores = ['store', 'challenges', 'routines', 'cache', 'rowCache', 'listCache'];
const version = 2; //NOTE --- I HAVE TO INCREMENT THIS EVERY TIME I MAKE A CHANGE TO THE STORE

type storeNameType = (typeof stores)[number];

function promisefy(request: IDBRequest): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		request.oncomplete = request.onsuccess = () => resolve(request.result);
		request.onabort = request.onerror = () => reject(request.error);
	});
}

const dbPromise = new Promise<IDBDatabase>(async (resolve, reject) => {
	if (browser) {
		const request = indexedDB.open(databaseName, version);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			stores.forEach((store) => {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store);
				}
			});
		};

		resolve(await promisefy(request));
	}
});

class keyvalue {
	private storeName: string;
	private batchInterval: number;
	private _actions: Array<any>;
	private _commitPromise: Promise<void> | null;

	constructor(storeName: storeNameType, { batchInterval = 10 } = {}) {
		this.batchInterval = batchInterval;
		this.storeName = storeName;

		this._actions = [];

		this._commitPromise = null;
	}

	async get(key: IDBValidKey): Promise<any> {
		const getPromise = new Promise((resolve, reject) => {
			this._actions.push({
				type: 'get',
				key,
				resolve,
				reject
			});
		});

		// reject if the commit fails before the get succeeds
		// to prevent hanging on a failed DB open or other transaction errors
		await Promise.race([getPromise, this._getOrStartCommit()]);

		return getPromise;
	}

	async set(key: IDBValidKey, value: any): Promise<void> {
		this._actions.push({
			type: 'set',
			key,
			value
		});

		return this._getOrStartCommit();
	}

	async delete(key: IDBValidKey): Promise<void> {
		this._actions.push({
			type: 'delete',
			key
		});

		return this._getOrStartCommit();
	}
	async clear(): Promise<void> {
		const db = await dbPromise;

		// Get all object store names
		const objectStoreNames = Array.from(db.objectStoreNames);

		// Clear all object stores
		const transaction = db.transaction(objectStoreNames, 'readwrite');

		const clearPromises = objectStoreNames.map((storeName) => {
			return promisefy(transaction.objectStore(storeName).clear());
			// return new Promise<void>((resolve, reject) => {
			// 	const clearRequest = transaction.objectStore(storeName).clear();
			// 	clearRequest.onsuccess = () => resolve();
			// 	clearRequest.onerror = () => reject(clearRequest.error);
			// });
		});

		// Wait for all clear operations to complete
		await Promise.all(clearPromises);

		// Wait for the transaction to complete
		// await new Promise<void>((resolve, reject) => {
		// 	transaction.oncomplete = () => resolve();
		// 	transaction.onerror = () => reject(transaction.error);
		// });
		await promisefy(transaction);

		console.log('Successfully cleared all object stores');
	}

	// async destroy(preventReopen: boolean = true): Promise<void> {
	// 	console.log('c1.1');
	// 	const db = await dbPromise;
	// 	console.log('c1.2');
	// 	// the onsuccess event will only be called after the DB closes
	// 	db.close();
	// 	console.log('c1.3');
	// 	console.log('name', db.name);
	// 	const request = indexedDB.deleteDatabase(db.name);
	// 	console.log('c1.4');
	// 	// reject commits after destruction and by extension reject new actions
	// 	console.log('c1.5');
	// 	return new Promise<void>((resolve, reject) => {
	// 		request.onsuccess = () => resolve();
	// 		request.onerror = () => reject(request.error);
	// 	});
	// }

	// return the pending commit or a new one if none exists
	private _getOrStartCommit(): Promise<void> {
		if (!this._commitPromise) {
			this._commitPromise = this._commit();
		}

		return this._commitPromise;
	}

	// wait for the batchInterval, then commit the queued actions to the database
	private async _commit(): Promise<void> {
		// wait batchInterval milliseconds for more actions
		await new Promise<void>((resolve) => setTimeout(resolve, this.batchInterval));

		// the first queue lasts until the db is opened
		const db = await dbPromise;

		const transaction = db.transaction(this.storeName, 'readwrite');
		const store = transaction.objectStore(this.storeName);

		for (const action of this._actions) {
			switch (action.type) {
				case 'get': {
					const request = store.get(action.key);
					request.onsuccess = () => action.resolve(request.result);
					request.onerror = () => action.reject(request.error);

					break;
				}
				case 'set': {
					store.put(action.value, action.key);
					break;
				}
				case 'delete': {
					store.delete(action.key);
					break;
				}
			}
		}

		// empty queue
		this._actions = [];
		this._commitPromise = null;

		return new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();

			transaction.onabort = (event: Event) => reject((event.target as IDBTransaction).error);

			transaction.onerror = () => {
				// if aborted, onerror is still called, but transaction.error is null
				if (transaction.error) {
					reject(transaction.error);
				}
			};
		});
	}
}

export default keyvalue;
