class Audiofile {

    constructor(videoId, name, url, progress, action, path, status) {
        this.videoId = videoId;
        this.name = name;
        this.url = url;
        this.progress = progress;
        this.status = status;
        this.path = path;
        
    }

    set(attr, val) {
        this.attr = val;
      }
}

module.exports = Audiofile;