import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YouThumbService {

  constructor() { }

  public getImage(url: string, size: string) {
    if (url === null) {
        return '';
    }
    size    = (size === null) ? 'big' : size;

    var host = new URL(url).hostname;
    var video = '';

    if(host === 'youtu.be'){
        video = new URL(url).pathname.substring(1);
    } else {
        var results = url.match('[\\?&]v=([^&#]*)');
        video   = (results === null) ? url : results[1];
    }

    if (size === 'small') {
        return 'http://img.youtube.com/vi/' + video + '/2.jpg';
    }
    return 'http://img.youtube.com/vi/' + video + '/0.jpg';

  }

}
