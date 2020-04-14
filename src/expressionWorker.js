import FaceApi from '@/utils/faceApi';
const faceLoader = new FaceApi('expression');

let lastExpression = null;

(async () => {
    await faceLoader.init()
    faceLoader.detect((result) => {
        if (!result) return;

        let currentMood = { mood: 'neutral', score: 0 };
        const keys = Object.keys(result.expressions);

        for (let i = 0; i < keys.length; i++) {
            const mood = keys[i];
            const score = result.expressions[mood];
            if (score > currentMood.score && score > 0.7) currentMood = { mood, score };
        }

        if (lastExpression !== currentMood.mood) {
            lastExpression = currentMood.mood;
            faceLoader.render(currentMood.mood)
        }
    });
})()
