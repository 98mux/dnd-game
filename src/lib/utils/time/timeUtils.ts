import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export function formatDayjsDate(dayjs: any) {
	const iosString = dayjs.toISOString();
	const formated = iosString.replace('T', ' ');
	return formated;
}

//THIS NEEDS TO BE USED TO GET PROPER POCKETBASE QUIRES WITH DATES THAT INCLUDES TIME (!!!)
export function fixDateString(date: string) {
	date = date.replace('T', ' ');
	return date;
}

// export function

export function getCurrentDateInUserGMT(userGMTOffset: number, shift: number, date2?: string) {
	const serverDate = date2 ?? new Date().toISOString();
	// Parse the server date as UTC regardless of its original timezone
	const serverDayjs = dayjs.utc(serverDate);
	// Convert the server date to the user's timezone
	let userDate = serverDayjs.utcOffset(userGMTOffset);
	userDate = userDate.add(shift, 'hour');
	const formated = userDate.format('YYYY-MM-DD');
	const date = dayjs(formated).tz('Etc/GMT', true);
	let s = date.toISOString();
	s = s.replace('T', ' ');
	return s;
}

export function getIntervalFromDate(date: string, interval: 'day' | 'week' | 'month') {
	if (interval === 'week') {
		interval = 'isoWeek';
	}
	let now = dayjs(date);
	now = now.utc();

	now = now.startOf(interval);
	let string = now.toISOString();
	string = string.replace('T', ' ');
	return string;
}
