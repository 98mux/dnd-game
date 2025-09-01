import { devices, type PlaywrightTestConfig } from '@playwright/test';

const baseConfig: PlaywrightTestConfig = {
	testDir: 'tests/playwright',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	// reporter: [['html', { outputFolder: 'test-results/playwright-report', open: 'never' }], ['list']],
	reporter: [['list']],
	projects: [
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 13']
			}
		}
	],
	use: {
		screenshot: 'only-on-failure'
		// screenshot: 'on'
	},
	timeout: 120000,
	retries: 1
};

const configDev: PlaywrightTestConfig = {
	...baseConfig,
	webServer: {
		command: 'PUBLIC_TEST=true npm run dev',
		port: 5173
	}
};

const configProd: PlaywrightTestConfig = {
	...baseConfig,
	webServer: {
		command: 'PUBLIC_TEST=true npm run preview',
		port: 4173
	}
};

const config = process.env.PROD === 'true' ? configProd : configDev;

export default config;
