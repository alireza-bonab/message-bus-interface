import { EventPattern } from '@nestjs/microservices';
import {
  applyDecorators,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { stringify } from 'telejson';
import { BaseDTO } from '../dto';

@Catch()
class CustomEventExceptionHandler<T extends Error>
  implements ExceptionFilter<T>
{
  private logger: Logger;

  constructor() {
    this.logger = new Logger(CustomEventExceptionHandler.name);
  }

  catch(exception: T, host: ArgumentsHost): any {
    // This is an application level error, we want to log it
    const payload = stringify(host?.getArgs() || [], { maxDepth: 2 });

    this.logger.error(
      `${exception.message}\npayload: ${payload}`,
      exception.stack,
    );
  }
}

/**
 * Listen to an event published on the Custom event bus. Event listener
 * will receive an event of the same type the event is subscribed for.
 *
 * @param event
 */
export function CustomEvent<T extends BaseDTO = BaseDTO>(
  event: new () => T,
): MethodDecorator {
  return applyDecorators(
    UseFilters(CustomEventExceptionHandler),
    EventPattern<new () => T>(event),
  );
}
