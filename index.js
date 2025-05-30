const version = '1.0.0'; // Define version if it's not imported

const NodeMediaServer = require('node-media-server');

const config = {
  logType: 3,                    // only errors & warnings
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

const nms = new NodeMediaServer(config);
nms.run(); 