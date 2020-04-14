<template>
    <button :class="['py-2 px-6 rounded', `${ disable ? 'pointer-events-none bg-gray-300 text-gray-500' : 'bg-blue-400 text-white' }`]" @click="func_onClick">
        <slot/>
    </button>
</template>

<script>
export default {
    name: 'button',
    props: {
        disable: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        func_onClick() {
            if (this.disable) return;
            this.$emit('click')
        }
    }
}
</script>