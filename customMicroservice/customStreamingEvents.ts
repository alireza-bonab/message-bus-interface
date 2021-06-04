import {
  CustomTransportStrategy,
  MessageHandler,
  Server,
} from '@nestjs/microservices';
import { InMemoryMessageBus } from './inMemoryMessageBus';
import { BaseDTO } from '../dto';

export class CustomStreamingEvents
  extends Server
  implements CustomTransportStrategy
{
  private serverInstance: InMemoryMessageBus;

  constructor() {
    super();
  }

  close() {
    return this.serverInstance.close();
  }

  async listen(callback: () => void) {
    this.serverInstance = InMemoryMessageBus.instance(this.logger);

    this.registerHandlers();

    callback();
  }

  private registerHandlers() {
    for (const [k, v] of this.getHandlers() as Map<any, MessageHandler>) {
      // eslint-disable-next-line new-cap
      if (!(new k() instanceof BaseDTO)) {
        // Create an instance to check it inherits BaseDTO
        this.logger.warn(
          `Skipping handler for ${k}`,
          CustomStreamingEvents.name,
        );
      } else {
        this.serverInstance.subscribe(k.getChannelName(), v, k);
      }
    }
  }
}
