const fs = require('fs');
const ytdl = require('ytdl-core');
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
            changeStatus(video_id, "IN_PROGRESS");
        } else if (isVideoExistInStore(video_id)) {
            this.downloadVideo(getUrlByVideoIdFromStore(video_id), event);
        }

        event.sender.send('initData', store.get("mp3files"));
    }

    this.stopDownload = function (video_id, event) {

        getVideoById(video_id).pause();
        changeStatus(video_id, "STOPPED");
        event.sender.send('initData', store.get("mp3files"));
    }

    this.deleteDownload = function (video_id, event) {

        if (isVideoExistInStream(video_id)) {
            deleteStream(video_id);
        }

        fs.unlink(getPathByVideoId(video_id), (err) => {
            if (err) throw err;
        });

        deleteVideoFromFile(video_id);
        event.sender.send('initData', store.get("mp3files"));
    }

    this.prepareToExit = function () {

        openedStreams.forEach(function (stream) {
            stream.video.pause();
        });

        existingFiles.forEach(function (file) {
            if (file.status == "IN_PROGRESS" || file.status == "STOPPED") {
                changeStatus(file.videoId, "ABORTED");
            }
        });
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

function isVideoExistInStore(video_id) {

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

function createMp3File(videoId, title, url, output) {

    var mp3file = new Audiofile(videoId, title, url, '0%', 'IN_PROGRESS', output);

    existingFiles.push(mp3file);

}

function startDownload(info, url, event) {

    const video = ytdl(url, { filter: 'audioonly' });
    const title = info.title.replace(/[\\/:"*?<>|]/g, '');

    if (!isValidLink(info.video_id, event)) {
        event.sender.send('addingLink', { "linkAdded": false, "linkExists": true });
        return;
    }

    const output = path.resolve('./mp3s', title + '.mp3');
    const writeStream = fs.createWriteStream(output, { mode: 0o755 });

    if (!isVideoExistInStore(info.video_id)) {
        createMp3File(info.video_id, info.title, url, output);
    }

    event.sender.send('addingLink', { "linkAdded": false, "linkExists": false });

    video.pipe(writeStream);

    changeStatus(info.video_id, "IN_PROGRESS");

    handleVideoEvents(video, event, info);

    openedStreams.push({ "videoId": info.video_id, "stream": writeStream, "video": video, "output": output });
}

function handleVideoEvents(video, event, info) {

    let starttime;

    video.once('response', () => {
        starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => {
        const floatDownloaded = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;

        if (isVideoExistInStore(info.video_id)) {
            setDownloadProgress(floatDownloaded, info.video_id);
        }

        store.set("mp3files", existingFiles);

        event.sender.send('initData', store.get("mp3files"));
    });

    video.on('end', () => {
        changeStatus(info.video_id, "COMPLETED");
    });

}

function getUrlByVideoIdFromStore(video_id) {

    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    return existingFiles[existingFilesIndex].url;

}

function getVideoByVideoIdFromStream(video_id) {

    var streamIndex = getStreamIndexByVideoId(video_id);
    return openedStreams[streamIndex].video;

}

function getStreamVideoIdFromStream(video_id) {

    var streamIndex = getStreamIndexByVideoId(video_id);
    return openedStreams[streamIndex].stream;

}

function removeVideoFromStream(video_id) {
    var streamIndex = getStreamIndexByVideoId(video_id);
    openedStreams.splice(streamIndex, 1);
}

function getStreamIndexByVideoId(video_id) {

    var streamIndex = openedStreams.findIndex((x => x.videoId === video_id));
    return streamIndex;

}

function getPathByVideoId(video_id) {
    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    return existingFiles[existingFilesIndex].path;
}

function getStoreIndexByVideoId(video_id) {

    var existingFilesIndex = existingFiles.findIndex((x => x.videoId === video_id));
    return existingFilesIndex;

}

function deleteStream(video_id) {

    getVideoByVideoIdFromStream(video_id).pause();
    getStreamVideoIdFromStream(video_id).end();
    removeVideoFromStream(video_id);

}

function deleteVideoFromFile(video_id) {
    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    existingFiles.splice(existingFilesIndex, 1);
}

function setDownloadProgress(floatDownloaded, video_id){
    var existingFilesIndex = getStoreIndexByVideoId(video_id);
    existingFiles[existingFilesIndex].progress = `${(floatDownloaded * 100).toFixed(2)}%`;
}

module.exports = youtTubeutil;

