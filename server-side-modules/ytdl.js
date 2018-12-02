const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const path = require("path");
const Audiofile = require('./audiofile');
const openedStreams = [];



function youtTubeutil() {

    this.downloadVideo = function (data, event, store) {

        const video = ytdl(data.url, { filter: 'audioonly' });

        ytdl.getInfo(data.url, function (err, info) {

            var title = info.title.replace(/[\\/:"*?<>|]/g, '');

            var mp3file = new Audiofile( data.fileInfo.position, data.fileInfo.name, data.fileInfo.url, data.fileInfo.progress, data.fileInfo.action );

            var existingFiles = store.get("mp3files");
            existingFiles.push(mp3file);
            store.set("mp3files", existingFiles);

            const output = path.resolve('./mp3s', title + '.mp3');
            const writeStream = fs.createWriteStream(output);
            

            let starttime;

            video.pipe(writeStream);

            video.once('response', () => {
                starttime = Date.now();
            });

            video.on('progress', (chunkLength, downloaded, total) => {
                const floatDownloaded = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                event.sender.send('asynchronous-reply',
                    {
                        "video_id": info.video_id,
                        "progress": `${(floatDownloaded * 100).toFixed(2)}%`
                    });
            });

            openedStreams.push({ "video_id": info.video_id, "stream": writeStream, "video": video });
            //video._destroy
            
        });
    }

    this.getName = function (url, event) {

        var title = 'Not found';

        ytdl.getInfo(url, function (err, info) {
            event.sender.send('sendVideoTitle',
                {
                    "video_id": info.video_id,
                    "title": info.title
                });
        });

        return title;
    }

    this.stopDownload = function (video_id, event) {
        var streamIndex = openedStreams.findIndex((x => x.video_id === video_id));
        openedStreams[streamIndex].video.pause();
        openedStreams.splice(streamIndex, 1);

        event.sender.send('removeFromList',
            {
                "video_id": video_id,
                "progress": `0%`
            });
    }
}

module.exports = youtTubeutil;