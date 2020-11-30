import Vue from 'vue'
import Vuex from 'vuex'
import { url_files } from './url.js'
import {
    get_request_data_read_folder,
    send_post_request
} from './server_requests.js'


Vue.use(Vuex)


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
        is_active_panel_lhs: true,
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
    
    mutations: {
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

            const url = url_files;
            
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
        read_folder(context, {is_lhs, path}) {
            if (path === undefined) path = '/';
            let request_data = get_request_data_read_folder(path);
            let response = send_post_request(request_data);
            response.then((resp_value) => {
                context.commit('update_panel', {
                    is_lhs: is_lhs,
                    response: resp_value
                });
            });
        }
    },
})

export { my_store }
