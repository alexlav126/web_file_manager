import { url_files } from './url.js'

function get_request_data_read_folder(path) {
    return {
        'action': 'read_folder',
        'path': path
    }
}

function get_request_data_create_folder(path) {
    return {
        'action': 'create_folder',
        'path': path
    }
}

async function send_post_request(data = {}) {
    // const url = window.location.origin + window.location.pathname;
    const url = url_files;
    console.log('send_post_request() data:', data);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const resp = await response.json();
        console.log('Успех:', resp);
        return resp;
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

export {
    get_request_data_read_folder,
    get_request_data_create_folder,
    send_post_request
}
