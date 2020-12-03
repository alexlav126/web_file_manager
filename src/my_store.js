import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {
    get_request_data_read_folder,
    get_request_data_create_folder,
    get_request_data_remove_files,
    get_request_data_copy_files,
    get_request_data_move_files,
    get_request_data_rename_file,
    //send_post_request
} from './server_requests.js'


Vue.use(Vuex)

function get_url_host() {
    if(process.env.NODE_ENV === 'production') {
        return '';
    } else {
        return 'http://localhost:5000';
    }
}

function get_url_files() {
    return get_url_host() + '/files';
}

function get_url_login() {
    return get_url_host() + '/login';
}


function create_file_obj(name, is_folder, href) {
    return {
        is_folder: is_folder,
        name: name,
        href: href,
        selected: false
    }
}

const my_store = new Vuex.Store({
    state: {
        auth: {
            status: '',
            token: localStorage.getItem('token') || '',
            user : ''
        },
        
        is_active_panel_lhs: true,
        status_string: 'ready',
        panel_lhs: {
            is_lhs: true,
            path: null,
            files: [{
                name: '..',
                is_folder: true,
                href: '/',
                selected: false
            }]
        },
        panel_rhs: {
            is_lhs: false,
            path: null,
            files: [{
                name: '..',
                is_folder: true,
                href: '/',
                selected: false
            }]
        },
    },

    getters: {
        is_logged_in: state => !!state.auth.token,
        auth_status: state => state.auth.status,
        auth_token: state => state.auth.token,
        auth_user: state => state.auth.user,
        
        active_panel: state => {
            if(state.is_active_panel_lhs) {
                return state.panel_lhs;
            } else {
                return state.panel_rhs;
            }
        },

        not_active_panel: state => {
            if(state.is_active_panel_lhs) {
                return state.panel_rhs;
            } else {
                return state.panel_lhs;
            }
        },
        
        selected_file_names: state => {
            const active_panel =
                state.is_active_panel_lhs ?
                state.panel_lhs :
                state.panel_rhs;
            const files = active_panel.files.filter(f => f.selected);
            let path = active_panel.path;
            if(path === '/') path = '';
            let names = [];
            for(let f in files) {
                if(files[f].name === '..') continue;
                names.push(path + '/' + files[f].name);
            }
            return names;
        },
    },
    
    mutations: {
        auth_request(state){
            state.auth.status = 'loading'
        },
        
        auth_success(state, {token, user}){
            state.auth.status = 'success'
            state.auth.token = token
            state.auth.user = user
        },
        
        auth_error(state){
            state.auth.status = 'error'
        },
        
        logout(state){
            state.auth.status = ''
            state.auth.token = ''
        },
        
        activate_panel(state, {is_lhs}) {
            state.is_active_panel_lhs = is_lhs === true;
        },

        select_all_files_in_panel: function(state, {is_lhs, selected}) {
            const panel = is_lhs ? state.panel_lhs : state.panel_rhs;
            for (let f in panel.files) {
                panel.files[f].selected = selected;
            }
        },
        
        toogle_file_selected: function(state, {is_lhs, name}) {
            const panel = is_lhs ? state.panel_lhs : state.panel_rhs;
            for(let f in panel.files) {
                if(panel.files[f].name === name) {
                    panel.files[f].selected = !panel.files[f].selected;
                }
            }
        },

        update_status_string: function(state, new_status) {
            state.status_string = new_status;
        },
        
        update_panel(state, {is_lhs, response}) {
            const panel = is_lhs ? state.panel_lhs : state.panel_rhs;

            if(response.status != 'ok') return;
            let path = response.path;

            // remove last '/'
            let ind = path.lastIndexOf('/');
            if((path.length > 1) && (path.length == ind + 1)) {
                path = path.substring(0, ind);
            }
            panel.path = path;
            
            ind = path.lastIndexOf('/');
            let path_back;
            if(ind == 0) {
                path_back = '/';
            } else {
                path_back = path.substring(0, ind);
            }

            let new_file_array = [];
            new_file_array.push(create_file_obj('..', true, path_back));
            if(path === '/') path = '';
            
            for(let folder in response.folders) {
                const name = response.folders[folder];
                const href = path + '/' + name;
                const item = create_file_obj(name, true, href);
                new_file_array.push(item);
            }

            const url = get_url_files();
            
            for(let file in response.files) {
                const name = response.files[file];
                const href = url + '?file=' + path + '/' + name;
                const item = create_file_obj(name, false, href);
                new_file_array.push(item);
            }
            panel.files = new_file_array;
        },
    },

    actions: {
        login({commit}, user) {
            return new Promise((resolve, reject) => {
                commit('auth_request')
                axios({url: get_url_login(), data: user, method: 'POST' })
                .then(resp => {
                    const token = resp.data.token
                    const user = resp.data.user
                    localStorage.setItem('token', token)
                    axios.defaults.headers.common['Authorization'] = token
                    commit('auth_success', {token, user});
                    resolve(resp)
                })
                .catch(err => {
                    commit('auth_error')
                    localStorage.removeItem('token')
                    reject(err)
                })
            })
        },

        logout({commit}){
            return new Promise((resolve/*, reject*/) => {
                commit('logout')
                localStorage.removeItem('token')
                delete axios.defaults.headers.common['Authorization']
                resolve()
            })
        },
        
        read_folder(context, {is_lhs, path}) {
            if (path === undefined) path = '/';
            const data = get_request_data_read_folder(path);
            return new Promise((resolve, reject) => {
                axios({url: get_url_files(), data: data, method: 'POST' })
                .then(resp => {
                    context.commit('update_panel', {
                        is_lhs: is_lhs,
                        response: resp.data
                    });
                    resolve(resp);
                })
                .catch(err => {
                    console.error(err);
                    context.commit('update_status_string', err);
                    reject(err);
                })
            })
        },

        create_folder(context, {path}) {
            if(path === undefined) return;
            const data = get_request_data_create_folder(path);
            return new Promise((resolve, reject) => {
                axios({url: get_url_files(), data: data, method: 'POST' })
                .then(resp => {
                    if(resp.data.status != 'ok') {
                        reject('error: can\'t create folder: ' + path);
                    } else {
                        const s = 'created folder: ' + path;
                        context.commit('update_status_string', s);
                    }
                    resolve(resp);
                })
                .catch(err => {
                    console.error(err);
                    context.commit('update_status_string', err);
                    reject(err);
                })
            })
        },

        remove_files(context, {files}) {
            const data = get_request_data_remove_files(files);
            return axios({url: get_url_files(), data: data, method: 'POST' });
        },

        copy_files(context, {files, dst_path}) {
            const data = get_request_data_copy_files(files, dst_path);
            return axios({url: get_url_files(), data: data, method: 'POST' });
        },

        move_files(context, {files, dst_path}) {
            const data = get_request_data_move_files(files, dst_path);
            return axios({url: get_url_files(), data: data, method: 'POST' });
        },

        rename_file(context, {src_file, dst_file}) {
            const data = get_request_data_rename_file(src_file, dst_file);
            return axios({url: get_url_files(), data: data, method: 'POST' });
        },

        upload_file(context, {file, path, this_arg}) {
            let formData = new FormData();
            formData.append('file', file);
            formData.append('path', path);
            const config = {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: function(e) {
                    this_arg.upload_percentage = Math.round((e.loaded * 100) / e.total);
                }.bind(this_arg)
            };
            return axios.post(get_url_files(), formData, config);
        },
    },
})

export { my_store }
