import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	TaskHandler
} from 'discord-akairo';
import { Intents } from 'discord.js';
import { join } from 'path';
import * as config from '../../config/options';

const myIntents = new Intents([
	'GUILDS',
	'GUILD_MEMBERS',
	'GUILD_BANS',
	'GUILD_INTEGRATIONS',
	'GUILD_VOICE_STATES',
	'GUILD_MESSAGES',
	'GUILD_MESSAGE_TYPING'
]);

export class BotClient extends AkairoClient {
	public commandHandler: CommandHandler = new CommandHandler(this, {
		prefix: config.prefix,
		commandUtil: true,
		handleEdits: true,
		directory: join(__dirname, '..', '..', 'commands'),
		allowMention: true,
		automateCategories: true
	});
	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', '..', 'listeners'),
		automateCategories: true
	});
	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', '..', 'inhibitors')
	});

	public taskHandler: TaskHandler = new TaskHandler(this, {
		directory: join(__dirname, '..', '..', 'tasks')
	});

	public constructor() {
		super(
			{
				ownerID: ['324281236728053760'],
				intents: myIntents
			},
			{
				allowedMentions: {
					parse: ['users'] // Disables all mentions except for users
				},
				intents: myIntents
			}
		);
	}
	private async _init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			process
		});
		// loads all the stuff
		const loaders = {
			commands: this.commandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
			tasks: this.taskHandler
		};
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader].loadAll();
				console.log('Successfully loaded ' + loader + '.');
			} catch (e) {
				console.error('Unable to load ' + loader + ' with error ' + e);
			}
		}
		this.taskHandler.startAll();
	}

	public async start(): Promise<string> {
		await this._init();

		return this.login(config.token);
	}
}
