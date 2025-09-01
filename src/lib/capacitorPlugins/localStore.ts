import { registerPlugin } from '@capacitor/core';

export interface LocalStorePlugin {
	set(options: { db: string; key: string; value: string }): Promise<void>;
	get(options: { db: string; key: string }): Promise<{ value: string | null }>;
	remove(options: { db: string; key: string }): Promise<void>;
	clear(options: { db: string }): Promise<void>;
	keys(options: { db: string }): Promise<{ keys: string[] }>;
}

const LocalStore = registerPlugin<LocalStorePlugin>('LocalStore');
export default LocalStore;
