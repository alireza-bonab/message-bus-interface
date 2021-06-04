import { Test } from '@nestjs/testing';
import { Controller } from '@nestjs/common';
import { CustomerDto, SaleInvoiceDto } from '../dto';
import { CustomEvent } from './decorators';
import { createMicroservice } from './microservice';
import { InMemoryMessageBus } from './inMemoryMessageBus';
import { LoggerService } from '@nestjs/common';

describe('Server', () => {
  const messageBus = InMemoryMessageBus.instance();
  it('listens from decorators', async () => {
    let handlerInstance: ListenerControllerA;

    @Controller()
    class ListenerControllerA {
      public events: CustomerDto[] = [];

      @CustomEvent(CustomerDto)
      async handlerFunction(theEvent: CustomerDto) {
        handlerInstance = this;
        this.events.push(theEvent);
      }
    }

    const module = Test.createTestingModule({
      controllers: [ListenerControllerA],
    });

    const microservice = await createMicroservice(module);
    const listenerControllerA = microservice.get(ListenerControllerA);
    await microservice.listenAsync();

    await messageBus.publish<CustomerDto>(
      new CustomerDto({
        id: 42,
        customerName: 'James Smith',
      }),
    );

    // Check that we get the same instance of controller
    expect(listenerControllerA).toBe(handlerInstance);
    expect(listenerControllerA.events).toEqual([
      {
        id: 42,
        customerName: 'James Smith',
      },
    ]);
    await microservice.close();
  });

  it('nestjs logg the error properly', async () => {
    @Controller()
    class ListenerControllerB {
      @CustomEvent(SaleInvoiceDto)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
      async handlerFunction(theEvent: SaleInvoiceDto) {
        return Promise.reject(new Error('boo noo'));
      }
    }

    const module = Test.createTestingModule({
      controllers: [ListenerControllerB],
    });

    const mockLogger: LoggerService = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const microservice = await createMicroservice(module);

    microservice.useLogger(mockLogger);

    await microservice.listenAsync();

    await messageBus.publish<SaleInvoiceDto>(
      new SaleInvoiceDto({
        id: 1,
        customerName: 'me',
      }),
    );

    const errMsg = `boo noo
payload: [{\"id\":1,\"customerName\":\"me\",\"_constructor-name_\":\"SaleInvoiceDto\"}]`;
    expect(mockLogger.error).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).nthCalledWith(
      1,
      errMsg,
      expect.anything(),
      'CustomEventExceptionHandler',
    );

    await microservice.close();
  });

  it('publish rejects invalid message', async () => {
    await expect(
      messageBus.publish<SaleInvoiceDto>(
        new SaleInvoiceDto({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          id: 'this is invalid Id!',
          customerName: 'me',
        }),
      ),
    ).rejects.toMatchSnapshot();
  });
});
