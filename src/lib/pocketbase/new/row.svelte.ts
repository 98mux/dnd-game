import _ from 'lodash';
import { pb } from '../pocketbase';
import dayjs from 'dayjs';
import keyvalue from '../keyValueStore';
// import { nanoid } from 'nanoid';
const indexeddbCache = new keyvalue('rowCache');
const runtimeCache: Record<string, Row<any>> = $state({});
export type Row<T> = {
	id: string;
	state: T;
	collection: string;
	invalidate: () => Promise<T>;
	update: (update: Partial<T>, instantly?: boolean) => Promise<void>;
	delete: () => Promise<void>;
	create: (data: T) => Promise<void>;
	save: () => Promise<void>;
	log: () => void;
	promise: Promise<T>;
	updateLocal: (update: Partial<T>) => void;
	setLocal: (newState: T) => void;
	sync: (newState: T, updated: string) => void;
};

export async function createRow<T>(collection: string, data: T) {
	const res = await pb.collection(collection).create(data as T);
	return await getRow(res.id, collection, { initialState: data });
}

const cacheState = async (id: string, state: any) => {
	if (state !== undefined && state?.id !== undefined) {
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error('Cache storage timeout')), 2000);
		});
		try {
			await Promise.race([indexeddbCache.set(id, _.cloneDeep(state)), timeoutPromise]);
		} catch (error) {
			console.error('Cache storage failed:', error);
		}
	}
};

const getCachedState = async (id: string) => {
	if (id === undefined) {
		return undefined;
	}
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Cache retrieval timeout')), 2000);
	});
	try {
		return await Promise.race([indexeddbCache.get(id), timeoutPromise]);
	} catch (error) {
		console.error('Cache retrieval failed:', error);
		return undefined;
	}
};

const removeCachedState = async (id: string) => {
	// await indexeddbCache.delete(id,);
};
const delay = async (time: number) => {
	await new Promise((resolve) => setTimeout(resolve, time));
};

//DO NOT USE THIS IF THE ROW HAS NOT BEEN CREATED YET
//IT DOES NOT WORK AS EXPECTED...
export async function getRow<T>(
	id: string,
	collection: string,
	extra?: Partial<{ initialState: T; overrideState: T; preventInvalidate: boolean }>
) {
	if (runtimeCache[id]) {
		if (extra?.overrideState) {
			runtimeCache[id].setLocal(extra?.overrideState);
		}
		return runtimeCache[id];
	}
	//Check cache if the row already exists

	let lastUpdatedStrings: Array<string> = [];

	async function invalidate() {
		// if (id === undefined || id === '' || id === 'undefined') {
		// 	return;
		// }
		console.log('INVALIDATING', collection, id);
		const server = await pb.collection(collection).getOne(id);
		console.log('INVALIDATING RESULT FROM SERVER:', server);
		console.log('INVALIDATING STATE:', state);
		// if (collection === 'users') {
		// 	console.log('STATE FROM SERVER:', server);
		// }
		replaceObject(state, server);

		// if (collection === 'users') {
		// 	console.log('STATE AFTER REPLACE:', _.cloneDeep(state));
		// }
		await cacheState(id, state);
		return state;
	}

	let updatePromise: Promise<any> | undefined = undefined;
	let latestUpdate: T | undefined = undefined;
	let promises: Promise<any>[] = [];

	let allPromisesPromise: Promise<any> | undefined = undefined;
	let promise = new Promise(async (resolve) => {
		const interval = setInterval(() => {
			// if (collection === 'users') {
			// 	console.log('STATE PROMISE', _.cloneDeep(state));
			// }
			if (state?.created) {
				resolve(state);
				clearInterval(interval);
			}
		}, 300);
	});

	async function waitForAllUpdates() {
		while (promises.length > 0) {
			// Create a snapshot of the promises array to handle those currently added
			const currentPromises = [...promises];
			// Clear the promises array to only process new ones added after this point
			promises = [];
			await Promise.all(currentPromises);
		}

		if (latestUpdate) {
			// if (collection === 'heroes') {
			// 	console.log('HERO UPDATE', latestUpdate);
			// }
			replaceObject(state, latestUpdate);
			cacheState(id, state);
		}
	}
	async function waitForAllUpdates2() {
		if (!allPromisesPromise) {
			allPromisesPromise = waitForAllUpdates();
		}
		await allPromisesPromise;
		allPromisesPromise = undefined;
	}
	//Debounce update
	function updateLogic(
		state: any,
		collection: string,
		id: string,
		invalidate: () => Promise<any>,
		lastUpdatedStrings: Array<string>
	) {
		let tempUpdate: Partial<any> | undefined = undefined;
		async function callUpdate() {
			if (tempUpdate) {
				await promise; //Must wait for it to initialize properly before updating
				try {
					const updateValue = _.cloneDeep(tempUpdate);
					console.log('UPDATING POCKETBASE', updateValue);
					updatePromise = pb
						.collection(collection)
						.update(id, updateValue)
						.then((state) => {
							lastUpdatedStrings.push(state.updated);
						});
					promises.push(updatePromise);
					const updated = await updatePromise;
					await cacheState(id, updated);
				} catch (e) {
					invalidate();
					console.error(e);
				}
				tempUpdate = undefined;
			}
		}

		// let callUpdateDebounce = _.debounce(callUpdate, 200);
		let callUpdateDebounce = _.debounce(callUpdate, 1000);
		let throttleUpdate = _.throttle(callUpdate, 2000, { leading: true, trailing: false });

		return async (update: Partial<any>, instantly: boolean = true) => {
			// if (collection === 'heroes') {
			// 	console.log('UPDATING', update);
			// }
			//Update local state instantly
			//Merge is wrong...
			// _.merge(state, update); //don't merge recursivly, just override

			// Object.assign(state, update);
			for (const key in update) {
				state[key] = update[key];
			}
			//Update temp update (will be used when update goes through)
			if (tempUpdate) {
				_.merge(tempUpdate, update);
			} else {
				tempUpdate = update;
			}

			//BUG BUG BUG BUG: instantly = false seems to be buggy and risk it never updating...
			// if (instantly) {
			// await callUpdate();
			await throttleUpdate();
			// } else {
			// 	callUpdateDebounce();
			// }
		};
	}

	//create a promise that resolves when row is fetched
	let state = $state({});
	let derived = $derived(state);

	// console.log(100);

	if (extra?.initialState) {
		replaceObject(state, extra.initialState);
		cacheState(id, state);
	} else if (extra?.overrideState) {
		replaceObject(state, extra.overrideState);
		cacheState(id, state);
	} else {
		// console.log(100.1);
		try {
			const cache = await getCachedState(id);
			// console.log(100.2);
			if (cache) {
				// if (collection === 'users') {
				// 	console.log('STATE BEFORE:', _.cloneDeep(state));
				// }
				replaceObject(state, cache);
				// if (collection === 'users') {
				// 	console.log('STATE AFTER:', _.cloneDeep(state));
				// }
				if (!extra?.preventInvalidate) {
					invalidate().then(() => {
						// if (collection === 'users') {
						// 	console.log('STATE AFTER INVALIDATE:', _.cloneDeep(state));
						// }
					});
				}
			} else {
				// console.log(100.3);
				await invalidate();
				// console.log(100.4);
			}
		} catch (e) {
			console.error('ERROR WITH CACHE', e);
		}
	}
	// console.log(101);

	let row = {
		id,
		state: derived,
		promise,
		collection,
		invalidate,
		update: updateLogic(state, collection, id, invalidate, lastUpdatedStrings),
		updateLocal: (update: Partial<T>) => {
			_.merge(state, update);
			cacheState(id, state);
		},
		setLocal: (newState: T) => {
			replaceObject(state, newState);
			cacheState(id, state);
		},

		log: () => {
			console.log('STATE LOG: ', collection, ' (', id, ')', _.cloneDeep(state));
		},
		sync: async (newState: T, updated: string) => {
			// if (collection === 'heroes') {
			// 	console.log('SYNCING HERO', newState);
			// }
			if (latestUpdate) {
				if (dayjs(newState.updated).isAfter(dayjs(latestUpdate.updated))) {
					// console.log(newState.updated, 'is after', latestUpdate.updated);
					latestUpdate = newState;
				} else {
					// console.log(newState.updated, 'is not after', latestUpdate.updated);
				}
			} else {
				latestUpdate = newState;
			}

			await waitForAllUpdates2();
		}
	};

	if (runtimeCache[id]) {
		return runtimeCache[id];
	}
	runtimeCache[id] = row;
	return row;
}

// let promise = new Promise(async (resolve) => {
// 	if (state === undefined) {
// 		state = {};
// 		const cache = await getCachedState(id);
// 		console.log('CACHE:', cache);
// 		if (cache) {
// 			replaceObject(state, cache);
// 			resolve(state);
// 		}
// 		invalidate().then((state) => {
// 			resolve(state);
// 		});
// 	} else {
// 		await cacheState(id, state);
// 		resolve(state);
// 	}
// });

//Ugly helper functions

function replaceObject(obj1: any, obj2: any) {
	// Remove all existing properties in obj1
	_.keys(obj1).forEach((key) => delete obj1[key]);

	// Assign all properties from obj2 to obj1
	_.assign(obj1, _.cloneDeep(obj2));
}
