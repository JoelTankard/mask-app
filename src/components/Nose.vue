<template>
    <div class="flex justify-center">
        <svg :height="data_height + (data_stroke*2)" :width="data_width + (data_stroke*2)" stroke="black" stroke-width="10" stroke-linejoin="round">
            <path :transform="`translate(${data_stroke} ${data_stroke})`" :d="comp_path" />
        </svg>
    </div>
</template>

<script>
export default {
    name: 'Nose',
    data() {
        return {
            data_stroke: 10,
            data_height: 60,
            data_width: 30
        }
    },
    computed: {
        comp_path() {
            return `M ${this.data_width/2} 0 ${this.data_width} ${this.data_height} 0 ${this.data_height} Z`
        }
    }
}
</script>