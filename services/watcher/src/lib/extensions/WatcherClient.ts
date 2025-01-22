/* eslint-disable unicorn/prefer-module */
import { resolve } from "node:path";
import process from "node:process";
import { createDrizzleInstance, DrizzleInstance } from "@sleepymaid/db";
import { BaseContainer, HandlerClient } from "@sleepymaid/handler";
import { Logger } from "@sleepymaid/logger";
import type { Config } from "@sleepymaid/shared";
import { initConfig, supportedLngs } from "@sleepymaid/shared";
import { GatewayIntentBits } from "discord-api-types/v10";
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import WatcherContainer from "./WatcherContainer";
import { Redis } from "iovalkey";

export class WatcherClient extends HandlerClient {
	declare public drizzle: DrizzleInstance;

	declare public config: Config;

	declare public logger: Logger;

	declare public container: BaseContainer<this> & WatcherContainer;

	declare public redis: Redis;

	public constructor() {
		super(
			{
				devServerId: "821717486217986098",
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildWebhooks,
					GatewayIntentBits.MessageContent,
					GatewayIntentBits.GuildMessageReactions,
					GatewayIntentBits.GuildEmojisAndStickers,
					GatewayIntentBits.GuildInvites,
					// GatewayIntentBits.GuildScheduledEvents,
					// GatewayIntentBits.GuildPresences,
					GatewayIntentBits.GuildModeration,
					GatewayIntentBits.GuildIntegrations,
				],
				allowedMentions: { parse: ["users", "roles"], repliedUser: false },
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.logger = new Logger(this.env, this.config.discordWebhookUrl);
		this.env = this.config.nodeEnv;

		this.drizzle = createDrizzleInstance(this.config.databaseUrl);
		this.redis = new Redis(this.config.redisUrl);

		await i18next.use(FsBackend).init({
			// debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: resolve(__dirname, "../../../../../locales/watcher/{{lng}}/{{ns}}.json"),
			},
			cleanCode: true,
			fallbackLng: "en-US",
			preload: ["en-US", "fr"],
			defaultNS: "translation",
			ns: "translation",
		});

		// Override container type
		this.container = new WatcherContainer(this) as BaseContainer<this> & WatcherContainer;

		this.loadHandlers({
			commands: {
				folder: resolve(__dirname, "..", "..", "commands"),
			},
			listeners: {
				folder: resolve(__dirname, "..", "..", "listeners"),
			},
			/* tasks: {
				folder: resolve(__dirname, '..', '..', 'tasks'),
			},*/
		});

		void this.login(this.config.discordToken);

		process.on("unhandledRejection", (error: Error) => {
			this.logger.error(error);
		});
	}
}
