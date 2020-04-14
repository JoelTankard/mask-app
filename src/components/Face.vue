<template>
  <div class="face">
    <template v-if="positions">
      <div class="view absolute inset-0 flex items-center justify-center">
          <div class="absolute">
            <div class="face-wrapper w-64 mt-20">
              <div class="-mt-2">
                <brow class="absolute left-0 -mt-16" v-if="positions.leftEyeBrowSpace" :value="positions.leftEyeBrowSpace" flip />
                <brow class="absolute right-0 -mt-16" v-if="positions.rightEyeBrowSpace" :value="positions.rightEyeBrowSpace"/>
                <eye class="absolute left-0" v-if="positions.leftEye" :value="positions.leftEye" />
                <eye class="absolute right-0" v-if="positions.rightEye" :value="positions.rightEye" />
              </div>
             
               <nose />
            </div>
          </div>
      </div>
        
    </template>
    
  </div>
</template>

<script>
import Eye from '@/components/Eye';
import Brow from '@/components/Brow';
import Nose from '@/components/Nose';

export default {
  name: 'Face',
  props: {
    mood: {
      type: String,
      default: ''
    },
    positions: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    Eye,
    Brow,
    Nose
  },
  data() {
    return {
      data_expression: null
    }
  },
  methods: {
    func_startVideo() {
      console.log(navigator)
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
          console.log(stream)
          //this.$refs.cam.srcObject = stream;
        })
    }
  }
}
</script>

<style scoped>
.view {
    transform: scaleX(-1);
}
.fast-transition {
    transition: .1s ease-out transform;
}
</style>