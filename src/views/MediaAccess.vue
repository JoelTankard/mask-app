<template>
  <div class="media-access">
      <div class="absolute inset-0 flex justify-center items-center">
        <p v-if="data_loading">checking media...</p>
        <div v-else class="max-w-sm text-center">
          <h1 class="mb-4 text-inter-5xl">This app needs access to the following:</h1>
          <div class="text-left inline-block my-4">
            <m-toggle v-model="data_cameraOn" @input="func_onCameraRequest" :disable="!comp_cameraIsActive">Camera</m-toggle>
            <m-toggle v-model="data_microphoneOn"  @input="func_onMicrophoneRequest" :disable="!comp_microphoneIsActive">Microphone</m-toggle>
          </div>
         
          <p class="mb-6"><small>
            <template v-if="!comp_cameraIsActive && !comp_microphoneIsActive">Both the camera and microphone have</template>
            <template v-else-if="!comp_cameraIsActive || !comp_microphoneIsActive">The {{ !comp_cameraIsActive ? 'camera' : 'microphone' }} has</template>
            been denied access. Enable in System preferences to continue
          </small></p>
          <m-button :disable="!comp_cameraIsActive || !comp_microphoneIsActive" @click="func_onSubmit">Continue</m-button>
        </div>
      </div>
   
  </div>
</template>

<script>
import mToggle from '@/elements/Toggle';
import mButton from '@/elements/Button';

export default {
  name: 'MediaAccess',
  components: {
    mToggle,
    mButton
  },
  data() {
    return {
      data_loading: true,

      data_camera: null,
      data_microphone: null,

      data_cameraOn: false,
      data_microphoneOn: false
    }
  },
  methods: {
    func_onCameraRequest() {
      if (this.data_cameraOn) return this.data_cameraOn = false;
      this.$electron.ipcRenderer.send('window-ask-media-access', 'camera');
    },
    func_onMicrophoneRequest() {
      if (this.data_microphoneOn) return this.data_microphoneOn = false;
      this.$electron.ipcRenderer.send('window-ask-media-access', 'microphone');
    },
    func_onSubmit() {
      this.$electron.ipcRenderer.send('window-confirm-media-access', 'success');
      this.$router.push('/face');
    }
  },
  computed: {
    comp_cameraIsActive() {
      return this.data_camera !== 'denied'
    },
    comp_microphoneIsActive() {
      return this.data_microphone !== 'denied'
    }
  },
  created() {
     this.$electron.ipcRenderer.on('window-media-access', (event, data) => {       
       const { camera, microphone } = data;
       this.data_cameraOn = camera === 'granted';
       this.data_microphoneOn = microphone === 'granted';

       if (this.data_cameraOn && this.data_microphoneOn) return this.$router.push('/face');
       this.data_loading = false;

      this.data_camera = camera;
      this.data_microphone = microphone;

     })
  }
}
</script>
