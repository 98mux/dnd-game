import dayjs from 'dayjs';
import { json } from '@sveltejs/kit';

// let code =
// 	'EAANuUHjmOGgBOwUKZAgXxH5mlCZA2M009yvg944Y3fj54tZCG5FPjtZAM80P3HZAMVBBHjAP0gbfwVruItwQb5LIRZCPj7h1Gy1X7H5UzdNLZCsybDkzNIZBb9AgXNqszYF1hOjqpFRWCkvUHvHQe8DWPP72iXOOrKchlZCPeOyov4W5n699WUNcbXwuNt1gCiB2s2QZDZD';
let code =
	'EAANuUHjmOGgBOy1B0ksVsnVdavSaGusXZAcCKK5q62Q63cxZBpowYZBh6YSJl42VYSDWvjmnq5jw0dkTnNcqMzbnSQ3JgSw8AAc4qTCMuRDFn38ATY7Isvs3XEaYC9ZBZCPoeON3Bv6dC6q9KtOLSclCV9xQnFELFmWq0Mqv25fY9mccnKZBLnYyfVAO4KD4ZCmNwZDZD';

function getUrl(api_version: string, pixel_id: string, token: string) {
	let url = `https://graph.facebook.com/${api_version}/${pixel_id}/events?access_token=${token}`;
	return url;
}

// function generateFBC(fbclid: string) {
// 	if (fbclid) {
// 		// const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
// 		// return `fb.1.${timestamp}.${fbclid}`;
// 		// const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
// 		return `fb.1.${dayjs().unix()}.${fbclid}`;
// 	}
// 	return null;
// }

function createPayload(ip: string, userAgent: string, fbc: string) {
	let seconds = dayjs().unix();
	// let unixTime = dayjs().valueOf() - 1000 * 60 * 3;
	let unixTime = Date.now() - 1000 * 60 * 1;

	// let fbc = generateFBC(fbclid);
	console.log('FBC:', fbc);

	return {
		data: [
			{
				event_name: 'Lead',
				event_time: seconds,
				action_source: 'website',
				// event_id: eventId,
				user_data: {
					client_ip_address: ip,
					client_user_agent: userAgent,
					fbc: fbc
				}
			}
		]
		// test_event_code: 'TEST72254'
	};
}
const pixelId = '489189500516901';

export async function POST({ request, getClientAddress }) {
	const data = await request.json();
	const fbc = data.fbc;
	// let ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ;
	const userAgent = request.headers.get('user-agent');
	// const fbclid = request.headers.get('fbclid');
	const ip = getClientAddress();
	console.log(ip, userAgent, fbc);

	if (!ip || !userAgent) {
		return json({ success: false }, { status: 400 });
	}

	const payload = createPayload(ip, userAgent, fbc);
	console.log(payload);
	const url = getUrl('v21.0', pixelId, code);
	// console.log(url, payload);

	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	const data2 = await response.json();
	console.log(data2);

	return json({ success: true, payload }, { status: 200 });
}
