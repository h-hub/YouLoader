const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const path = require("path");
const Audiofile = require('./audiofile');
const openedStreams = [];



function youtTubeutil() {

    this.downloadVideo = function (url, event, store) {

        const video = ytdl(url, { filter: 'audioonly' });

        ytdl.getInfo(url, function (err, info) {

            var title = info.title.replace(/[\\/:"*?<>|]/g, '');

            var existingFiles = store.get("mp3files");
            var existingFilesIndex = existingFiles.findIndex((x => x.position === info.video_id));

            if (existingFilesIndex != -1) {
                event.sender.send('addingLink', { "linkAdded": false, "linkExists": true });
                return;
            }

            const output = path.resolve('./mp3s', title + '.mp3');
            const writeStream = fs.createWriteStream(output, { mode: 0o755 });

            var mp3file = new Audiofile(info.video_id, info.title, url, '0%', '', output);

            var existingFiles = store.get("mp3files");
            existingFiles.push(mp3file);
            store.set("mp3files", existingFiles);

            event.sender.send('addingLink', { "linkAdded": false, "linkExists": false });


            let starttime;

            video.pipe(writeStream);

            video.once('response', () => {
                starttime = Date.now();
            });

            video.on('progress', (chunkLength, downloaded, total) => {
                const floatDownloaded = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;

                var existingFiles = store.get("mp3files");
                var existingFilesIndex = existingFiles.findIndex((x => x.position === info.video_id));
                if (existingFilesIndex != -1) {
                    existingFiles[existingFilesIndex].progress = `${(floatDownloaded * 100).toFixed(2)}%`;
                }

                store.set("mp3files", existingFiles);

                event.sender.send('initData', store.get("mp3files"));
            });

            openedStreams.push({ "video_id": info.video_id, "stream": writeStream, "video": video, "output": output });

        });
    }

    this.stopDownload = function (video_id, event, store) {

        var streamIndex = openedStreams.findIndex((x => x.video_id === video_id));
        openedStreams[streamIndex].video.pause();

        event.sender.send('initData', store.get("mp3files"));
    }

    this.deleteDownload = function (video_id, event, store) {

        var streamIndex = openedStreams.findIndex((x => x.video_id === video_id));

        if (streamIndex != -1) {
            openedStreams[streamIndex].video.pause();
            openedStreams[streamIndex].stream.end();
            openedStreams.splice(streamIndex, 1);
        }

        var existingFiles = store.get("mp3files");
        var existingFilesIndex = existingFiles.findIndex((x => x.position === video_id));

        fs.unlink(existingFiles[existingFilesIndex].path, (err) => {
            if (err) throw err;
            console.log('successfully deleted');
        });

        existingFiles.splice(existingFilesIndex, 1);

        store.set("mp3files", existingFiles);

        event.sender.send('initData', store.get("mp3files"));
    }
}

module.exports = youtTubeutil;