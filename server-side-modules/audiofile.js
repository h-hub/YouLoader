class Audiofile {

    constructor(position, name, url, progress, action, path, status) {
        this.position = position;
        this.name = name;
        this.url = url;
        this.progress = progress;
        this.action = action;
        this.path = path;
        this.status = status;
    }

    set(attr, val) {
        this.attr = val;
      }
}

module.exports = Audiofile;