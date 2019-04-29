<template>
  <div id="workspace">
    <div id="workplace">
      <picture-input size="10" v-show="imageData == null" @change="selectImage" ref="imageLoader" button-class="button" width="400" height="400" radius="50"></picture-input>
      <v-stage :config="stageConfig" @wheel="zoom" v-show="imageData != null">
        <v-layer :config="{draggable: true}">
          <v-image :config="imageConfig" ref="image"></v-image>
          <v-line v-for="col in grid.cols" :config="col" :key="col.key"></v-line>
          <v-line v-for="row in grid.rows" :config="row" :key="row.key"></v-line>

          <v-line :config="helper.top"></v-line>
          <v-line :config="helper.bottom"></v-line>
          <v-line :config="helper.left"></v-line>
          <v-line :config="helper.right"></v-line>
        </v-layer>
        <v-layer>
        </v-layer>
      </v-stage>
    </div>
    <div id="infos" v-show="imageData != null && showInfo">
      <div><label>Grid Size</label> {{ gridSize }}</div>
    </div>
  </div>
</template>

<script>
  import PictureInput from 'vue-picture-input'

  export default {
    name: 'Workspace',
    components: {
      PictureInput
    },
    data: function() {
      return {
        gridColor: "#ddd",
        helperColor: "red",
        stageWidth: 100,
        stageHeight: 100,
        imageWidth: 1,
        imageHeight: 1,
        stageScale: 1,
        imageData: null,
        gridSize: 20,
        helperSizeX: 1,
        helperSizeY: 1,
        helperStartX: 0,
        helperStartY: 0,
        showHelper: true,
        grayScale: false,
        altPressed: false,
        shiftPressed: false,
        ctrlPressed: false,
        showGrid: true,
        fliped: false,
        initialized: false,
        showInfo: false
      }
    },
    methods: {
      storeConfig: function() {
        localStorage.clear();

        localStorage.gridSize = this.gridSize;
        localStorage.helperSizeX = this.helperSizeX;
        localStorage.helperSizeY = this.helperSizeY;
        localStorage.helperStartX = this.helperStartX;
        localStorage.helperStartY = this.helperStartY;

        try {
          if(this.imageData) {
            localStorage.imageSrc = this.imageData.src;
          }
        } catch (ex) {
          console.log("Unable to store image");
        }
      },

      toggleGrayScale: function() {
        this.grayScale = !this.grayScale;
      },

      gridPlus: function() {
        this.gridSize ++;
        this.storeConfig();
      },

      gridMinus: function() {
        this.gridSize --;
        this.storeConfig();
      },

      zoom: function(event) {
        this.stageScale += event.evt.deltaY / 1000;
      },

      cleanWorkspace: function() {
        this.imageData = null;
        if(this.$refs.imageLoader) {
          this.$refs.imageLoader.removeImage();
        }
      },

      flipImage: function() {
        if(this.imageData == null) return;

        let canvas = document.createElement('canvas');
        canvas.width = this.imageData.width;
        canvas.height = this.imageData.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(this.imageData, 0, 0, this.imageData.width, this.imageData.height);

        /* Flip */
        ctx.translate(this.imageData.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.imageData, 0, 0);
        this.loadImage(canvas.toDataURL());
        this.fliped = !this.fliped;
      },

      selectImage: function(loadedImage) {
        if(!loadedImage) return;
        localStorage.imageSrc = null;
        this.loadImage(loadedImage);
      },

      loadImage: function(loadedImage) {
        if(!loadedImage) return;

        const image = new window.Image();
        image.src = loadedImage;
        image.onload = () => {
          this.imageData = image;
          this.storeConfig();
          this.imageHeight = this.imageData.height;
          this.imageWidth = this.imageData.width;

          if(!this.initialized) {
            let scaleFactor = 1;
            let scaleFactorW = this.stageConfig.width / this.imageData.width;
            let scaleFactorH = this.stageConfig.height / this.imageData.height;

            this.stageScale = Math.min(scaleFactorW, scaleFactorH);
            this.initialized = true;
          }
        };
      },
    },
    computed: {
      imageConfig: function() {
        let filters = []
        if(this.grayScale) {
          filters.push(Konva.Filters.Grayscale);
        }

        return {
          image: this.imageData,
          filters: filters
        }
      },

      stageConfig: function() {
        return {
          width: this.stageWidth,
          height: this.stageHeight,
          scale: {
            x: this.stageScale,
            y: this.stageScale
          }
        };
      },

      helper: function() {
        return {
          'top': {
            points: [
              Math.round(this.helperStartX * this.gridSize) + 0.5,
              Math.round(this.helperStartY * this.gridSize) + 0.5,
              Math.round((this.helperStartX+this.helperSizeX) * this.gridSize) + 0.5,
              Math.round(this.helperStartY * this.gridSize) + 0.5,
            ],
            stroke: this.helperColor,
            strokeWidth: 1
          },
          'bottom': {
            points: [
              Math.round(this.helperStartX * this.gridSize) + 0.5,
              Math.round((this.helperStartY+this.helperSizeY) * this.gridSize) + 0.5,
              Math.round((this.helperStartX+this.helperSizeX) * this.gridSize) + 0.5,
              Math.round((this.helperStartY+this.helperSizeY) * this.gridSize) + 0.5,
            ],
            stroke: this.helperColor,
            strokeWidth: 1
          },
          'left': {
            points: [
              Math.round(this.helperStartX * this.gridSize) + 0.5,
              Math.round(this.helperStartY * this.gridSize) + 0.5,
              Math.round(this.helperStartX * this.gridSize) + 0.5,
              Math.round((this.helperStartY+this.helperSizeY) * this.gridSize) + 0.5,
            ],
            stroke: this.helperColor,
            strokeWidth: 1
          },
          'right': {
            points: [
              Math.round((this.helperStartX+this.helperSizeX) * this.gridSize) + 0.5,
              Math.round((this.helperStartY) * this.gridSize) + 0.5,
              Math.round((this.helperStartX+this.helperSizeX) * this.gridSize) + 0.5,
              Math.round((this.helperStartY+this.helperSizeY) * this.gridSize) + 0.5,
            ],
            stroke: this.helperColor,
            strokeWidth: 1
          }
        }
      },

      grid: function() {
        let rows = [];
        let cols = [];

        if(this.showGrid) {
          for (let i=0; i<this.imageWidth/this.gridSize; ++i) {
            let cTop = Math.round(i*this.gridSize) + 0.5;
            let cBottom = Math.round(i * this.gridSize) + 0.5;
            if(this.fliped) {
              cTop = this.imageWidth - cTop;
              cBottom = this.imageWidth - cBottom;
            }

            cols.push({
              points: [cTop, 0, cBottom, this.imageHeight],
              stroke: this.gridColor,
              strokeWidth: 1,
              key: 'col-'+i
            });
          }

          for(let i=0; i<this.imageHeight/this.gridSize; ++i) {
            rows.push({
              points: [0, Math.round(i*this.gridSize) + 0.5, this.imageWidth, Math.round(i * this.gridSize), this.gridSize],
              stroke: this.gridColor,
              strokeWidth: 1,
              key: 'row-'+i
            })
          }
        }

        return {
          rows: rows,
          cols: cols
        }
      },
    },

    mounted: function() {
      /* Get canvas size */
      this.stageHeight = document.getElementById('workplace').offsetHeight;
      this.stageWidth = document.getElementById('workplace').offsetWidth;

      window.addEventListener("keydown", e => {
        if(e.keyCode == 16) this.shiftPressed = true;
        if(e.keyCode == 17) this.ctrlPressed = true;
        if(e.keyCode == 18) this.altPressed = true;
      });

      window.addEventListener("keyup", e => {
        if(e.keyCode == 16) this.shiftPressed = false;
        if(e.keyCode == 17) this.ctrlPressed = false;
        if(e.keyCode == 18) this.altPressed = false;
        if(e.keyCode == 71) this.showGrid = !this.showGrid;
        if(e.keyCode == 66) this.toggleGrayScale();
        if(e.keyCode == 27) this.cleanWorkspace();
        if(e.keyCode == 70) this.flipImage();
        if(e.keyCode == 72) this.showHelper= !this.showHelper;
        if(e.keyCode == 73) this.showInfo = !this.showInfo;

        if(this.shiftPressed && !this.altPressed) {
          if(e.keyCode == 87) {
            this.gridPlus();
          }
          if(e.keyCode == 83) {
            this.gridMinus();
          }
        }

        if(this.altPressed && !this.shiftPressed) {
          if(e.keyCode == 87) {
            this.helperSizeY -= 1
            this.storeConfig();
          }
          if(e.keyCode == 83) {
            this.helperSizeY += 1
            this.storeConfig();
          }
          if(e.keyCode == 68) {
            this.helperSizeX += 1
            this.storeConfig();
          }
          if(e.keyCode == 65) {
            this.helperSizeX -= 1
            this.storeConfig();
          }
        }

        if(this.altPressed && this.shiftPressed) {
          if(e.keyCode == 87) {
            this.helperStartY -= 1
            this.storeConfig();
          }
          if(e.keyCode == 83) {
            this.helperStartY += 1
            this.storeConfig();
          }
          if(e.keyCode == 68) {
            this.helperStartX += 1
            this.storeConfig();
          }
          if(e.keyCode == 65) {
            this.helperStartX -= 1
            this.storeConfig();
          }
        }
      });

      if (localStorage.imageSrc) {
        this.loadImage(localStorage.imageSrc);
      }

      if (localStorage.gridSize) {
        this.gridSize = localStorage.gridSize;
      }

      if (localStorage.helperStartY) {
        this.helperStartX = parseInt(localStorage.helperStartX);
        this.helperStartY = parseInt(localStorage.helperStartY);
        this.helperSizeX = parseInt(localStorage.helperSizeX);
        this.helperSizeY = parseInt(localStorage.helperSizeY);
      }
    },

    updated: function() {
      if(this.imageData) {
        this.$refs.image.getStage().cache();
      }
    }
  }
</script>

<style>
  #workspace, #tools, #workplace, #grid, #infos {
    position: absolute;
  }

  #infos {
    left:0;
    right:0;
    top: 0;
    bottom: 0;
    margin-left:auto;
    margin-right:auto;
    margin-top: auto;
    margin-bottom: auto;
    width: 600px;
    height: 600px;
    background-color: #727272;
  }

  #workspace {
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
  }

  .picture-input {
    position: absolute;
    top: 100px;
    color: white;
  }

  #menu {
    background-color: #6200EE;
    right: 20px;
    top: 50px;
  }

  #gplus {
    right: 20px;
    top: 120px;
    background-color: #8f3c23;
  }

  #gminus {
    right: 20px;
    top: 190px;
    background-color: #8f3c23;
  }

  #gscale {
    right: 20px;
    top: 260px;
    background-color: #8f3c23;
  }

  #workplace {
    left: 20px;
    right: 20px;
    bottom: 20px;
    top: 20px;

    background-color: #424242;

    box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  }

  #grid {
    display: none;
    position:absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    background-image:
      linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px);
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
    background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
  }
</style>