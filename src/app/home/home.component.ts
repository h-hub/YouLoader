import { Component, OnInit } from '@angular/core';
import { IpcService } from '../service/ipc.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private readonly _ipc: IpcService) { }

  ngOnInit() {
  }

  clickMessage = '';
  public url : string = "";

  onClickMe() {
    this.clickMessage = 'You are my hero!'+this.url;
    this._ipc.send('ping',this.url);
  }

}
