import PocketBase from 'pocketbase';
import { PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD } from '$env/static/private';
import { fallBackPBUrl } from './pocketbaseFallback';

export const pbAdmin = new PocketBase(fallBackPBUrl);
const authData = await pbAdmin.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
pbAdmin.autoCancellation(false);

// // after the above you can also access the auth data from the authStore
// console.log(pbAdmin.authStore.isValid);
// console.log(pbAdmin.authStore.token);
// console.log(pbAdmin.authStore.model?.id);
// const model = pbAdmin.authStore.model;
// if(model){
// 	model.

// }
