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

const videoRef = ref<HTMLVideoElement>();
    const canvasRef = ref<HTMLCanvasElement>();

    onMounted(async () => {
      camera.value = await new VxCamera(videoRef.value!, canvasRef.value!)
        .setConstraint({
          video: {
            facingMode: "user",
            width: {
              ideal: 960,
              min: 960,
              max: 960,
            },
            height: {
              ideal: 720,
              min: 720,
              max: 720,
            },
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
      if (camera.value !== undefined) camera.value.start();
    };
