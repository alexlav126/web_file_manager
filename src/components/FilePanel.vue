<template>
<div
    v-on:click="$emit('activated')"
    v-bind:class="{ 'active-file-panel': panel.is_active }"
>
    <button v-on:click="select_all_files(true)">Select all</button>
    <button v-on:click="select_all_files(false)">Unselect all</button>
    <p>{{ panel.path }}</p>
    <FileItem
        v-for="file in panel.file_array"
        v-bind:file="file"
        v-on:change_selected="on_change_selected"
        v-bind:key="file.name"
    ></FileItem>
</div>
</template>

<script>
import FileItem from './FileItem.vue'

export default {
    name: 'FilePanel',
    components: {
        FileItem
    },
    props: { // types: String, Number, Boolean, Array, Object, Function, Promise
        panel: {
            is_active: Boolean,
            path: String,
            file_array: Array,
        }
    },
    /*
    data: function() {
        return {
            files: this.file_array
        }
    },
    */
    mounted: function() {
        /*
        this.files = [
            { name: 'dir1', is_folder: true, href: 'link1', selected: true},
            { name: 'file1', is_folder: false, href: 'link2', selected: false },
        ]
        */
        // this.open_folder('/');
        // this.path = "/path1";
    },
    methods: {
        select_all_files: function(selected) {
            for (let f in this.panel.file_array) {
                this.panel.file_array[f].selected = selected;
            }
        },
        on_change_selected: function(name) {
            for(let f in this.panel.file_array) {
                if(this.panel.file_array[f].name === name) {
                    this.panel.file_array[f].selected = !this.panel.file_array[f].selected;
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
