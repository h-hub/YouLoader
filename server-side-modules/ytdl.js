const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const path = require("path");
const Audiofile = require('./audiofile');
const openedStreams = [];
const Store = require('./store');

const store = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds: { width: 800, height: 600 },
        mp3files: []
    }
});

const existingFiles = store.get("mp3files");

function youtTubeutil() {

    this.downloadVideo = function (url, event) {

        ytdl.getInfo(url, function (err, info) {

            if (err) throw err;
            startDownload(info, url, event);

        });

    }

    this.resumeDownload = function (video_id, event) {

        if (isVideoExistInStream(video_id)) {
            getVideoByVideoIdFromStream(video_id).resume();
        } else if (isVideoExist(video_id)) {
            this.downloadVideo(getUrlByVideoIdFromStore(video_id), event);
        }

        event.sender.send('initData', store.get("mp3files"));
    }

    this.stopDownload = function (video_id, event) {

        getVideoById(video_id).pause();

        event.sender.send('initData', store.get("mp3files"));
    }

    this.deleteDownload = function (video_id, event) {

        var streamIndex = getStreamIndexByVideoId(video_id);

        if (streamIndex != -1) {
            openedStreams[streamIndex].video.pause();
            openedStreams[streamIndex].stream.end();
            openedStreams.splice(streamIndex, 1);
        }
        var existingFilesIndex = getStoreIndexByVideoId(video_id);

        fs.unlink(existingFiles[existingFilesIndex].path, (err) => {
            if (err) throw err;
        });

        existingFiles.splice(existingFilesIndex, 1);

        store.set("mp3files", existingFiles);

        event.sender.send('initData', store.get("mp3files"));
    }

    this.setStatus = function (video_id, status) {
        changeStatus(video_id, status);
    }
}

function changeStatus(video_id, status) {
    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    existingFiles[existingFilesIndex].status = status;
    store.set("mp3files", existingFiles);
}

function getVideoById(video_id) {
    var streamIndex = getStreamIndexByVideoId(video_id);
    return openedStreams[streamIndex].video;
}

function isValidLink(video_id) {

    var existingFilesIndex = getStoreIndexByVideoId(video_id);

    if (existingFilesIndex != -1 && existingFiles[existingFilesIndex].status != "ABORTED") {
        return false;
    }

    return true;

}

function isVideoExist(video_id) {

    var existingFilesIndex = getStoreIndexByVideoId(video_id);

    if (existingFilesIndex == -1) {
        return false;
    }

    return true;
}

function isVideoExistInStream(video_id) {

    var streamIndex = getStreamIndexByVideoId(video_id);

    if (streamIndex == -1) {
        return false;
    }

    return true;
}

function createMp3File(video_id, title, url, output) {

    var mp3file = new Audiofile(video_id, title, url, '0%', '', output, 'IN_PROGRESS');

    existingFiles.push(mp3file);
    store.set("mp3files", existingFiles);

}

function startDownload(info, url, event) {

    const video = ytdl(url, { filter: 'audioonly' });
    var title = info.title.replace(/[\\/:"*?<>|]/g, '');

    if (!isValidLink(info.video_id, event)) {
        event.sender.send('addingLink', { "linkAdded": false, "linkExists": true });
        return;
    }

    const output = path.resolve('./mp3s', title + '.mp3');
    const writeStream = fs.createWriteStream(output, { mode: 0o755 });

    if (!isVideoExist(info.video_id)) {
        createMp3File(info.video_id, info.title, url, output);
    }

    event.sender.send('addingLink', { "linkAdded": false, "linkExists": false });

    video.pipe(writeStream);
    changeStatus(info.video_id, "IN_PROGRESS");

    handleVideoEvents(video, event, info);

    openedStreams.push({ "video_id": info.video_id, "stream": writeStream, "video": video, "output": output });
}

function handleVideoEvents(video, event, info) {

    let starttime;

    video.once('response', () => {
        starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => {
        const floatDownloaded = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;

        var existingFilesIndex = getStoreIndexByVideoId(info.video_id);
        if (existingFilesIndex != -1) {
            existingFiles[existingFilesIndex].progress = `${(floatDownloaded * 100).toFixed(2)}%`;
        }

        store.set("mp3files", existingFiles);

        event.sender.send('initData', store.get("mp3files"));
    });

    video.on('end', () => {
        changeStatus(info.video_id, "COMPLETED", store);
    });

}

function getUrlByVideoIdFromStore(video_id){
    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    return existingFiles[existingFilesIndex].url;
}

function getVideoByVideoIdFromStream(video_id){
    var streamIndex = getStreamIndexByVideoId(video_id);
    return openedStreams[streamIndex].video;
}

function getStreamIndexByVideoId(video_id){
    var streamIndex = openedStreams.findIndex((x => x.video_id === video_id));
    return streamIndex;
}

function getStoreIndexByVideoId(video_id){
    var existingFilesIndex = existingFiles.findIndex((x => x.position === video_id));
    return existingFilesIndex;
}

module.exports = youtTubeutil;

