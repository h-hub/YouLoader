class Audiofile {

    constructor(position, name, url, progress, action, path) {
        this.position = position;
        this.name = name;
        this.url = url;
        this.progress = progress;
        this.action = action;
        this.path = path;
        this.stream = {};
        this.video = {};
    }
}

module.exports = Audiofile;