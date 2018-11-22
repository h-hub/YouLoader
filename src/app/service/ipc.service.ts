import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})
export class IpcService {
    private _ipc: IpcRenderer | undefined = void 0;

    constructor() {
        if (window.require) {
            try {
                this._ipc = window.require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        } else {
            console.warn('Electron\'s IPC was not loaded');
        }
    }

    public on(channel: string) {
        if (!this._ipc) {
            return;
        }

        return Observable.create((observer) => {
            this._ipc.on(channel, (event, arg) => {
                observer.next(arg);
            })
        });
    }

    public send(channel: string, ...args): void {
        if (!this._ipc) {
            return;
        }
        this._ipc.send(channel, ...args);
    }

}