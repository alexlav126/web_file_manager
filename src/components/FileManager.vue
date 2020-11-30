<template>
<div>
    <div class="file-panel-table">
        <div class="panel">
            <h1>Left</h1>
            <FilePanel v-bind:is_lhs="true"/>
        </div>
        <div class="panel">
            <h1>Right</h1>
            <FilePanel v-bind:is_lhs="false"/>
        </div>
    </div>
    
    <div class="commands">
        <button v-on:click="copy_files">copy</button>
        <button v-on:click="move_files">move</button>
        <button v-on:click="remove_files">remove</button>
        <br>
        <input type="text" v-model="new_folder_name">
        <button v-on:click="create_folder">new folder</button>
        <br>
        <button v-on:click="button_click">upload</button>
        <button v-on:click="button_click">download</button>
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
        panel_lhs: function() {
            return this.$store.state.is_active_panel_lhs;
        },
        panel_rhs: function() {
            return this.$store.state.is_active_panel_rhs;
        },
        status_str: function() {
            return this.$store.state.status_string;
        },
    },
    
    data: function() {
        return {
            new_folder_name: 'new folder',
        }
    },
    
    mounted: function() {
        //
    },
    methods: {
        get_selected_file_names: function() {
            let files;
            if(this.$store.state.is_active_panel_lhs) {
                files = this.$store.getters.lhs_selected_file_names;
            } else {
                files = this.$store.getters.rhs_selected_file_names;
            }
            return files;
        },
        
        create_folder: function() {
            let path;
            if(this.$store.state.is_active_panel_lhs) {
                path = this.$store.state.panel_lhs.path;
            } else {
                path = this.$store.state.panel_rhs.path;
            }
            if(path != '/') path += '/';
            path += this.new_folder_name;
            let p = this.$store.dispatch('create_folder', { path: path });
            p.then(() => {
                const is_lhs = this.$store.state.is_active_panel_lhs;
                const path =
                    is_lhs ?
                    this.$store.state.panel_lhs.path :
                    this.$store.state.panel_rhs.path;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: path
                });
            })
        },
        
        remove_files: function() {
            const files = this.get_selected_file_names();
            let p = this.$store.dispatch('remove_files', { files: files });
            p.then(() => {
                const is_lhs = this.$store.state.is_active_panel_lhs;
                const path =
                    is_lhs ?
                    this.$store.state.panel_lhs.path :
                    this.$store.state.panel_rhs.path;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: path
                });
            })
        },

        copy_files: function() {
            const files = this.get_selected_file_names();
            const dst_path =
                this.$store.state.is_active_panel_lhs ?
                this.$store.state.panel_rhs.path :
                this.$store.state.panel_lhs.path;
            let p = this.$store.dispatch('copy_files', {
                files: files,
                dst_path: dst_path
            });
            p.then(() => {
                const is_lhs = !this.$store.state.is_active_panel_lhs;
                this.$store.dispatch('read_folder', {
                    is_lhs: is_lhs,
                    path: dst_path
                });
            })
        },

        move_files: function() {
            const files = this.get_selected_file_names();
            const dst_path =
                this.$store.state.is_active_panel_lhs ?
                this.$store.state.panel_rhs.path :
                this.$store.state.panel_lhs.path;
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
    width: 50%
}
.status-string {
    background-color: gray;
}
</style>
