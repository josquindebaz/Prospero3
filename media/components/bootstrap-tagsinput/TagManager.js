class TagManager {

    constructor(tags) {
        this.tags = tags;
    }
    addTag(id, value) {
        this.tags[id] = value;
    }
    removeTag(id) {
        delete this.tags[id];
    }
}