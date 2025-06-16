const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  rtmps: {
    port: 1936,  // Standard RTMPS port
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    // The SSL certificates would be provided by Fly.io's proxy
    // but the server needs to be configured to expect them
    ssl: {
      port: 1936,
      key: process.env.SSL_KEY_PATH || '/etc/ssl/key.pem',
      cert: process.env.SSL_CERT_PATH || '/etc/ssl/cert.pem'
    }
  },
  http: {
    port: 8080,
    allow_origin: '*',
    mediaroot: '/tmp/media',  // Using temporary directory instead of persistent volume
    webroot: '/app/public',   // Serve a simple status page
    api: true                 // Enable API for stream status
  },
  auth: {
    api: false,               // Disable API authentication for now
    play: false,             // No authentication for playing streams
    publish: false           // No authentication for publishing streams
  },
  logType: 3                 // Enable debug logging
};

// Create server instance
const nms = new NodeMediaServer(config);

// Track active streams
const activeStreams = new Set();

// Helper function to log stream details
function logStreamDetails(prefix = '') {
  console.log(`${prefix}Active streams:`, Array.from(activeStreams));
  nms.getStreams().then(streams => {
    console.log(`${prefix}Server streams:`, JSON.stringify(streams, null, 2));
  }).catch(err => {
    console.error(`${prefix}Error getting streams:`, err);
  });
}

// Add event handlers for better error tracking
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
  activeStreams.add(StreamPath);
  logStreamDetails('prePublish: ');
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream successfully published: ${StreamPath}`);
  logStreamDetails('postPublish: ');
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream stopped publishing: ${StreamPath}`);
  activeStreams.delete(StreamPath);
  logStreamDetails('donePublish: ');
});

// Add custom error handling for stream not found
nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Play attempt for stream: ${StreamPath}`);
  console.log(`[Stream Info] Stream exists in activeStreams: ${activeStreams.has(StreamPath)}`);
  logStreamDetails('prePlay: ');
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log(`[Stream Info] Stream playback started: ${StreamPath}`);
  logStreamDetails('postPlay: ');
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