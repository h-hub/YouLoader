import { Component, OnInit } from '@angular/core';
import { IpcService } from '../../service/ipc.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    constructor( private readonly _ipc: IpcService ) { }

  ngOnInit() {
  }

  goToPage() {
    this._ipc.send('load-page', "");
  }
}
