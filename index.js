const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    ssl: {
      key: process.env.SSL_KEY_PATH || '/etc/ssl/key.pem',
      cert: process.env.SSL_CERT_PATH || '/etc/ssl/cert.pem'
    }
  },
  http: {
    port: 8080,
    allow_origin: '*',
    mediaroot: '/tmp/media',
    webroot: '/app/public',
    api: true
  },
  auth: {
    api: false,
    play: false,
    publish: false
  },
  logType: 3
};

// Create server instance
const nms = new NodeMediaServer(config);

// Track active streams
const activeStreams = new Map();

// Helper function to log stream details
function logStreamDetails(prefix = '') {
  console.log(`${prefix}Active streams:`, Array.from(activeStreams.keys()));
  if (activeStreams.size > 0) {
    console.log('Stream details:');
    activeStreams.forEach((value, key) => {
      console.log(`- ${key}:`, value);
    });
  }
}

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  logStreamDetails('preConnect: ');
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
  logStreamDetails('postConnect: ');
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
  logStreamDetails('doneConnect: ');
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] New stream publishing attempt: ${StreamPath}`);
  activeStreams.set(StreamPath, {
    id,
    args,
    startTime: new Date(),
    type: 'publisher'
  });
  logStreamDetails('prePublish: ');
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream successfully published: ${StreamPath}`);
  if (activeStreams.has(StreamPath)) {
    const streamInfo = activeStreams.get(StreamPath);
    streamInfo.status = 'active';
    activeStreams.set(StreamPath, streamInfo);
  }
  logStreamDetails('postPublish: ');
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream stopped publishing: ${StreamPath}`);
  activeStreams.delete(StreamPath);
  logStreamDetails('donePublish: ');
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Play attempt for stream: ${StreamPath}`);
  console.log(`[Stream Info] Stream exists: ${activeStreams.has(StreamPath)}`);
  if (activeStreams.has(StreamPath)) {
    const streamInfo = activeStreams.get(StreamPath);
    if (!streamInfo.viewers) streamInfo.viewers = new Set();
    streamInfo.viewers.add(id);
    activeStreams.set(StreamPath, streamInfo);
  }
  logStreamDetails('prePlay: ');
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream playback started: ${StreamPath}`);
  logStreamDetails('postPlay: ');
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  if (activeStreams.has(StreamPath)) {
    const streamInfo = activeStreams.get(StreamPath);
    if (streamInfo.viewers) {
      streamInfo.viewers.delete(id);
      activeStreams.set(StreamPath, streamInfo);
    }
  }
  logStreamDetails('donePlay: ');
});

// Start the server
nms.run();

// Log initial configuration
console.log('Server started with configuration:', JSON.stringify(config, null, 2));
console.log('Waiting for streams...');

// Periodically log stream status
setInterval(() => {
  logStreamDetails('Status update: ');
}, 30000); 