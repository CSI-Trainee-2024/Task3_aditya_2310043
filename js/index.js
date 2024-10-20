const canvas = document.querySelector("canvas");
const gameOver = document.getElementById("gameOver")
const c = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;

const oceanLayerData = {
  l_New_Layer_1: l_New_Layer_1,
};
const brambleLayerData = {
  l_New_Layer_2: l_New_Layer_2,
};

const layersData = {
  l_New_Layer_4: l_New_Layer_4,
  l_Background_tiles: l_Background_tiles,
  // l_Gems: l_Gems,
  l_New_Layer_3: l_New_Layer_3,
  l_Collisions: l_Collisions,
};

const tilesets = {
  l_New_Layer_1: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_New_Layer_2: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_New_Layer_4: { imageUrl: "./images/decorations.png", tileSize: 16 },
  // l_Gems: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_Background_tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
  l_New_Layer_3: { imageUrl: "./images/tileset.png", tileSize: 16 },
  l_Collisions: { imageUrl: "./images/tileset.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const platforms = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        })
      );
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        })
      );
    }
  });
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX =
          ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize;
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize;

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16 // destination width, height
        );
      }
    });
  });
};

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenContext = offscreenCanvas.getContext("2d");

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl);
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
let player = new Player({
  x: 100,
  y: 100,
  size: 32,
  velocity: { x: 0, y: 0 },
});

let oposums = [
  new Oposum({
    x: 650,
    y: 100,
    height: 32,
    width: 32,
  }),
  new Oposum({
    x: 400,
    y: 100,
    height: 32,
    width: 32,
  }),
  new Oposum({
    x: 900,
    y: 100,
    height: 32,
    width: 32,
  }),
  new Oposum({
    x: 1300,
    y: 100,
    height: 32,
    width: 32,
  }),
  new Oposum({
    x: 1600,
    y: 100,
    height: 32,
    width: 32,
  }),
  new Oposum({
    x: 2000,
    y: 100,
    height: 32,
    width: 32,
  }),
];

let sprites = [];

let hearts = [
  new Heart({
    x:10,
    y:10,
    width:21,
    height:18,
    imageSrc:'./images/hearts.png',
    spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
  }),
  new Heart({
    x:35,
    y:10,
    width:21,
    height:18,
    imageSrc:'./images/hearts.png',
    spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
  }),
  new Heart({
    x:59,
    y:10,
    width:21,
    height:18,
    imageSrc:'./images/hearts.png',
    spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
  })
]

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastTime = performance.now();
let camera = {
  x: 0,
  y: 0,
};

const SCROLL_POST_RIGHT = 500;
const SCROLL_POST_TOP = 100;
const SCROLL_POST_BOTTOM = 280;
let oceanBackgroundcanvas = null;
let brambleBackgroundCanvas = null;
let gems =[]
let gemUI = new Sprite ({
  x: 16,
  y: 36,
  width: 15,
  height: 13,
  imageSrc: "./images/gem.png",
  spriteCropbox: { x: 0, y: 0, width: 15, height: 13, frames: 5},
})

let gemCount=0;

function init (){
  gems=[]
  gemCount=0
  gemUI = new Sprite ({
    x: 16,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: "./images/gem.png",
    spriteCropbox: { x: 0, y: 0, width: 15, height: 13, frames: 5},
  })
  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        gems.push(        
          new Sprite({
          x: x*16,
          y: y*16,
          width: 15,
          height: 13,
          imageSrc: "./images/gem.png",
          spriteCropbox: { x: 0, y: 0, width: 15, height: 13, frames: 5},
          hitbox:{          
            x: x*16,
            y: y*16,
            width: 15,
            height: 13,
          },
        }),
      )
      } 
    })
  })
  



  player = new Player({
    x: 100,
    y: 100,
    size: 32,
    velocity: { x: 0, y: 0 },
  });
  
   oposums = [
    new Oposum({
      x: 650,
      y: 100,
      height: 32,
      width: 32,
    }),
    new Oposum({
      x: 400,
      y: 100,
      height: 32,
      width: 32,
    }),
    new Oposum({
      x: 900,
      y: 100,
      height: 32,
      width: 32,
    }),
    new Oposum({
      x: 1300,
      y: 100,
      height: 32,
      width: 32,
    }),
    new Oposum({
      x: 1600,
      y: 100,
      height: 32,
      width: 32,
    }),
    new Oposum({
      x: 2000,
      y: 100,
      height: 32,
      width: 32,
    }),
  ];
  
   sprites = [];
  
   hearts = [
    new Heart({
      x:10,
      y:10,
      width:21,
      height:18,
      imageSrc:'./images/hearts.png',
      spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
    }),
    new Heart({
      x:35,
      y:10,
      width:21,
      height:18,
      imageSrc:'./images/hearts.png',
      spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
    }),
    new Heart({
      x:59,
      y:10,
      width:21,
      height:18,
      imageSrc:'./images/hearts.png',
      spriteCropbox : { x: 0, y: 0, width: 21, height: 18, frames: 6 },
    })
  ]

  camera = {
    x: 0,
    y: 0,
  };
}

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Update player position
  // player.handleInput(keys)
  player.handleInput(keys);
  player.update(deltaTime, collisionBlocks);

  // update oposum position
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i];
    oposum.update(deltaTime, collisionBlocks);

    // jUMP ON ENenmy

    const collisionDirection = checkCollisions(player, oposum);
    if(collisionDirection){
    if (collisionDirection === "bottom" && !player.isOnGround) {
      player.velocity.y = -200;
      sprites.push(
        new Sprite({
          x: oposum.x,
          y: oposum.y,
          width: 32,
          height: 32,
          imageSrc: "./images/enemy-death.png",
          spriteCropbox: { x: 0, y: 0, width: 40, height: 41, frames: 6 },
        })
      );
      oposums.splice(i, 1);
    } else if (
      collisionDirection === "left" ||
      collisionDirection === "right"
    ) {
      const fullHearts = hearts.filter((heart)=>{
      return !heart.depleted
      })

      if(!player.isInvincible && fullHearts.length>0){
        fullHearts[fullHearts.length - 1].depleted = true;
      }
      else if (fullHearts.length === 0){
        init()
      }
      player.setIsInvincible();
    }
  }
}


  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.update(deltaTime);

    if (sprite.iteration === 1) {
      sprites.splice(i, 1);
    }
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i];
    gem.update(deltaTime);

    const collisionDirection =  checkCollisions(player,gem)

    if(collisionDirection){
      // create an item ffeedback animation 
      sprites.push(
        new Sprite({
          x: gem.x - 8,
          y: gem.y - 8,
          width: 32,
          height: 32,
          imageSrc: "./images/item-feedback.png",
          spriteCropbox: { x: 0, y: 0, width: 32, height: 32, frames: 5},
        })
      );

      gems.splice(i,1)
      gemCount++;
      if(gems.length === 0){
        gameOver.innerHTML = "You Win";
        console.log("YOU WIN !!!")
      }
    }
  }

  // Track scroll post distance

  if (player.x > SCROLL_POST_RIGHT && player.x < 1650) {
    const scorllPostDistance = player.x - SCROLL_POST_RIGHT;
    camera.x = scorllPostDistance;
  }
  if (player.y < SCROLL_POST_TOP && camera.y > 0) {
    const scorllPostDistance = SCROLL_POST_TOP - player.y;
    camera.y = scorllPostDistance;
  }
  if (player.y > SCROLL_POST_BOTTOM) {
    const scorllPostDistance = player.y - SCROLL_POST_BOTTOM;
    camera.y = -scorllPostDistance;
  }

  // Render scene
  c.save();
  c.scale(dpr + 1, dpr + 1);
  c.translate(-camera.x, camera.y);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(oceanBackgroundcanvas, camera.x * 0.32, 0);
  c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0);
  c.drawImage(backgroundCanvas, 0, 0);
  player.draw(c);
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i];
    oposum.draw(c);
  }
  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.draw(c);
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i];
    gem.draw(c);
  }


  // c.fillRect(SCROLL_POST_RIGHT,100,10,100)
  // c.fillRect(300,SCROLL_POST_TOP,100,10)
  // c.fillRect(300,SCROLL_POST_BOTTOM,100,10)

  c.restore();

  c.save();
  c.scale(dpr +1, dpr+1);
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    heart.draw(c);
  }

  gemUI.draw(c)
  c.fillText(gemCount, 36 ,46)
  c.restore();


  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
  try {
    oceanBackgroundcanvas = await renderStaticLayers(oceanLayerData);
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData);
    const backgroundCanvas = await renderStaticLayers(layersData);
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

init()
startRendering();
