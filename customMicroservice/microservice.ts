import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { CustomStreamingEvents } from './customStreamingEvents';

export async function createMicroservice(module: any) {
  const microservice = await NestFactory.createMicroservice<CustomStrategy>(
    module,
    {
      strategy: new CustomStreamingEvents(),
    },
  );
  return microservice;
}
