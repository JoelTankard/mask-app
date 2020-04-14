module.exports = {
    pages: {
      index: {
        entry: 'src/main.js', //entry for the public page
        template: 'public/index.html', // source template
        filename: 'index.html' // output as dist/*
      },
      featureWorker: {
        entry: 'src/featureWorker.js',
        template: 'public/featureWorker.html',
        filename: 'featureWorker.html'
      },
      mathWorker: {
        entry: 'src/mathWorker.js',
        template: 'public/mathWorker.html',
        filename: 'mathWorker.html'
      }
    },
    devServer: {
      historyApiFallback: {
        rewrites: [
          { from: /\/index/, to: '/index.html' },
          { from: /\/featureWorker/, to: '/featureWorker.html' },
          { from: /\/mathWorker/, to: '/mathWorker.html' }
        ]
      }
    }
  };