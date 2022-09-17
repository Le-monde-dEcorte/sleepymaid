import { initConfig } from '@sleepymaid/shared';
import { HandlerClient } from '@sleepymaid/handler';
import { GatewayIntentBits } from 'discord.js';
import { resolve } from 'path';
(async () => {
	const client = new HandlerClient(
		{
			devServerId: '821717486217986098',
		},
		{
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		},
	);

	client.loadHandlers({
		commands: {
			folder: resolve(__dirname, './commands'),
		},
		listeners: {
			folder: resolve(__dirname, './listeners'),
		},
		tasks: {
			folder: resolve(__dirname, './tasks'),
		},
	});

	const config = initConfig();

	await client.login(config.discordToken);
})().catch(console.error);
