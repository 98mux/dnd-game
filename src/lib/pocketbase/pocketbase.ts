import PocketBase from 'pocketbase';
import { fallBackPBUrl } from './pocketbaseFallback';

const canUseLocalStorage = typeof window !== 'undefined';

export const pbUrl = canUseLocalStorage
	? localStorage.getItem('pbUrl') || fallBackPBUrl
	: fallBackPBUrl;
export const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);
