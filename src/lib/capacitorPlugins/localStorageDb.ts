import LocalStore from './localStore';

export class LocalStorageDB {
	constructor(private db: string) {}

	async set(key: string, value: any): Promise<void> {
		console.log('SETTING ITEM 2');
		let stringValue = value;
		if (typeof value === 'object') {
			stringValue = JSON.stringify(value);
		} else {
			stringValue = value.toString();
		}
		console.log('String Length', stringValue.length);
		console.log('approximate megabytes', stringValue.length / 1024 / 1024);
		await LocalStore.set({ db: this.db, key, value: stringValue });
	}

	async get<T = any>(key: string): Promise<T | null> {
		const res = await LocalStore.get({ db: this.db, key });
		if (res.value === null) return null;
		try {
			return JSON.parse(res.value) as T;
		} catch {
			return res.value as T;
		}
	}

	async remove(key: string): Promise<void> {
		await LocalStore.remove({ db: this.db, key });
	}

	async clear(): Promise<void> {
		await LocalStore.clear({ db: this.db });
	}

	async keys(): Promise<string[]> {
		const res = await LocalStore.keys({ db: this.db });
		return res.keys;
	}

	async has(key: string): Promise<boolean> {
		const keys = await this.keys();
		return keys.includes(key);
	}
}
