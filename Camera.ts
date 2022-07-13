type MediaConstraintsProps = {
  video: VideoConstraintsProps;
  audio: boolean;
};

type VideoConstraintsProps = {
  facingMode: string;
  width?: ResolutionRequestProps;
  height?: ResolutionRequestProps;
};

type ResolutionRequestProps = {
  min?: number;
  max?: number;
  ideal?: number;
};

export default class Camera {
  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  customConstraint: MediaConstraintsProps = {} as MediaConstraintsProps;
  devices: Array<unknown> = [];
  stream: MediaStream = {} as MediaStream;

  public constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
  }

  /* --------------------------- Default Constraint --------------------------- */
  DEFAULT_CONSTRAINT: MediaConstraintsProps = {
    video: {
      facingMode: "user",
    },
    audio: false,
  };

  // Constraints
  constraint(): MediaConstraintsProps {
    if (Object.keys(this.customConstraint).length === 0) {
      return this.DEFAULT_CONSTRAINT;
    } else {
      return this.customConstraint;
    }
  }

  public setConstraint(constraint: MediaConstraintsProps): Camera {
    this.customConstraint = constraint;
    return this;
  }

  public mirror(): void {
    this.video.style.transform = "scaleX(-1)";
  }

  public start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.getDevices().then(() => {
          navigator.mediaDevices.getUserMedia(this.constraint()).then((stream) => {
            this.video.srcObject = stream;
            this.stream = stream;
          });
        });
        resolve();
      } catch (error) {
        console.error("StartAsync", error);
        reject(error);
      }
    });
  }

  getDevices(): Promise<Array<unknown>> {
    return new Promise((resolve, reject) => {
      if (this.devices.length > 0) {
        resolve(this.devices);
        return;
      }
      try {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          devices.forEach((device) => {
            if (device.kind && device.kind.toLocaleLowerCase() === "videoinput")
              this.devices.push(device);
          });
        });
        resolve(this.devices);
      } catch (error) {
        console.error("GetDevices", error);
        reject(error);
      }
    });
  }

  public requestPermission(): Promise<Camera> {
    return new Promise<Camera>((resolve, reject) => {
      try {
        navigator.mediaDevices.getUserMedia(this.constraint()).then(() => {
          resolve(this);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

/////////////////////////////////

<template>
  <div>
    <video ref="videoRef" autoplay playsinline></video>
    <canvas ref="canvasRef"></canvas>
    <button @click="startCamera">start</button>
    <button @click="mirror">mirror</button>
    <button @click="flip">flip</button>
    <button @click="snapB64">Snap b64</button>
    <button @click="snapBlob">Snap blob</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import VxCamera from "@/functions/Camera/VxCamera";

export default defineComponent({
  setup() {
    const videoRef = ref<HTMLVideoElement>();
    const canvasRef = ref<HTMLCanvasElement>();
    const camera = ref<VxCamera | void>();
    const isMirror = ref(false);

    onMounted(async () => {
      camera.value = await new VxCamera(videoRef.value!, canvasRef.value!)
        .setConstraint({
          video: {
            facingMode: "environment",
          },
          audio: false,
        })
        .requestPermission()
        .then((camera) => camera)
        .catch((err) => {
          console.log(err);
        });
    });

    const startCamera = () => {
      camera.value?.start();
    };

    const mirror = () => {
      isMirror.value = !isMirror.value;
      camera.value?.mirror(isMirror.value);
    };

    const flip = () => {
      camera.value?.flipCamera();
    };

    const snapBlob = async () => {
      console.log("Test.vue | snapBlob", await camera.value?.snapAsBlob().then((data) => data));
    };

    const snapB64 = async () => {
      console.log("Test.vue | snapB64", await camera.value?.snapAsBase64().then((data) => data));
    };

    return {
      startCamera,
      videoRef,
      canvasRef,
      mirror,
      flip,
      snapB64,
      snapBlob,
    };
  },
});
</script>
