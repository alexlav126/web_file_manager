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

function get_request_data_remove_files(files) {
    return {
        'action': 'remove_files',
        'files': files
    }
}

function get_request_data_copy_files(files, dst_path) {
    return {
        'action': 'copy_files',
        'files': files,
        'dst_path': dst_path
    }
}

function get_request_data_move_files(files, dst_path) {
    return {
        'action': 'move_files',
        'files': files,
        'dst_path': dst_path
    }
}


async function send_post_request(url, data) {
    console.log('send_post_request() url:' + url + ' data:', data);
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
    get_request_data_remove_files,
    get_request_data_copy_files,
    get_request_data_move_files,
    send_post_request
}
