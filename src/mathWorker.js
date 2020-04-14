const { ipcRenderer } = require('electron');
import Segments from '@/utils/featureSegments';

ipcRenderer.on('math', (event, { command, payload }) => {
    if (command === 'positions') {
        const positions =  new Segments(payload).get();
        ipcRenderer.send('main', { command: 'features', payload: positions });
        return;
    }
   
})