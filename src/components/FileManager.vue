<template>
<div>
    <div class="file-panel-table">
        <div
            class="panel"
            v-bind:class="{ 'active-panel': is_active_panel_lhs }"
            v-on:click="activate_panel(true)"
        >
            <FilePanel v-bind:is_lhs="true"/>
        </div>
        <div
            class="panel"
            v-bind:class="{ 'active-panel': is_active_panel_rhs }"
            v-on:click="activate_panel(false)"
        >
            <FilePanel v-bind:is_lhs="false"/>
        </div>
    </div>
    
    <div class="commands">
        <button
            v-on:click="copy_files"
            v-bind:disabled="is_no_selected_files"
        >
            Copy
        </button>
        <button
            v-on:click="move_files"
            v-bind:disabled="is_no_selected_files"
        >
            Move
        </button>
        <button
            v-on:click="remove_files"
            v-bind:disabled="is_no_selected_files"
        >
            Remove
        </button>
        
        <br><br>
        
        <input type="text" v-model="new_folder_name">
        <button v-on:click="create_folder">New folder</button>
        <br><br>
        <label>
            File
            <input type="file" id="file" ref="file" v-on:change="upload_file_changed"/>
            <button
                v-on:click="upload_file_action"
                v-bind:disabled="is_no_selected_upload_file"
            >
                Upload
            </button>
        </label>
        <br>
        <progress max="100" :value.prop="upload_percentage"></progress>
    </div>
    <div class="status-string">
        {{ status_str }}
    </div>
</div>
</template>

<script>
import FilePanel from './FilePanel.vue'

export default {
    name: 'FileManager',
    components: {
        FilePanel
    },

    computed: {
        is_active_panel_lhs: function() {
            return this.$store.state.is_active_panel_lhs;
        },
        
        is_active_panel_rhs: function() {
            return !this.$store.state.is_active_panel_lhs;
        },
        
        is_no_selected_files: function() {
            return this.$store.getters.selected_file_names.length == 0;
        },

        is_no_selected_upload_file: function() {
            return this.upload_file === '';
        },
        
        status_str: function() {
            return this.$store.state.status_string;
        },
    },
    
    data: function() {
        return {
            new_folder_name: 'new folder',
            upload_file: '',
            upload_percentage: 0,
        }
    },
    
    mounted: function() {
        //
    },

    methods: {
        activate_panel: function(is_lhs) {
            this.$store.commit('activate_panel', {is_lhs: is_lhs});
        },

        create_folder: function() {
            let path = this.$store.getters.active_panel.path;
            if(path != '/') path += '/';
            path += this.new_folder_name;
            let p = this.$store.dispatch('create_folder', { path: path });
            p.then(() => {
                const is_lhs = this.is_active_panel_lhs;
                const path = this.$store.getters.active_panel.path;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: path
                });
            })
        },
        
        remove_files: function() {
            const files = this.$store.getters.selected_file_names;
            let p = this.$store.dispatch('remove_files', { files: files });
            p.then(() => {
                const is_lhs = this.is_active_panel_lhs;
                const path = this.$store.getters.active_panel.path;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: path
                });
            })
        },

        copy_files: function() {
            const files = this.$store.getters.selected_file_names;
            const dst_path = this.$store.getters.not_active_panel.path;
            let p = this.$store.dispatch('copy_files', {
                files: files,
                dst_path: dst_path
            });
            p.then(() => {
                const is_lhs = this.is_active_panel_rhs;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: dst_path
                });
            })
        },

        move_files: function() {
            const files = this.$store.getters.selected_file_names;
            const dst_path = this.$store.getters.not_active_panel.path;
            let p = this.$store.dispatch('move_files', {
                files: files,
                dst_path: dst_path
            });
            p.then(() => {
                this.$store.dispatch('read_folder', {
                    is_lhs: true,
                    path: this.$store.state.panel_lhs.path
                });
                this.$store.dispatch('read_folder', {
                    is_lhs: false,
                    path: this.$store.state.panel_rhs.path
                });
            })
        },

        upload_file_changed: function() {
            this.upload_file = this.$refs.file.files[0];
        },

        upload_file_action: function() {
            const path = this.$store.getters.active_panel.path;
            this.$store.dispatch('upload_file', {
                file: this.upload_file,
                path: path,
                this_arg: this
            }).then(() => {
                console.log('upload_file_action SUCCESS!!');
                this.upload_percentage = 0;
                const is_lhs = this.$store.state.is_active_panel_lhs;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: path
                });
            })
            .catch(() => {
                console.log('upload_file_action FAILURE!!');
            });
            
            
        },
        
        button_click: function() {
            console.log('button_click()');
        },
    },
};
</script> 

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.file-panel-table {
    display: table;
    width: 100%
}
.panel {
    display: table-cell;
    border: 1px solid black;
    width: 50%;
    text-align: left;
}
.status-string {
    background-color: gray;
}
.active-panel {
    background-color: #DEB887;
}
</style>
