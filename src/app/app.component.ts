import { Component, OnInit } from '@angular/core';
import { IpcService } from './service/ipc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private readonly _ipc: IpcService) {
    this._ipc.on('pong', (event: Electron.IpcMessageEvent) => {
      console.log('pong');
    });

    this._ipc.send('ping');
    console.log('pong');
   }

  ngOnInit() {
    console.log('pong');
  }

}
