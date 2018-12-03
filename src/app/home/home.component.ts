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

        this._ipc.on('initData')
            .subscribe((message: any) => {
                this._ngzone.run(() => {
                    this.dataSource = new MatTableDataSource(message);
                    this.linkeadded = false;
                });
            });

        this._ipc.on('addingLink')
            .subscribe((message: any) => {
                this._ngzone.run(() => {
                    this.linkeadded = message.linkAdded;

                    if(message.linkExists){
                        this.inpuError = "Link exists !";
                    } else {
                        this.inpuError = "";
                    }

                    this.thumbUrl = "";
                    this.url = "";
                });
            });
    }

    addVideo() {
        this.linkeadded = true;
        this._ipc.send('download', this.url);
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

    deleteDownload(videoId: string) {
        this._ipc.send('deleteDownload', videoId);
    }

    isVideoExist(videoId: string): boolean {

        var objIndex = this.ELEMENT_DATA.findIndex((x => x.position === videoId));

        if (objIndex == -1) {
            return false;
        }

        return true;
    }

}
