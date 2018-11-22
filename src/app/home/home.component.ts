import { Component, OnInit, NgZone } from '@angular/core';
import { IpcService } from '../service/ipc.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    clickMessage = '';
    public url: string = "";
    progress: string;

    constructor(private readonly _ipc: IpcService, private _ngzone: NgZone) { }

    ngOnInit() {
        this._ipc.on('asynchronous-reply')
            .subscribe((message: string) => {
                this._ngzone.run(() => {
                    this.progress = message;
                });
            });
    }

    onClickMe() {
        this.clickMessage = 'Downloading : ' + this.url;
        this._ipc.send('download', this.url);
    }
}
