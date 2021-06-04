/* eslint-disable @typescript-eslint/ban-types */

export abstract class BaseType<T = unknown> {
  constructor(properties: Partial<Exclude<T, Function>> = {}) {
    Object.assign(this, properties);
  }
}

function createChannelNameFromClassName(
  className: string,
  channelNamePrefix = '',
) {
  return `${channelNamePrefix}${className
    .slice(0, 1)
    .toLowerCase()}${className.slice(1)}`;
}

export abstract class BaseDTO<T = unknown> extends BaseType<T> {
  static getChannelName(channelNamePrefix: string) {
    return createChannelNameFromClassName(
      this.prototype.constructor.name,
      channelNamePrefix,
    );
  }

  getChannelName(channelNamePrefix: string) {
    return (this as any).constructor.getChannelName(channelNamePrefix);
  }
}
