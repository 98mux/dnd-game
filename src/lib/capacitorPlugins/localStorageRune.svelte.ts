import { LocalStorageDB } from './localStorageDb';
import _ from 'lodash';
import { untrack } from 'svelte';
import { Capacitor } from '@capacitor/core';
import { browser } from '$app/environment';
import keyvalue from '../pocketbase/keyValueStore';

const DB_NAME = 'store';

type StorageDB = {
	get<T = any>(key: string): Promise<T | null | undefined>;
	set(key: string, value: any): Promise<void>;
};

function createDb(): StorageDB | null {
	if (!browser) return null;
	try {
		const platform = typeof Capacitor?.getPlatform === 'function' ? Capacitor.getPlatform() : 'web';
		if (platform === 'web') {
			return new keyvalue(DB_NAME);
		}
		return new LocalStorageDB(DB_NAME);
	} catch {
		// Fallback to IndexedDB in case Capacitor is unavailable
		return new keyvalue(DB_NAME);
	}
}

const db = createDb();

const runtimeCache = new Map<string, any>();

export type LocalStorageRune<T> = {
	state: {
		current: T;
	};
	getPromise?: () => Promise<T | null>;
};

export function localStorageRune<T>(
	key: string,
	initialValue: T,
	throttleTime: number = 1000
): LocalStorageRune<T> {
	if (runtimeCache.has(key)) return runtimeCache.get(key);

	const state = $state({ current: initialValue });
	const store: LocalStorageRune<T> = { state };

	if (!db) {
		runtimeCache.set(key, store);
		return store;
	}

	let hasLoaded = false;

	// Load from disk
	const promise = db.get<T>(key).then((value) => {
		if (value !== null && value !== undefined) {
			if (typeof value === 'object') {
				_.merge(state.current, value);
			} else {
				state.current = value;
			}
		}
		return value as T | null;
	});
	store.getPromise = () => promise;

	promise.then(() => {
		hasLoaded = true;
	});

	// Create throttled write function (1 per second)
	const throttledWrite = _.throttle(
		() => {
			// console.log('WRITING', key, state.current);
			if (Array.isArray(state.current) || typeof state.current === 'object') {
				// console.log('W1');
				const value = $state.snapshot(state.current);
				db.set(key, _.cloneDeep(value));
			} else if (state.current !== undefined) {
				// console.log('W2');
				db.set(key, state.current);
			}
		},
		throttleTime,
		{ trailing: true }
	);

	$effect.root(() => {
		$effect(() => {
			// console.log('EFFECT IM HERE');
			//this is slow thought
			// console.log('I AM HERE EFFECTING');
			JSON.stringify(state.current); //Make sure everything is deeply responsive

			// untrack(() => {
			if (hasLoaded) {
				throttledWrite();
			}
			// });
		});
	});

	runtimeCache.set(key, store);
	return store;
}
