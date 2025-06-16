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
    mediaroot: '/tmp/media'  // Using temporary directory instead of persistent volume
  }
};

// Create server instance
const nms = new NodeMediaServer(config);

// Add event handlers for better error tracking
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// Start the server
nms.run(); 