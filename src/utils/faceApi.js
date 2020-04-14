const { ipcRenderer } = require('electron');
const log = require('electron-log');
import * as faceapi from 'face-api.js';
/* global pico */
/* global faceFinder */

const faceapiOptions = new faceapi.TinyFaceDetectorOptions();

faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});


const rgba_to_grayscale = (rgba, nrows, ncols) => {
    let gray = new Uint8Array(nrows*ncols);
    for(let r=0; r<nrows; ++r)
        for(let c=0; c<ncols; ++c)
            // gray = 0.2*red + 0.7*green + 0.1*blue
            gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
    return gray;
}

class FaceApi {
    constructor(type) {
        this.type = type;
        this.cam = null;
        this.canvas = null;
        this.isRunning = true;
        this.isReady = false;
        this.height = 640;
        this.width = 480;

        this.updateMemory = null;

        this.coords = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };

        this.facefinderClassifyRegion = () => -1.0;
    }

    faceDataTypes() {
        const options = {
            expression: {
                load:() => faceapi.loadFaceExpressionModel('./data/weights'),
                detect:() => faceapi.detectSingleFace(this.cam, faceapiOptions).withFaceExpressions()
            },
            feature: {
                load:() => faceapi.loadFaceLandmarkModel('./data/weights'),
                detect:() => faceapi.detectSingleFace(this.cam, faceapiOptions).withFaceLandmarks()
            }
        }
        return options[this.type]
    }

    async loadNet() {
        log.info('- load');
        this.updateMemory = pico.instantiate_detection_memory(5);
        log.info('- init facefinder');
        let detectionNet = faceapi.nets.tinyFaceDetector;
        await detectionNet.load('./data/weights');
        await this.faceDataTypes().load();
        return new Promise((resolve) => {
            faceFinder.find(pico, (res) => {
                this.facefinderClassifyRegion = res
                log.info('- facefinderClassifyRegion loaded');
                resolve();
            });
        })
    }

    initCamera() {
        log.info('- init camera');
        this.cam = document.getElementById('cam');
        this.cam.width = this.width;
        this.cam.height = this.height;

        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.canvasContext = this.canvas.getContext('2d');

        return navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: this.width,
                height: this.height,
            }
        }).then((stream) => {
            log.info('- stream');
            this.cam.srcObject = stream;
            return new Promise((resolve) => {
                this.cam.onloadedmetadata = () => {
                    resolve();
                };
            });
        })
    }

    async init() {
        log.info('- init');
        await new Promise((resolve, reject) => {
            ipcRenderer.on('window-media-access', async (event, access) => {
                log.info('head-tracker - access');
                if (!access) return reject();
                resolve()
            })
        });
        await this.loadNet();
        await this.initCamera();
        this.getStream();
    }

    sendMessage(channel, command, payload) {
        return ipcRenderer.send(channel, { command, payload: payload || {} });
    }
    
    getStream() {
        const ctx = this.canvasContext;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.drawImage(this.cam, 0, 0);
        const rgba = ctx.getImageData(0, 0, 640, 480).data;
        // prepare input to `run_cascade`
        const image = {
            "pixels": rgba_to_grayscale(rgba, 480, 640),
            "nrows": 480,
            "ncols": 640,
            "ldim": 640
        }
        const params = {
            "shiftfactor": 0.1, // move the detection window by 10% of its size
            "minsize": 100,     // minimum size of a face
            "maxsize": 1000,    // maximum size of a face
            "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
        }
        let dets = pico.run_cascade(image, this.facefinderClassifyRegion, params);
        dets = this.updateMemory(dets);
        dets = pico.cluster_detections(dets, 0.2);
        let coords = null;
        for(let i = 0; i < dets.length; ++i) {
            const item = dets[i];
            if(item[3]>50.0)
            {

                const center = [item[1],item[0]];
                const radius = item[2]/2;
                const radiusX = (radius + 40);
                const radiusY = (radius + 100);
                const topLeft = [center[0] - radiusX, (center[1] - radiusY) + 20];
                const bottomRight = [center[0] + radiusX, center[1] + radiusY];
                const [x,y] = topLeft;
                const [x2, y2] = bottomRight;

                coords = {
                    x,
                    y,
                    width: x2 - x,
                    height: y2 - y
                };
            }
        }

        if (!coords) {
            coords = this.coords;
        } else {
            this.coords = coords;
        }
        this.canvasContext.drawImage(this.cam,  coords.x, coords.y, coords.width, coords.height, 0, 0, this.width, this.height);    
    }

    async getPosition() {
        this.getStream();
        const position = await this.faceDataTypes().detect();

        if (position && !this.isReady) {
            this.isReady = true;
            this.sendMessage('main', 'ready')
        }
        return position;
    }

    render(data) {
        this.sendMessage('math', 'positions', data)
    }

    throw(error) {
        this.isRunning = false
        log.error(error)
    }

    kill() {
        this.isRunning = false;
    }
    
}

export default FaceApi