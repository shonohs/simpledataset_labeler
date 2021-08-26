class Api {
    constructor(base_url) {
        this.base_url = base_url;
    }

    async get_metadata() {
        const url = this.base_url + '/api/metadata';
        const response = await fetch(url);
        return response.json();
    }

    async get_image_labels(image_id) {
        const url = this.base_url + '/api/labels/' + image_id;
        const response = await fetch(url);
        return response.json();
    }

    async put_image_labels(image_id, labels) {
        const url = this.base_url + '/api/labels/' + image_id;
        const response = await fetch(url, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(labels)});
        return response.json();
    }

    async post_save() {
        const url = this.base_url + '/api/save';
        const response = await fetch(url, {method: 'POST'});
        return response.json();
    }

    async post_stop() {
        const url = this.base_url + '/api/stop';
        const response = await fetch(url, {method: 'POST'});
        return response.json();
    }
}

export default new Api("");