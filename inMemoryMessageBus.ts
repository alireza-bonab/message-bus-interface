import { LoggerService } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { BaseDTO } from '../dto';
import {
  getChannelNameFromEventType,
  readFromBus,
  serializeMsg,
} from './messageBus';

export type MessageHandler<T> = (message: T) => Promise<any>;

interface Subscribers {
  [key: string]: MessageHandler<any>[];
}

export class InMemoryMessageBus {
  private static _instance: InMemoryMessageBus;

  private subscribers: Subscribers = {};

  private constructor(private logger?: LoggerService) {}

  static instance(logger?: LoggerService) {
    if (!InMemoryMessageBus._instance) {
      InMemoryMessageBus._instance = new InMemoryMessageBus(logger);
    }
    return InMemoryMessageBus._instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close() {}

  async publish<T extends BaseDTO>(message: T, channelNamePrefix = '') {
    const channelName = getChannelNameFromEventType(message, channelNamePrefix);
    await validateOrReject(message);
    const serializedMsg = await serializeMsg(message);
    await this.handlePublish(channelName, serializedMsg);
  }

  async subscribe<T extends BaseDTO>(
    channel: string,
    messageHandler: MessageHandler<T>,
    Cls: new () => T,
  ) {
    return this.handleSubscribe(channel, async (message: any) => {
      const unSerializedMessage = await readFromBus<T>(message, Cls);
      await validateOrReject(unSerializedMessage);
      await messageHandler(unSerializedMessage);
    });
  }

  private async handlePublish(
    channel: string,
    serializedMessage: any,
  ): Promise<any> {
    if (this.subscribers[channel] && this.subscribers[channel].length) {
      try {
        await Promise.all(
          this.subscribers[channel].map((handler) => {
            return handler(serializedMessage);
          }),
        );
      } catch (e) {
        this.logger.error(e.message, e.stack);
      }
    }
  }

  private async handleSubscribe(
    channel: string,
    handler: MessageHandler<unknown>,
  ): Promise<void> {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
    }
    this.subscribers[channel].push(handler);
  }
}
