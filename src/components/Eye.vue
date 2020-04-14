<template>
    <div class="w-6 rounded-full bg-black transform -translate-y-1/2 duration-100" :style="comp_height"></div>
</template>

<script>
export default {
    name: 'Eye',
    props: {
        value: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            data_timeout: null,
            data_value: this.value
        }
    },
    computed: {
        comp_height() {
            return { height: `${this.data_value.height}px` }
        }
    },
    watch: {
        value(newValue) {
            if (this.data_timeout) return;
            this.data_timeout = setTimeout(() => {
                this.data_value = {
                    height: newValue.height < 8 ? 5 : Math.round(newValue.height/3) * 10,
                }
                this.data_timeout = null;
            }, 30)
        }
    }
}
</script>