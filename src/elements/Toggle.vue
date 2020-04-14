<template>
    <div :class="['mb-4', { 'opacity-50 pointer-events-none' : disable }]">
        <input :id="_uid" class="hidden" type="checkbox" :value="value" @input="func_input" />
        <label :for="_uid" class="flex items-center cursor-pointer">
            <div class="pl-2 relative inline-block w-12 p-1 rounded-full">
                <div class="absolute inset-0 bg-gray-200 rounded-full text-left -mx-1"></div>
                <div :class="['relative w-6 transform duration-200', { 'translate-x-full':  value }]" >
                    <div :class="['h-6 w-6 rounded-full bg-white shadow-lg -ml-2 duration-200', { 'bg-green-400' : value }]"></div>
                </div>
            </div>
            <p class="inline-block ml-4"><slot/></p>
        </label> 
    </div>
</template>

<script>
export default {
    name: 'toggle',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        disable: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        func_input() {
            if (this.disable) return;
            this.$emit('input', !this.value)
        }
    }
}
</script>