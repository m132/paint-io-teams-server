import { EventEmitter } from 'events';

export interface Protocol extends EventEmitter {
    // FIXME: narrow it down
    // new (server_state: ServerState): void;
}
