import type { EventEmitter } from 'events';

export type Dispose = () => void;

export function waitEvent<T extends EventEmitter>(
  emitter: T,
  eventName: Parameters<T['on']>['0'],
  filter?: (data: any) => boolean,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const listener = (data: any) => {
      if (!filter || filter(data)) {
        emitter.off(eventName, listener);
        resolve(data);
        return;
      }
    };
    emitter.on(eventName, listener);
  });
}
