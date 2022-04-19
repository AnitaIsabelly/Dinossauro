/*Desenvolvido por: Anita Isabelly Gabionetta de Souza*/
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const jogador = new Image(100, 100);
jogador.src = "img/Gatonauta.png";

const inimigo = new Image(100, 100);
inimigo.src = "img/Meteoro.png";

//variaveis
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let instructionText;

// event listeners do teclado
document.addEventListener('keydown', function (evt){
    keys[evt.code] = true;
    //console.log(evt.code);
});

document.addEventListener('keyup', function (evt){
    keys[evt.code] = false;
});


class Player{
    //construtor padrão do jogador
    constructor(x, y, w, h, c){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.img = jogador;

        this.dy = 0;
        this.jumpForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
    }

    Animate(){
        //animação de pulo
        if(keys['Space'] || keys['KeyW'] || keys['ArrowUp']){
            //console.log('Pulo');
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }

        //animação de abaixar
        if (keys['ShiftLeft'] || keys['KeyS'] || keys['ArrowDown']){
            this.h = this.originalHeight / 2;
        }else{
            this.h = this.originalHeight;
        }
        //mudar posição
        this.y += this.dy;

        //Gravidade
        if (this.y + this.h < canvas.height){
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }

        this.Draw();
    }

    Jump(){
        if (this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Obstacle{
    //construtor padrão de obstaculo
    constructor(x, y, w, h, c){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.img = inimigo;

        this.dx = -gameSpeed;
    }

    Update(){
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Text{
    //construtor de texto
    constructor (t, x, y, a, c, s){
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

//Funções
function SpawnObstacle(){
    let size = RandomIntInRange(30, 80);
    let type = RandomIntInRange(0, 1); //0 terrestre | 1 voador
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#9400d3');

    if(type == 1){
        obstacle.y -= player.originalHeight - 10;
    }
    obstacles.push(obstacle);
}   

function RandomIntInRange(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

function Start(){
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highscore = 0;
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
      }

    player = new Player(25, 0, 100, 100, '#1e90ff');
    
    instructionText = new Text("Ajude o Gatonauta a desviar dos meteoros!", 900, 100, "center", "#d76ed9", "-webkit-text-fill-color: red", "50");
    scoreText = new Text("Score: " + score, 50, 50, "left", "#d76ed9", "50");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 50, 50, "right", "#d76ed9", "50");

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update(){
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if(spawnTimer <= 0){
        SpawnObstacle();
        //console.log(obstacles);
        spawnTimer = initialSpawnTimer - gameSpeed * 8;
        if (spawnTimer < 60){
            spawnTimer = 60;
        }
    }

    //nascer inimigos
    for(let i = 0; i < obstacles.length; i++){
        let o = obstacles[i];

        if (o.x + o.w < 0){
            obstacles.splice(i, 1);
        }
        if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            window.localStorage.setItem('highscore', highscore);
        }
        o.Update();
    }

    player.Animate();

    score++;
    scoreText.t = "Score: " + score;
    instructionText.t = "Ajude o Gatonauta a desviar dos meteoros!";
    instructionText.Draw();
    scoreText.Draw();
    if (score > highscore) {
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;
    }
    highscoreText.Draw();

    gameSpeed += 0.004;
}

Start();
