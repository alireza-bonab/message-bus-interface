import { BaseDTO } from '../dto';
import * as MsgPack5 from 'msgpack5';
import { classToPlain, plainToClass } from 'class-transformer';

const packer = MsgPack5();

export function getChannelNameFromEventType(
  instance: BaseDTO,
  channelNamePrefix?: string,
): string;
export function getChannelNameFromEventType(
  constructor: new () => BaseDTO,
  channelNamePrefix?: string,
): string;
export function getChannelNameFromEventType(
  arg: any,
  channelNamePrefix?: string,
) {
  return arg.getChannelName(channelNamePrefix);
}

export async function serializeMsg(msg: any): Promise<Buffer> {
  const packedMsg = packer.encode(classToPlain(msg));
  const buf = Buffer.alloc(packedMsg.length);
  packedMsg.copy(buf);
  return buf;
}

export async function unSerializeMsg<T>(
  msg: Buffer,
  MapToCls: new () => T,
): Promise<T> {
  const rawMsg = packer.decode(msg);
  return plainToClass(MapToCls, rawMsg);
}

export async function readFromBus<T>(
  bufMessage: Buffer,
  MapToClass: new () => T,
): Promise<T> {
  const parsedMessage = await unSerializeMsg<T>(bufMessage, MapToClass);

  return parsedMessage;
}
