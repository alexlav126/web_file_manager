<template>
<div
    v-on:click="$emit('activated')"
    v-bind:class="{ 'active-file-panel': panel.is_active }"
>
    <button v-on:click="select_all_files(true)">Select all</button>
    <button v-on:click="select_all_files(false)">Unselect all</button>
    <p>{{ path }}</p>
    <FileItem
        v-for="file in file_array"
        v-bind:file="file"
        v-on:change_selected="on_change_selected"
        v-on:folder-clicked="open_folder"
        v-bind:key="file.name"
    ></FileItem>
</div>
</template>

<script>
import FileItem from './FileItem.vue'
import { get_request_data_read_folder, send_post_request } from '../server_requests.js'

export default {
    name: 'FilePanel',
    components: {
        FileItem
    },
    props: { // types: String, Number, Boolean, Array, Object, Function, Promise
        panel: {
            is_active: Boolean,
            is_lhs: Boolean,
        }
    },
    
    data: function() {
        return {
            path: '/',
            file_array: [],
        }
    },
    
    mounted: function() {
        this.read_this_folder();
    },
    watch: {
        $route(/*to, from*/) {
            this.read_this_folder();
        }
    },
    methods: {
        open_folder: function(path) {
            let lhs_path = this.$route.query.lhs;
            let rhs_path = this.$route.query.rhs;
            if (lhs_path === undefined) lhs_path = '/';
            if (rhs_path === undefined) rhs_path = '/';
            if(this.panel.is_lhs) {
                lhs_path = path;
            } else {
                rhs_path = path;
            }
            const query = {
                lhs: lhs_path,
                rhs: rhs_path
            };

            let new_route = { name: 'file_manager', query: query }
            if(this.$route.name === new_route.name) {
                if ((this.$route.query.lhs === query.lhs) &&
                    (this.$route.query.rhs === query.rhs)) {
                    return;
                }
            }
            this.$router.push(new_route).catch(()=>{});
        },

        read_this_folder: function() {
            let path = '/';
            if(this.panel.is_lhs) {
                path = this.$route.query.lhs;
            } else {
                path = this.$route.query.rhs;
            }
            let request_data = get_request_data_read_folder(path);
            let response = send_post_request(request_data);
            response.then((resp_value) => {
                this.update_panel(resp_value);
            });
        },

        update_panel: function(response) {
            if(response.status != 'ok') return;
            let path = response.path;

            // remove last '/'
            let ind = path.lastIndexOf('/');
            if((path.length > 1) && (path.length == ind + 1)) {
                path = path.substring(0, ind);
            }
            this.path = path;
            
            ind = path.lastIndexOf('/');
            let path_back;
            if(ind == 0) {
                path_back = '/';
            } else {
                path_back = path.substring(0, ind);
            }

            let new_file_array = [];
            new_file_array.push(this.create_item_obj('..', true, path_back));
            if(path === '/') path = '';
            
            for(let folder in response.folders) {
                const name = response.folders[folder];
                const href = path + '/' + name;
                const item = this.create_item_obj(name, true, href);
                new_file_array.push(item);
            }

            const url = window.location.origin + window.location.pathname;
            
            for(let file in response.files) {
                const name = response.files[file];
                const href = url + '?file=' + name;
                const item = this.create_item_obj(name, false, href);
                new_file_array.push(item);
            }
            this.file_array = new_file_array;
        },

        create_item_obj: function(name, is_folder, href) {
            return {
                is_folder: is_folder,
                name: name,
                href: href,
                selected: false
            }
        },
        
        select_all_files: function(selected) {
            for (let f in this.file_array) {
                this.file_array[f].selected = selected;
            }
        },
        on_change_selected: function(name) {
            for(let f in this.panel.file_array) {
                if(this.file_array[f].name === name) {
                    this.file_array[f].selected = !this.file_array[f].selected;
                }
            }
        },
    },
};
</script> 

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active-file-panel {
    background-color: Teal;
}
</style>
