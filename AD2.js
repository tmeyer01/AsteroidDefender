
let can = document.getElementById("drawingCanvas");
let brush = can.getContext("2d");
let rect = can.getBoundingClientRect();
let image = document.getElementById('source');
brush.drawImage(image,0,0);

let gameOverImage = document.getElementById('gaveOver');
let scoreEl = document.getElementById("scoreEl");


function TitleScreen(){
  brush.drawImage(image,0,0);
  
}

function GetRandomInteger(a, b){
  // returns a random integer x such that a <= x <= b
  // 
  // @params
  // a: integer
  // b: integer
  // @returns
  // a random integer x such that a <= x <= b

  // switch the large and small if out of order
  if (a > b){
      small = b;
      large = a;
  }
  else{
      small = a;
      large = b;
  }

  let x = parseInt(Math.random() * (large - small + 1)) + small
  return x;
}


class Defender{
  constructor(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.dX = 22;
    this.radius = radius;
    this.color = color;
  }

  moveRight(){
    let newx = this.x + this.dX;
    if (newx + this.radius <= can.width -1){
      this.x = newx
    }
  }

  moveLeft(){
    let newxL = this.x - this.dX;
    if (newxL - this.radius >= 0){
      this.x = newxL;
    }
  }



  draw(){
    brush.beginPath();
    brush.arc(this.x, this.y, this.radius, 0, Math.PI * 2,false);
    brush.fillStyle = this.color;
    brush.fill()
  }


}

class Projectile {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;

  }
  draw(){
    brush.beginPath();
    brush.arc(this.x, this.y, this.radius, 0, Math.PI * 2,false);
    brush.fillStyle = this.color;
    brush.fill()
  }
  update(){
    this.draw();
    this.y = this.y - this.velocity.y;
  }

}




class Asteroid {
  constructor(x, y, dX, dY, radius, color,){
    this.x = x;
    this.y = y;
    this.dX = dX;
    this.dY = dY;
    this.radius = radius;
    this.color = color;
    

  }
  draw(){
    brush.beginPath();
    brush.arc(this.x, this.y, this.radius, 0, Math.PI * 2,false);
    brush.fillStyle = this.color;
    brush.fill()
  }
  update(){
    this.draw();
    this.x = this.x + this.dX;
    this.y = this.y + this.dY;
  }

}

class Particle {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw(){
    brush.save();
    brush.globalAlpha = this.alpha;
    brush.beginPath();
    brush.arc(this.x, this.y, this.radius, 0, Math.PI * 2,false);
    brush.fillStyle = this.color;
    brush.fill();
    brush.restore();
  }
  update(){
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01
  }
}

let x = can.width / 2;
let y = can.height;

let myMouse = {
  x: -1,
  y: -1,
}



let player = new Defender(x, y, 30, 'grey');
let projectiles = [];
let asteroids = [];
let particles = [];
let hits = [];
let score = 0; 
let lives = 3;
let spawnInt = 2500;

let startGameButton = document.getElementById("startGameButton");
let credits = document.getElementById('credBtn');
let howToPlay = document.getElementById("myBtn");





function spawnAsteroids() {
  setInterval(() => {
    
    let radius = GetRandomInteger(15, 30)
    let x = GetRandomInteger(parseInt(player.radius) , parseInt(can.width - player.radius));
    let y = 0; 
    let dX = 0;
    let dY = .9;

    let color = 'hsl(0, 50%, 50%)';
    
  
    asteroids.push(new Asteroid(x, y, dX, dY, radius, color))
    
  },spawnInt)  
}

// spawnAsteroids();



function animate(){
  
  animationId = requestAnimationFrame(animate);
  brush.fillStyle = 'rgba(0,0,0,0.1)'
  brush.fillRect(0, 0, can.width, can.height);
  player.draw();
  
  //Animating Particles of explosing asteroids, removing particles onces alpha value is 0 


  particles.forEach((particle, index) => {
    if(particle.alpha <= 0){
      particles.splice(index, 1)
    }else{
      particle.update() 
    }

  });
  



  // Projectiles Loop 
  projectiles.forEach((projectile, index) => {
    projectile.update()

    //removing if off screen 
    if( projectile.y + projectile.radius < 0 ){
        projectiles.splice(index, 1)
      
    }
  })
  
  

  asteroids.forEach(( asteroid, index) => {
    asteroid.update()

    let dist = Math.hypot(player.x - asteroid.x, 
      player.y - asteroid.y)
    
    //end game 
    if (asteroid.y + asteroid.radius > can.height){
      lives--; 
      brush.clearRect(0,0, can.width, can.height);
      livesEl.innerHTML = lives;
      let hitGround = document.getElementById("hitGround");hitGround.play();   
      asteroids.splice(index, 1)
      
    }  
    
    
    projectiles.forEach((projectile, pIndex) => {
     const dist = Math.hypot(projectile.x - asteroid.x, 
      projectile.y - asteroid.y)


     //When Projectiles hit asteroids
     if(dist - asteroid.radius - projectile.radius < 1)
      {
        // Increasing the score
        score +=100;
        scoreEl.innerHTML = score;
        let asteroidHit = document.getElementById("astroideHit");asteroidHit.play();
        
        // If you score reaches 2500 Asteroids start to spawn faster 
        if(score === 2500){
         spawnInt = 1500;
         brush.clearRect(0,0, can.width, can.height);
         spawnAsteroids();
        }


         for (let i = 0; i < asteroid.radius * 2; i++){
          asteroidHit = document.getElementById("astroideHit");asteroidHit.play();
            particles.push(
              new Particle(
                projectile.x, 
                projectile.y, 
                GetRandomInteger(0,2), 
                'white', 
              {
                x: (Math.random() - 0.5) * GetRandomInteger(0,3), 
                y: (Math.random() - 0.5)* GetRandomInteger(0,3)
              })
            )
          }




        if(asteroid.radius - 10 > 8){
          // asteroid.radius -= 15;
          gsap.to(asteroid, {
            radius: asteroid.radius - 10
          })
          setTimeout(() =>{
            projectiles.splice(pIndex, 1)
          }, 0)
        } else{

          setTimeout(() =>{
            asteroids.splice(index, 1)
            projectiles.splice(pIndex, 1)
          }, 0)
        }
      } 
    })

  });
  
  
  if(lives <= 0 ){
    cancelAnimationFrame(animationId);
    brush.clearRect(0,0, can.width, can.height);
    // TitleScreen();
    brush.drawImage(gameOverImage,0,0);
    startGameButton.style.display = "block";
    credits.style.display = "block";
    howToPlay.style.display = "block";
    isGameRunning = false;
  }
}


can.addEventListener("click", function(event){
    
 
  let velocity = {
    x: 0,
    y: 12 
  }

  projectiles.push(
    new Projectile(player.x, can.height, 7, "red", velocity)
  )
  let laserSound = document.getElementById("laser");laserSound.play();

});

addEventListener("keydown", function(event){
 

  if(event.key === "a"){
    player.moveLeft();
  }
  if(event.key === "d"){
    player.moveRight();
  }

})


let isGameRunning = false;

function StartGame(){
  let themeMusic = document.getElementById("themeMusic");themeMusic.play();
  if(!isGameRunning){
    resetGame();
    spawnAsteroids();
    animate();
      
  }  
}


function resetGame(){


 isGameRunning = true;
 player = new Defender(x, y, 30, 'grey');
 spawnInt = 2500;
 projectiles = [];
 asteroids = [];
 particles = [];
 score = 0;
 scoreEl.innerHTML = score; 
 lives = 3;
 livesEl.innerHTML = lives;
 
 startGameButton.style.display = "none";
 credits.style.display = "none";
 howToPlay.style.display = "none";
 
}





// JS for Modals below 

let modal = document.getElementById("howToPlayModal");
let btn = document.getElementById("myBtn");
let span = document.getElementsByClassName("close")[0];


btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}



let modal2 = document.getElementById("creditsModal");
let btn2 = document.getElementById("credBtn");
let span2 = document.getElementsByClassName("close")[1];

btn2.onclick = function (){
  modal2.style.display = "block";
}

span2.onclick = function(){
  modal2.style.display = "none";
}

window2.onclick = function(event) {
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
}