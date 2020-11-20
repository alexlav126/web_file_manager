<template>
<div>
    <div class="file-panel-table">
        <div class="panel">
            <h1>Left</h1>
            <FilePanel
                v-on:activated="activate_lhs_panel"
                v-bind:panel="panel_lhs"/>
        </div>
        <div class="panel">
            <h1>Right</h1>
            <FilePanel
                v-on:activated="activate_rhs_panel"
                v-bind:panel="panel_rhs"/>
        </div>
    </div>
    
    <div class="commands">
        <button v-on:click="button_click">copy</button>
        <button v-on:click="button_click">move</button>
        <button v-on:click="button_click">remove</button>
        <br>
        <input type="text" v-model="new_folder_name">
        <button v-on:click="button_click">new folder</button>
        <br>
        <button v-on:click="button_click">upload</button>
        <button v-on:click="button_click">download</button>
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
    data: function() { // types: String, Number, Boolean, Array, Object, Function, Promise
        return {
            panel_lhs: {
                is_active: true,
                path: null,
                file_array: null,
            },
            panel_rhs: {
                is_active: false,
                path: null,
                file_array: null,
            },
            new_folder_name: 'new folder',
        }
    },
    mounted: function() {
        this.panel_lhs.path = 'path1';
        this.panel_lhs.file_array = [
            { name: 'dir1', is_folder: true, href: 'link1', selected: false},
            { name: 'dir2', is_folder: true, href: 'link2', selected: false},
            { name: 'file1', is_folder: false, href: 'link3', selected: false},
        ];

        this.panel_rhs.path = 'path2';
        this.panel_rhs.file_array = [
            { name: 'dir11', is_folder: true, href: 'link11', selected: false},
            { name: 'dir22', is_folder: true, href: 'link22', selected: false},
            { name: 'file11', is_folder: false, href: 'link33', selected: false},
        ];
    },
    methods: {
        activate_lhs_panel: function() {
            this.panel_lhs.is_active = true;
            this.panel_rhs.is_active = false;
        },

        activate_rhs_panel: function() {
            this.panel_lhs.is_active = false;
            this.panel_rhs.is_active = true;
        },
        button_click: function() {
            console.log('button_click()');
            /*
            if(this.file.type === 'file') {
                window.open(this.file.href, "_blank"); 
            } else {
                this.$emit('folder-clicked', this.file.href);
            }
            */
        }
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
</style>
