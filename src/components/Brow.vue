<template>
    <div class="-m-8 w-24 h-6 rounded-full bg-black duration-100" :style="comp_position"></div>
</template>

<script>
export default {
    name: 'Brow',
    props: {
        value: {
            type: Object,
            required: true
        },
        flip: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            data_timeout: null,
            data_value: this.value
        }
    },
    computed: {
        comp_position() {
            return { transform: `translateY(-${this.data_value.height}px)  rotateZ(${ this.flip ? '-' : ''}${this.data_value.angle}deg)` }
        }
    },
    watch: {
        value(newValue) {
            if (this.data_timeout) return;
            this.data_timeout = setTimeout(() => {
                this.data_value = {
                    height: Math.round(newValue.height/10) * 15,
                    angle: (Math.round(newValue.angle/1.3) * 10) + 5
                }
                this.data_timeout = null;
            }, 30)
        }
    }
}
</script>