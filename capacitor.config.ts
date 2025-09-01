import { CapacitorConfig } from '@capacitor/cli';

const appId = 'com.deletecringe.deletecringe';
const appName = 'Delete Cringe';
const server = process.argv.includes('-hmr')
	? {
			url: 'http://10.10.2.35:5173', // always have http:// in url
			cleartext: true
	  }
	: {};
const webDir = 'build';

const config: CapacitorConfig = {
	appId,
	appName,
	webDir,
	server,
	plugins: {
		SplashScreen: {
			// showSpinner: true,
			// androidSpinnerStyle: 'large',
			// iosSpinnerStyle: 'small',
			// spinnerColor: '#ffffff',
			androidScaleType: 'CENTER_CROP',
			launchShowDuration: 2000,
			launchAutoHide: true,
			autoHide: true
		},
		Camera: {
			androidScaleType: 'CENTER_CROP'
		}
	}
};

if (process.argv.includes('-hmr'))
	console.log('WARNING: running capacitor with livereload config', config);

export default config;
