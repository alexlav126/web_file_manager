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

    computed: {
        panel_lhs: function() {
            return this.$store.state.is_active_panel_lhs;
        },
        panel_rhs: function() {
            return this.$store.state.is_active_panel_rhs;
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
</style>
