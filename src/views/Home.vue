<template>
  <div class="home flex justify-center items-center h-screen">
    <template v-if="data_ready">
      <Face :positions="data_positions"/>
    </template>
    <p v-else>Finding your face...</p>
  </div>
</template>

<script>
// @ is an alias to /src
import Face from '@/components/Face.vue'

export default {
  name: 'Home',
  components: {
    Face
  },
  data() {
    return {
      data_ready: false,
      data_mood: '',
      data_positions: {}
    }
  },
  mounted() {
     this.$electron.ipcRenderer.on('main', (event, data) => {
       if(typeof data.command === 'undefined') {
        console.error('IPC message is missing command string');
      } else if(data.command === 'ready') {
        this.data_ready = true;
      } else if(data.command === 'features') {
        this.data_positions = data.payload
      }
    })
  }
}
</script>
