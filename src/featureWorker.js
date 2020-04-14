import FaceApi from '@/utils/faceApi';
const faceLoader = new FaceApi('feature');

const detect = async () => {   
    if (faceLoader.isRunning) window.requestAnimationFrame(detect);
    let positions =  await faceLoader.getPosition();
    if(positions) {
        faceLoader.render(positions)
    }
}


(async () => {
    await faceLoader.init()
    detect();
})()
