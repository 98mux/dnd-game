function generateRandomNumberUsingAllDigits() {
	let digits = 16;
	const max1 = Math.pow(10, digits - 1);
	const max2 = Math.pow(10, digits - 1) * 9;
	return Math.floor(max1 + Math.random() * max2);
}

function binaryToNumber(binary: string) {
	return parseInt(binary, 2);
}

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	let number = generateRandomNumberUsingAllDigits();
	return {
		// abtests: generateABTestString()
		// abtests: binaryToNumber('11110001')
		abtests: number
	};
}
