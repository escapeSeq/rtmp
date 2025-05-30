# RTMP → HLS Relay (Node-Media-Server)

This project is a tiny self-contained media relay that

* receives an **RTMP** stream on port **1935**
* converts it to **HLS** on-the-fly
* serves the HLS playlist and segments over HTTP on port **8080**

Everything runs in a single Docker container powered by  
[Node-Media-Server](https://github.com/illuspas/Node-Media-Server) and **FFmpeg**.  
No Nginx or external services are required.

---

## Quick start

The container exposes:

* **1935/tcp** – RTMP ingest
* **8080/tcp** – HTTP server that serves HLS (`.m3u8` + `.ts`)

---

## Publishing a stream

The default application name is `live`.

Example with FFmpeg from your host machine:

```bash
ffmpeg -re -i sample.mp4 -c:v copy -c:a aac -f flv \
       rtmp://localhost:1935/live/mystream
```

You can also publish from OBS, vMix, etc.  
RTMP URL format:

```
rtmp://<SERVER_IP>:1935/live/<STREAM_KEY>
```

---

## Playing the HLS output

Once the RTMP stream is flowing, the corresponding HLS playlist will be available at

```
http://<SERVER_IP>:8080/live/<STREAM_KEY>/index.m3u8
```

Open that URL in:

* VLC (`⌘N` / `Ctrl + N` → paste URL)
* a video.js / hls.js player on a web page
* Safari / iOS (native HLS support)

---

## Project structure

```
.
├─ docker-compose.yml   # defines the "media-server" service
├─ Dockerfile           # builds the container (Node + FFmpeg)
├─ package.json         # Node-Media-Server dependency
├─ index.js             # actual NMS configuration
└─ media/               # (created at runtime) holds HLS segments/playlists
```

`media/` is volume-mounted so segments survive container restarts.

---

## Configuration

* **Ports**: change the `ports:` mapping in `docker-compose.yml`.
* **Transcoding settings**: edit the `trans` block in `index.js`.
* **Logging level**: tweak `logType` (0 = all logs, 4 = none).

After any change to `index.js` or the Dockerfile, rebuild:

```bash
docker compose build
docker compose up -d
```

---

## Troubleshooting

1. **No HLS playlist shows up**

   • Make sure FFmpeg is installed inside the image (see `Dockerfile`).  
   • Verify you are pushing to the correct RTMP URL.  
   • Check container logs: `docker compose logs -f`.

2. **Video stutters or lags**

   • Decrease `hls_time` (segment length) in the `hlsFlags`.  
   • Ensure your upload bandwidth is sufficient.

3. **Cross-origin issues**

   The HTTP section sets `allow_origin: '*'`. Adjust if you need stricter CORS.

---

## License

MIT – do whatever you want, no warranties.
