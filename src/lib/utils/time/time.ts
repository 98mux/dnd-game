import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { global } from '$lib/global.svelte';
import { pb } from '$lib/pocketbase/pocketbase';
import { Capacitor } from '@capacitor/core';
import { userState } from '$lib/state/userState.svelte';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getTimezoneAndGMT() {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const gmt = getGMTOffset(timezone);

	return { timezone, gmt };
}

export async function updateUserTimezone() {
	const user = userState.user;
	if (user) {
		if (!!user.state.timezone) {
			return;
		}
		const { timezone, gmt } = getTimezoneAndGMT();
		const userId = userState.userId;

		await pb.collection('users').update(userId, {
			timezone,
			gmt
		});
		// if (global.user) {
		// 	global.user.timezone = timezone;
		// 	global.user.gmt = gmt;
		// }
	}
}

export function getGMTOffset(timezoneString: string) {
	// Get the current date-time in the specified timezone
	const now = dayjs().tz(timezoneString);

	// Get the offset in minutes and convert it to hours
	const offsetInHours = Math.round(now.utcOffset() / 60);

	return offsetInHours;
	// Format the offset into a string like GMT+X or GMT-X
	// const formattedOffset = offsetInHours >= 0 ? `GMT+${offsetInHours}` : `GMT${offsetInHours}`;
	// return formattedOffset;
}
