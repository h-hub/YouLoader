const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const path = require("path");

function youtTubeutil() {

    this.downloadVideo = function (url, event) {

        const video = ytdl(url, { filter: 'audioonly' });

        ytdl.getInfo(url, function (err, info) {

            var title = info.title;

            const output = path.resolve('./mp3s', title + '.mp3');

            let starttime;
            video.pipe(fs.createWriteStream(output));

            video.once('response', () => {
                starttime = Date.now();
            });
            video.on('progress', (chunkLength, downloaded, total) => {
                const floatDownloaded = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                event.sender.send('asynchronous-reply', 
                {   
                    "video_id" : info.video_id,
                    "progress" : `${(floatDownloaded * 100).toFixed(2)}%` 
                });
            });
            video.on('end', () => {

            });
        });
    }

    this.getName = function (url, event) {

        var title = 'Not found';

        ytdl.getInfo(url, function (err, info) {
            event.sender.send('sendVideoTitle', 
            {
                "video_id" : info.video_id,
                "title" : info.title
            });
        });

        return title;
    }
}

module.exports = youtTubeutil;