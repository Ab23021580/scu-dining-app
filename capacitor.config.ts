import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.scu.cuisine',
	appName: '東吳美食',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	}
};

export default config;
