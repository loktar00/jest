export default class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.pending = [];
        this.loaded = 0;
        this.total = 0;
        this.progressCallback = null;
    }

    get loadingComplete() {
        return this.total === 0 || this.loaded >= this.total;
    }

    set onProgress(callback) {
        this.progressCallback = callback;
    }

    notifyProgress() {
        if (this.progressCallback) {
            this.progressCallback(this.loaded, this.total);
        }
    }

    /**
     * ResourceManager.add(_resource, _type, _name)
     * Adds a new resource and begins loading. Returns a Promise that resolves when loaded.
     */
    add(_resource, _type, _name = '') {
        const resource = { path: _resource, type: _type, name: _name };

        if (_resource.src) {
            resource.path = _resource.src;
        }

        this.total++;

        const promise = new Promise((resolve, reject) => {
            if (_type === 1 || _type === 'img' || _type === null) {
                if (_resource.nodeType === 1) {
                    resource.source = _resource;
                } else {
                    resource.source = new Image();
                }

                resource.source.onload = () => {
                    resource.loaded = true;
                    this.loaded++;
                    this.notifyProgress();
                    resolve(resource);
                };

                resource.source.onerror = () => {
                    reject(new Error(`Failed to load image: ${resource.path}`));
                };

                if (_resource.nodeType === 1) {
                    resource.source.src = _resource.src;
                } else {
                    resource.source.src = _resource;
                }

                // Handle already-complete images
                if (resource.source.complete && resource.source.width) {
                    resource.loaded = true;
                    this.loaded++;
                    this.notifyProgress();
                    resolve(resource);
                }
            } else if (_type === 2 || _type === 'audio') {
                resource.source = new Audio();

                resource.source.addEventListener(
                    'canplaythrough',
                    () => {
                        if (!resource.loaded) {
                            resource.loaded = true;
                            this.loaded++;
                            this.notifyProgress();
                            resolve(resource);
                        }
                    },
                    { once: true }
                );

                resource.source.addEventListener(
                    'error',
                    () => {
                        reject(
                            new Error(`Failed to load audio: ${resource.path}`)
                        );
                    },
                    { once: true }
                );

                resource.source.src = _resource;
            } else {
                resolve(resource);
            }
        });

        this.resources.set(_name, resource);
        this.pending.push(promise);

        return resource;
    }

    /**
     * ResourceManager.loadAll()
     * Returns a Promise that resolves when all pending resources are loaded.
     */
    loadAll() {
        return Promise.all(this.pending);
    }

    /**
     * ResourceManager.getResource(name)
     * Returns the resource by name if found.
     */
    getResource(_name) {
        const resource = this.resources.get(_name);
        return resource || '';
    }
}
