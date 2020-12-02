<template>
<div>
    <input
        type="checkbox"
        v-bind:checked="file.selected"
        v-on:change="$emit('change_selected', file.name)">
        
    <span
        class="file-item"
        v-bind:class="{ 'file-item-selected': file.selected }"
        v-on:click="click"
    >
        <a v-if="!file.is_folder" v-bind:href="file.href" target="_blank">
            [{{ file_type }}]
            {{ file.name }}
        </a>
        <span v-else>
            [{{ file_type }}]
            {{ file.name }}
        </span>
        
    </span>
</div>
</template>

<script>
export default {
    name: 'FileItem',
    props: { // types: String, Number, Boolean, Array, Object, Function, Promise
        file: {
            type: Object,
            required: true,
            
            name: {
                type: String,
                required: true
            },
            is_folder: {
                type: Boolean,
                required: true
            },
            href: {
                type: String,
                required: true
            },
            selected: {
                type: Boolean,
                required: true,
            },
        }
    },
    computed: {
        file_type: function() {
            return this.file.is_folder ? 'folder' : 'file';
        }
    },
    methods: {
        click: function() {
            if(this.file.is_folder) {
                this.$emit('folder-clicked', this.file.href);
            }
        }
    },
};
</script> 

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.file-item:hover {
    background-color: yellow;
}
.file-item-selected {
    background-color: #FF6347;
}
</style>
