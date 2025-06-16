const version = '1.0.0'; // Define version if it's not imported

const NodeMediaServer = require('node-media-server');

const config = {
  logType: 3,                    // Set to debug level to help diagnose issues
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },

  // HTTP server that will actually deliver the .m3u8 / .ts files
  http: {
    port: 8080,
    allow_origin: '*',
    mediaroot: './media'         // must match the volume in docker-compose
  },

  // Transcoding task — turn every RTMP stream into HLS
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',   // path inside the Docker image
    tasks: [
      {
        app: 'live',             // rtmp://HOST:1935/live/STREAM_KEY
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=6:hls_flags=delete_segments]'
      }
    ]
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

// Export version and server instance if needed
module.exports = {
  version,
  nms
}; 