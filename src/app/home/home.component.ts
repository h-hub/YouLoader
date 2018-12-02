import { Component, OnInit, NgZone } from '@angular/core';
import { IpcService } from '../service/ipc.service';
import { YouThumbService } from '../service/you-thumb.service';
import { MatTableDataSource } from '@angular/material';

export interface PeriodicElement {
    position: string;
    name: string;
    url: string;
    progress: string;
    videoId: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    displayedColumns: string[] = ['position', 'name', 'url', 'progress', 'action'];
    ELEMENT_DATA: PeriodicElement[] = [];
    dataSource = new MatTableDataSource(this.ELEMENT_DATA);

    clickMessage = '';
    thumbUrl = '';
    public url: string = "";
    progress: string;
    isValidInput = '';
    title = '';
    inpuError = '';
    linkeadded: boolean = false;

    constructor(private readonly _ipc: IpcService, private _ngzone: NgZone, private _youThumb: YouThumbService) { }

    ngOnInit() {
        this._ipc.on('asynchronous-reply')
            .subscribe((message: any) => {
                this._ngzone.run(() => {
                    var objIndex = this.ELEMENT_DATA.findIndex((x => x.position === message.video_id));

                    if(objIndex != -1){
                        this.ELEMENT_DATA[objIndex].progress = message.progress;
                        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
                    }
                    
                });
            });

        this._ipc.on('sendVideoTitle')
            .subscribe((message: any) => {

                if (!this.isVideoExist(message.video_id)) {
                    this.ELEMENT_DATA.push({ position: message.video_id, name: message.title, url: this.url, progress: '0%', videoId: message.video_id });
                    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
                    this._ipc.send('download', this.url);
                    this.inpuError = "";
                } else {
                    this.inpuError = "Link exists !";
                }
                this.linkeadded = false;
                this.thumbUrl = "";
                this.url = "";

            });

        this._ipc.on('removeFromList')
            .subscribe((message: any) => {
                this._ngzone.run(() => {
                    this.ELEMENT_DATA = this.ELEMENT_DATA.filter(x => x.position !== message.video_id);
                    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
                });
            });
    }

    addVideo() {
        this.linkeadded = true;
        this._ipc.send('getVideoTitle', this.url);
    }

    styleThumbnail(): Object {
        return {
            "background-size": "contain",
            "background-position": 'right',
            "background-repeat": "no-repeat",
            "background-origin": "content-box",
            "background-image": "url(" + this.thumbUrl + ")",
            "font-size": "15px"
        }
    }

    fetchThumbnail(event: any) {
        this.thumbUrl = this._youThumb.getImage(this.url, 'big');
    }

    stopDownload(videoId: string) {
        this._ipc.send('stopDownload', videoId);
    }

    isVideoExist(videoId: string): boolean {

        var objIndex = this.ELEMENT_DATA.findIndex((x => x.position === videoId));

        if (objIndex == -1) {
            return false;
        }

        return true;
    }

}
