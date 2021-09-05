import { EventEmitter as Emitter } from 'eventemitter3';

export class CacheUpdateEvent {
  static type = 'CacheUpdate';
  id: string;
  parser: any;
  isNew: boolean;
  isActive: boolean;
  constructor(id: string, isNew: boolean, parser: any, isActive: boolean) {
    this.id = id;
    this.parser = parser;
    this.isNew = isNew;
    this.isActive = isActive;
  }
}

export class CacheDeleteEvent {
  static type = 'CacheDelete';
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class EventEmitter {
  private emitter = new Emitter();

  onCache(callback: (args: CacheUpdateEvent) => void) {
    this.emitter.on(CacheUpdateEvent.type, callback);

    return () => this.emitter.removeListener(CacheUpdateEvent.type, callback);
  }

  raiseCacheUpdated(
    id: string,
    isNew: boolean,
    parser: any,
    isActive: boolean,
  ) {
    this.emitter.emit(
      CacheUpdateEvent.type,
      new CacheUpdateEvent(id, isNew, parser, isActive),
    );
  }

  raiseCacheDeleted(id: string) {
    this.emitter.emit(CacheDeleteEvent.type, new CacheDeleteEvent(id));
  }
}
