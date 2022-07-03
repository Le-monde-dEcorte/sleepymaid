import 'reflect-metadata'
import { loadFolder } from '@sleepymaid/util'
import { container } from 'tsyringe'
import { HandlerClient } from '../HandlerClient'
import { ListenerInterface } from './ListenerInterface'

export interface ListenerManagerStartAllOptionsType {
	folder: string
}

export class ListenerManager {
	private client: HandlerClient
	constructor(client: HandlerClient) {
		this.client = client
	}

	public async startAll(
		options: ListenerManagerStartAllOptionsType
	): Promise<void> {
		await this.loadListeners(options.folder)
	}

	private async loadListeners(folderPath: string): Promise<void> {
		const filesToImport = await loadFolder(folderPath)

		let count = 0
		for (const file of filesToImport) {
			const event = container.resolve<ListenerInterface>(
				(await import(file)).default
			)
			if (event.once) {
				try {
					this.client.once(event.name, async (...args) => {
						await event.execute(...args, this.client)
					})
					count++
				} catch (error) {
					this.client.logger.error(error)
				}
			} else {
				try {
					this.client.on(event.name, async (...args) => {
						await event.execute(...args, this.client)
					})
					count++
				} catch (error) {
					this.client.logger.error(error)
				}
			}
			this.client.logger.info(
				`Listener handler: -> Loaded listener -> ${
					file.split('/').pop().split('.')[0]
				}`
			)
		}
		this.client.logger.info(`
			Listener handler: -> Loaded ${count} listeners`)
	}
}
