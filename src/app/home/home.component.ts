import { Component, OnInit, NgZone } from '@angular/core';
import { IpcService } from '../service/ipc.service';
import { YouThumbService } from '../service/you-thumb.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    clickMessage = '';
    thumbUrl = '';
    public url: string = "";
    progress: string;

    constructor(private readonly _ipc: IpcService, private _ngzone: NgZone, private _youThumb: YouThumbService) { }

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
        this.thumbUrl = this._youThumb.getImage(this.url, 'small');
        this._ipc.send('download', this.url);
    }

    styleThumbnail(): Object {
        return {
            "background-size": "contain" ,
            "background-position" : 'right',
            "background-repeat": "no-repeat",
            "background-origin": "content-box",
            "background-image" : "url("+this.thumbUrl+")"
        } 
    }
    
}
