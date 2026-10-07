// 後台影片工具（壓縮 + 上傳）的原始碼。
// 修改後執行 `npm run build:video-lib` 重新產生 admin/vendor/video-lib.js。
import { uploadPresigned } from '@vercel/blob/client';
import {
  Input, Output, Conversion, ALL_FORMATS, BlobSource, BufferTarget, Mp4OutputFormat, canEncodeAudio
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';

// 壓縮目標：短邊最多 1080px（直式短影音即 1080×1920），H.264 + AAC 的 MP4。
// 位元率依輸出解析度分級，兼顧清晰度與檔案大小（1080p 約 26MB/分鐘）。
var MAX_SHORT_SIDE = 1080;
var AUDIO_BITRATE = 128000;
var MAX_FPS = 30;
var aacChecked = false;

function videoBitrateFor(shortSide) {
  if (shortSide > 720) return 3500000;
  if (shortSide > 480) return 2200000;
  return 1200000;
}

function even(n) { return Math.max(2, Math.round(n / 2) * 2); }

// 回傳 { blob, width, height, duration, compressed, originalSize }
async function compressVideo(file, onProgress) {
  var input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  var videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) throw new Error('這個檔案裡找不到影片畫面');
  var audioTrack = await input.getPrimaryAudioTrack();

  var srcW = videoTrack.displayWidth, srcH = videoTrack.displayHeight;
  var duration = await input.computeDuration();
  var scale = Math.min(1, MAX_SHORT_SIDE / Math.min(srcW, srcH));
  var outW = even(srcW * scale), outH = even(srcH * scale);
  var videoBitrate = videoBitrateFor(Math.min(outW, outH));
  var info = { width: outW, height: outH, duration: duration, originalSize: file.size };

  // 原檔已經是瀏覽器都能播的 H.264/AAC MP4，且大小已在目標範圍內 → 不重新壓縮，避免畫質白白損失
  var isMp4 = /mp4/i.test(file.type) || /\.(mp4|m4v)$/i.test(file.name);
  var srcBitrate = duration > 0 ? file.size * 8 / duration : Infinity;
  var webSafe = isMp4 && videoTrack.codec === 'avc' && (!audioTrack || audioTrack.codec === 'aac');
  if (webSafe && scale === 1 && srcBitrate <= (videoBitrate + AUDIO_BITRATE) * 1.25) {
    return Object.assign(info, { blob: file, compressed: false });
  }

  // 部分瀏覽器（如 Firefox）沒有內建 AAC 編碼器，補上軟體編碼器，避免影片變成沒聲音
  if (audioTrack && !aacChecked) {
    aacChecked = true;
    if (!(await canEncodeAudio('aac'))) registerAacEncoder();
  }

  var stats = await videoTrack.computePacketStats(120);
  var output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  var videoOpts = { codec: 'avc', width: outW, height: outH, fit: 'contain', bitrate: videoBitrate, keyFrameInterval: 2, forceTranscode: true };
  if (stats.averagePacketRate > MAX_FPS + 2) videoOpts.frameRate = MAX_FPS;

  var conversion = await Conversion.init({
    input: input,
    output: output,
    tracks: 'primary',
    video: videoOpts,
    audio: { codec: 'aac', bitrate: AUDIO_BITRATE }
  });
  var videoKept = conversion.utilizedTracks.some(function (t) { return t === videoTrack; });
  var audioKept = !audioTrack || conversion.utilizedTracks.some(function (t) { return t === audioTrack; });
  if (!conversion.isValid || !videoKept || !audioKept) {
    var err = new Error('這台電腦的瀏覽器無法轉換此影片格式');
    err.code = 'UNSUPPORTED';
    err.webSafe = webSafe;
    throw err;
  }
  if (onProgress) conversion.onProgress = function (p) { onProgress(p); };
  await conversion.execute();

  var blob = new Blob([output.target.buffer], { type: 'video/mp4' });
  // 極少數情況壓完反而變大（原檔位元率本來就低）→ 原檔可直接播就用原檔
  if (webSafe && scale === 1 && blob.size >= file.size) {
    return Object.assign(info, { blob: file, compressed: false });
  }
  return Object.assign(info, { blob: blob, compressed: true });
}

// 直接從瀏覽器傳到 Vercel Blob，回傳公開網址
async function uploadVideo(blob, filename, publishKey, onProgress) {
  var result = await uploadPresigned('news-videos/' + filename, blob, {
    access: 'public',
    handleUploadUrl: '/api/video-upload',
    headers: { 'x-publish-key': publishKey },
    contentType: blob.type || 'video/mp4',
    multipart: blob.size > 20 * 1024 * 1024,
    onUploadProgress: function (e) { if (onProgress) onProgress(e.percentage / 100); }
  });
  return result.url;
}

window.IPCCVideoLib = { compressVideo: compressVideo, uploadVideo: uploadVideo };
