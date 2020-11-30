<template>
<div
    v-on:click="activate"
    v-bind:class="{ 'active-file-panel': is_active }"
>
    <button v-on:click="select_all_files(true)">Select all</button>
    <button v-on:click="select_all_files(false)">Unselect all</button>
    <p>{{ path }}</p>
    <FileItem
        v-for="file in files"
        v-bind:file="file"
        v-on:change_selected="on_change_selected"
        v-on:folder-clicked="open_folder"
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
        is_lhs: Boolean,
    },

    computed: {
        is_active: function() {
            if(this.is_lhs) {
                return this.$store.state.is_active_panel_lhs;
            } else {
                return !this.$store.state.is_active_panel_lhs;
            }
        },

        path: function() {
            if(this.is_lhs) {
                return this.$store.state.panel_lhs.path;
            } else {
                return this.$store.state.panel_rhs.path;
            }
        },

        files: function() {
            if(this.is_lhs) {
                return this.$store.state.panel_lhs.files;
            } else {
                return this.$store.state.panel_rhs.files;
            }
        },
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
        activate: function() {
            this.$store.commit('activate_panel', {is_lhs: this.is_lhs});
        },
       
        open_folder: function(path) {
            let lhs_path = this.$route.query.lhs;
            let rhs_path = this.$route.query.rhs;
            if (lhs_path === undefined) lhs_path = '/';
            if (rhs_path === undefined) rhs_path = '/';
            if(this.is_lhs) {
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
            let path;
            if(this.is_lhs) {
                path = this.$route.query.lhs;
            } else {
                path = this.$route.query.rhs;
            }
            if (path === undefined) path = '/';

            this.$store.dispatch('read_folder', {
                is_lhs: this.is_lhs,
                path: path
            });
        },

        select_all_files: function(selected) {
            this.$store.commit('select_all_files_in_panel', {
                is_lhs: this.is_lhs,
                selected: selected
            });
        },
        
        on_change_selected: function(name) {
            this.$store.commit('toogle_file_selected', {
                is_lhs: this.is_lhs,
                name: name
            });
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
