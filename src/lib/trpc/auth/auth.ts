// import { initializeUser } from '$lib/app/initializeApp';
// import { pb } from '$lib/pocketbase/pocketbase';
// import { userState } from '$lib/state/userState.svelte';
// import { trpc } from '$lib/trpc/client';
// import { Browser } from '@capacitor/browser';
// import { Capacitor } from '@capacitor/core';
// import _ from 'lodash';
// import { clearKeyValueStore } from '$lib/misc/keyValueStore';
// import toast from 'svelte-french-toast';
// export const auth = {
// 	skipPostOnboarding: async () => {
// 		// await updateUserInfo({ onboardingCompleted: true });
// 		// await userState.user?.update({
// 		// 	progress: 800
// 		// });
// 		await new Promise((resolve) => setTimeout(resolve, 200));
// 		window.location.pathname = '/';
// 	},

// 	logout: async (goToLogin: boolean = false) => {
// 		if (
// 			window.location.pathname === '/onboarding/pre' ||
// 			window.location.pathname === '/auth/login'
// 		) {
// 			return;
// 		}
// 		// await pb.collection('troubleshoot').create({
// 		// 	identifier: 'Logged out',
// 		// 	identifier2: '5',
// 		// 	data: {
// 		// 		userId: userState.userId
// 		// 	},
// 		// 	error: 'Simply logged out'
// 		// });

// 		try {
// 			await pb.collection('users').update(userState.userId, {
// 				signedOut: true
// 			});
// 		} catch {}

// 		pb.authStore.clear();
// 		localStorage.removeItem('token');
// 		localStorage.removeItem('day1Completed');

// 		await clearKeyValueStore();
// 		localStorage.removeItem('activeQuest');
// 		localStorage.removeItem('userId');
// 		setTimeout(() => {
// 			if (goToLogin) {
// 				window.location.href = '/auth/login';
// 			} else {
// 				window.location.href = '/onboarding/pre';
// 			}
// 		}, 600);
// 		// await goto('/onboarding/pre');
// 	},
// 	setToken: async () => {
// 		//Create a new token that is used for all trpc calls, see trpc/client.ts
// 		const { token } = await trpc().users.createJWT.mutate({ pocketbaseToken: pb.authStore.token });
// 		localStorage.setItem('token', token);
// 	},
// 	login: async (provider: string) => {
// 		showLoadingGif.show = true;

// 		try {
// 			//https://github.com/pocketbase/pocketbase/discussions/2429#discussioncomment-5943061.
// 			const f = await pb.collection('users').authWithOAuth2({
// 				provider,
// 				urlCallback: (url) => {
// 					console.log('oauth1');
// 					if (Capacitor.isNativePlatform()) {
// 						console.log('oauth2');
// 						Browser.open({ url });
// 					} else {
// 						console.log('oauth3');
// 						const w = window.open();
// 						if (w) {
// 							w.location.href = url;
// 						}
// 					}
// 				},
// 				createData: {
// 					progress: 1
// 				}
// 			});

// 			console.log('login1');

// 			const isNewUser = f.meta?.isNew;

// 			localStorage.setItem('name', f.meta?.name?.split(' ')[0]);

// 			if (isNewUser) {
// 				await auth.initializeNewUser();
// 				await Browser.close();
// 			} else {
// 				console.log('login2');
// 				await initializeUser();
// 				try {
// 					console.log('login3');
// 					await Browser.close();
// 				} catch {}
// 				console.log('login4');
// 				setTimeout(() => {
// 					window.location.href = '/?progress=1';
// 				}, 300);
// 			}
// 		} catch (e) {
// 			toast.error('Login / Signup failed');
// 			try {
// 				await pb.collection('loginError').create({
// 					// userId: userState?.userId ?? null,
// 					error: JSON.stringify(e)
// 				});
// 			} catch {}
// 		}
// 		showLoadingGif.show = false;
// 	},
// 	initializeNewUser: async (redirect: boolean = true) => {
// 		showLoadingGif.show = true;
// 		await auth.setToken();

// 		const userId = pb.authStore.model?.id;

// 		// // window.location.href = '/onboarding/post'
// 		// await updateUserTimezone();
// 		// if (redirect) {
// 		// 	window.location.href = '/?progress=1';
// 		// }

// 		showLoadingGif.show = false;
// 	},
// 	deleteUser: async () => {
// 		try {
// 			await trpc().users.deleteUser.mutate({});
// 		} catch (e) {}

// 		setTimeout(() => {
// 			window.location.href = '/auth/login';
// 		}, 1000);
// 		await auth.logout();
// 	},

// 	createThrowawayUser: async (
// 		id: string,
// 		deleteIfExists: boolean = false,
// 		redirect: boolean = true,
// 		skip: boolean = false
// 	) => {
// 		const emailFriendlyString = id.replace(/[^a-zA-Z0-9]/g, '');
// 		const email = `test${emailFriendlyString}@example.com`;
// 		console.log('I AM HERERERE', email);

// 		async function create() {
// 			await pb.collection('users').create({
// 				email,
// 				password: '12345678',
// 				passwordConfirm: '12345678',
// 				name: 'John Doe',
// 				info: skip ? { onboardingCompleted: true } : undefined,
// 				progress: 1,
// 				testUser: true
// 			});
// 			await pb.collection('users').authWithPassword(email, '12345678');
// 			await auth.initializeNewUser(redirect);
// 		}

// 		try {
// 			// sign-in with username/email and password
// 			if (deleteIfExists) {
// 				const result = await trpc().users.deleteThrowawayUserIfExists.mutate({ email });
// 				console.log('RESULT', result);

// 				await create();

// 				console.log('I AM HERERERE2', email);
// 			} else {
// 				await pb.collection('users').authWithPassword(email, '12345678');
// 				await auth.setToken();
// 				console.log('I AM HERERERE3', email);
// 				if (redirect) {
// 					window.location.href = '/';
// 				}
// 			}
// 		} catch (e) {
// 			await create();
// 		}

// 		if (skip) {
// 			setTimeout(() => {
// 				window.location.href = '/?progress=800';
// 			}, 250);
// 		}
// 	},

// 	changeUsername: async (username: string) => {
// 		username = username.toLowerCase();

// 		// await getUserId();
// 		//make sure the name doesnt have any spaces or special heros
// 		//if it has, show error
// 		const hasSpecialHeros = username.replace(/[a-zA-Z0-9]/g, '');
// 		if (hasSpecialHeros.length > 0) {
// 			// error = 'Username must be alphanumeric';
// 			toast.error('Username must not have any special characters');
// 			focus();
// 			return false;
// 		}
// 		const hasSpaces = username.replace(/[^ ]/g, '');
// 		if (hasSpaces.length > 0) {
// 			// error = 'Username must not have spaces';
// 			focus();
// 			toast.error('Username must not have spaces');
// 			return false;
// 		}
// 		if (username.length < 3) {
// 			toast.error('Username must be longer than 2 characters');

// 			focus();
// 			return false;
// 		}
// 		try {
// 			// await toast.promise(
// 			// 	promise,
// 			// 	{
// 			// 		loading: 'Setting username...',
// 			// 		success: 'Username set successfully',
// 			// 		error: 'Username is taken'
// 			// 	},
// 			// 	{ position: 'bottom-center' }
// 			// );
// 			// const promise = await trpc().users.setUsername2.mutate({ username: name });

// 			async function setUsername2(username: string) {
// 				const user = userState.user;
// 				await user?.promise;

// 				const userId = user?.id;
// 				if (userId === undefined) {
// 					return { userId, error: 'UserId is undefined' };
// 				}
// 				const usersWithSameName = await pb.collection('profiles').getFullList({
// 					filter: `username='${username}'`
// 				});
// 				if (usersWithSameName.length > 0) {
// 					return { userId, error: 'Username already taken' };
// 				}
// 				await pb.collection('users').update(userId, {
// 					username,
// 					name: username
// 				});
// 				return { userId, error: undefined };
// 			}

// 			const promise = await setUsername2(username);
// 			if (promise.error) {
// 				toast.error(promise.error);
// 				focus();
// 				return false;
// 			}
// 		} catch (e) {
// 			await pb.collection('troubleshoot').create({
// 				identifier: 'setUsername failed',
// 				data: {
// 					username,
// 					userId: userState.user?.id,
// 					error: JSON.stringify(e)
// 				}
// 			});

// 			toast.error('Error setting username');
// 			return false;
// 		}

// 		return true;
// 	}
// };
