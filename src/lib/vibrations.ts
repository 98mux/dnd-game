import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function vibrate(size: 1 | 2 | 3) {
	const device = Capacitor.getPlatform();

	if (device === 'web') {
		return;
	}
	if (device === 'android') {
		//Android vibrations are horribly strong...
		return;
		// size = 1;
	}

	//console log trace
	// console.trace('vibrate', size);
	// console.log('DOING A VIBRATION');

	const style =
		size === 1 ? ImpactStyle.Light : size === 2 ? ImpactStyle.Medium : ImpactStyle.Heavy;
	await Haptics.impact({
		style
	});
}
