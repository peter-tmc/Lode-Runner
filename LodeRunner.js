/*     Lode Runner

Aluno 1: ?number ?name <-- mandatory to fill
Aluno 2: ?number ?name <-- mandatory to fill

Comentario:

O ficheiro "LodeRunner.js" tem de incluir, logo nas primeiras linhas,
um comentário inicial contendo: o nome e número dos dois alunos que
realizaram o projeto; indicação de quais as partes do trabalho que
foram feitas e das que não foram feitas (para facilitar uma correção
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementação que possam ser menos óbvios para o avaliador.

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/


// GLOBAL VARIABLES

// tente não definir mais nenhuma variável global

let empty, hero, control;


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.time = 0
		this.visible=true;
		this.show();
	}
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	isPassiveActor() {
		return false;
	}

	isActiveActor() {
		return false;
	}

	canBeDestroyed() {
		return false;
	}

	isVisible() {
		return this.visible;
	}
	
	isTrespassable() {
		return false;
	}

	canBeClimbed() {
		return false;
	}

	isVoid() {
		return false;
	} 

	isBalanced() {
		return true;
	}

	canBePickedUp() {
		return false;
	}

	hasAnimation() {
		return false;
	}

	robotNotFall() {
		return false;
	}

	canSlide() {
		return false;
	}
}

class PassiveActor extends Actor {
	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
		this.visible=true;
	}
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
		this.visible=false;
	}
	isPassiveActor() {
		return true;
	}
}

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
	}
	show() {
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
		this.visible=true;
	}
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
		this.visible=false;
	}
	animation() {
	
	}

	isActiveActor() {
		return true;
	}

	isVillain() {
		return false;
	}

	hasAnimation() {
		return true;
	}
}

class Brick extends PassiveActor {
	constructor(x, y) { super(x, y, "brick");}

	canBeDestroyed() {
		return true;
	}

}

class Chimney extends PassiveActor {
	constructor(x, y) { super(x, y, "chimney"); }

	isVoid() {
		return true;
	}
}

class Empty extends PassiveActor {
	constructor() { super(-1, -1, "empty"); }

	isTrespassable() {
		return true;
	}

	isVoid() {
		return true;
	}

	show() {}
	hide() {}
}

class Gold extends PassiveActor {
	constructor(x, y) { super(x, y, "gold"); }

	isTrespassable() {
		return true;
	}

	isBalanced() {
		return false;
	}

	canBePickedUp() {
		return true;
	}

	isVoid() {
		return true;
	}
}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "empty");
	}

	isTrespassable() {
		return true;
	}

	canBeClimbed() {
		return true;
	}

	makeVisible() {
		this.imageName = "ladder";
		this.show();
	}
}

class Rope extends PassiveActor {
	constructor(x, y) { super(x, y, "rope"); }

	isTrespassable() {
		return true;
	}

	isBalanced() {
		return false;
	}

	canSlide() {
		return true;
	}
}

class Stone extends PassiveActor {
	constructor(x, y) { super(x, y, "stone"); }

}

class Boundary extends PassiveActor {
	constructor() { super(-1, -1); }
	show() {}
	hide() {}
}

class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
		this.goldOnLevel=0;
		hero=this;
		this.levelGold=0;
		this.lastdx=-1;
		this.shot=false;
	}

	countObjects() {
		for(let x=0; x<WORLD_WIDTH; x++){
			for(let y=0; y<WORLD_HEIGHT; y++){
				if(control.world[x][y].canBePickedUp())
					this.levelGold++;
			}
		}
	}

	incObjects() {
		control.gold++;
		this.goldOnLevel++;
	}
	
 //verificar se todos os objetos ja foram apanhados
	hasPickedUpAllObjects() { 
		if(this.goldOnLevel===this.levelGold) {
			for(let x=0; x<WORLD_WIDTH; x++){
				for(let y=0; y<WORLD_HEIGHT; y++){
					//se um objeto nao esta visivel
					if(!control.world[x][y].isVisible()) 
						//tornamos esse objeto visivel
						control.world[x][y].makeVisible(); 
				}
			}
		}
	}

	moveAux(dx, dy){
		let behind= control.getBehind(this.x, this.y);
		//se atras do aor encontra se um obejto que pode ser apanhado
		if(behind.canBePickedUp()){ 
			this.incObjects();
			behind.hide();
		}
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
		this.hasPickedUpAllObjects()
	}
	
	move(dx, dy) {
		let next=control.get(this.x + dx, this.y + dy);
		let behind= control.getBehind(this.x, this.y);
		let atFeet= control.get(this.x, this.y+1);
		let above= control.get(this.x, this.y-1);
		//se esta a mover se verticalmente, entao muda o lastdx 
		if(dy!=0 && !this.isFalling()) { 
			this.lastdx=-this.lastdx;     //para efeitos de animacao
		}
		if(dx!==0)
			this.lastdx=dx;
		if(next.isPassiveActor()) {
			//next nao pode ser trespassado (passado de lado)
			if(!next.isTrespassable()) { 
				if(atFeet.isVoid()) { 
					this.moveAux(dx,dy);		
				}
			}
			else{ //next pode ser trespassado
				if(dy===-1) {
					if(behind.canBeClimbed() && behind.isVisible()){
						this.moveAux(dx,dy);
					}
				}
				else 
					this.moveAux(dx,dy);
				
			}
		}
		else { //next e um active actor
			if(next.isVillain()) {
				control.gameOver();
			}
			else {
				this.hide();
				this.x += dx;
				this.y += dy;
				this.show();
			}
		}
	}

	isFalling() {
		let behind= control.getBehind(this.x, this.y);
		let atFeet= control.get(this.x, this.y+1);
		return behind.isVoid() && (atFeet.isVoid() || !atFeet.isBalanced());
	}
	animation() {
		this.shot=false;
		//condicoes para passar ao proximo nivel
		if(this.y===0 && control.getBehind(this.x, this.y).canBeClimbed() && 
		this.goldOnLevel===this.levelGold) { 
			alert("Good job! You're moving on to the next level");
			control.nextLevel();
			return;
		}
		else {
			let k = control.getKey();
			if(this.isFalling())
				this.move(0,1);
			else if(!control.getBehind(this.x, this.y).isTrespassable() && 
				this.y!=(WORLD_HEIGHT-1))
					this.moveAux(0,-1);
			else  if( k == ' ' ){
					  this.shot=true;
					  
				 if(control.get(this.x+this.lastdx, this.y+1).canBeDestroyed() && 
					control.get(this.x+this.lastdx, this.y).isTrespassable()){ //condicoes para efetuar o shot
						control.world[this.x+this.lastdx][this.y+1]=new Holes(this.x+this.lastdx, this.y+1);
					}
					if(control.get(this.x-this.lastdx, this.y).isTrespassable() && //condicoes para o recoil
					(!control.get(this.x-this.lastdx, this.y+1).isTrespassable() || control.get(this.x-this.lastdx, this.y+1).canBeClimbed())){
						this.move(-this.lastdx, 0);
						this.lastdx=-this.lastdx;
					}
				}
			else if( k == null ) 
					;
			else  {
				let [dx, dy] = k;
				this.move(dx, dy);
			}
		}
	}

	amountOfObjectsPickedUp(){
		return this.gold;
	}
	
	amountOfObjectsOnLevelPickedUp() {
		return this.goldOnLevel;
	}
	
	amountOfObjectsOnLevel() {
		return this.levelGold;
	}
	
	hasShot() {
		return this.shot;
	}
	show(){
		let behind=control.getBehind(this.x, this.y);
		if(this.time>0) {
			if(this.dx<0) {
				if(this.isFalling())
					this.imageName="hero_falls_left";
				
				else if(behind.canBeClimbed() && behind.isVisible()) { 
						
					this.imageName="hero_on_ladder_left";
				}
				else if(behind.canSlide()) {
					this.imageName="hero_on_rope_left";
				}
				else if(this.hasShot()) {
					this.imageName="hero_shoots_right";
				}
				else {
					this.imageName="hero_runs_left";
					
				}
			}
			else {
					if(this.isFalling()) {
						this.imageName="hero_falls_right";
					}
					else if(behind.canBeClimbed()) { 
						
						this.imageName="hero_on_ladder_right";
					}
					else if(behind.canSlide()) {
						this.imageName="hero_on_rope_right"
					}
					else if(this.hasShot()) {
						this.imageName="hero_shoots_left";
					}
					else {
						this.imageName="hero_runs_right";
						
					}
					
				}
		}	
		super.show();
	}
}

class Robot extends ActiveActor {
	constructor(x, y) {
		super(x, y, "robot_runs_right");
		this.dx = 1;
		this.dy = 0;
		this.gold=0;
		this.goldTime=0;
	  }

	moveAux(dx, dy){
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}

	move(dx, dy) {
		let next=control.get(this.x + dx, this.y + dy);
		if(dx!==0)
			this.dx=dx;
		let behind= control.getBehind(this.x, this.y);
		let atFeet= control.get(this.x, this.y+1);
		if(atFeet.isActiveActor()) {
			next=control.get(this.x+this.dx,this.y);
			if(next.isPassiveActor())
				if(next.isTrespassable())
					this.moveAux(this.dx,0);
		}
		else {
			if(next.isPassiveActor()) {
				if(!next.isTrespassable())
				/*actor doesnt move*/;
				else{
					if(dy===-1) {
						if(behind.canBeClimbed() && behind.isVisible()){
							this.moveAux(dx,dy);
						}
					}
					
					else 
						
						if(next.canBePickedUp() && this.gold<1) {	       
							control.world[this.x+dx][this.y+dy]=empty;
							control.world[this.x][this.y].draw(this.x, this.y);
							this.moveAux(dx,dy);
							this.gold++;
							this.goldTime=0;
						}
						else {
							this.moveAux(dx,dy);
						}
				}
				
			}
			else { //next is an active actor
				if(next.isVillain())
					;
				else  {
					this.moveAux(dx,dy);
					control.gameOver();
				}
			
			}
		}
	}

	calculateMotion() {
		let distX=this.x-hero.x;
		let distY=this.y-hero.y;

		if(Math.abs(distX)>Math.abs(distY)) {
			if(distX>0)
				this.move(-1,0);
			else 
				this.move(1,0);
		}
		else {
			if(distY>0)
				this.move(0,-1);
			else 
				this.move(0,1);
		}
		
	}
	
	isFalling() {
		let behind= control.getBehind(this.x, this.y);
		let atFeet= control.get(this.x, this.y+1);

		
		if(atFeet.isActiveActor())
			return behind.isVoid();
		return behind.isVoid() && (atFeet.isVoid() || !atFeet.isBalanced());
	}
	
	animation() {
		if( this.time %control.difficulty == 0 ) //para controlar quantas animacoes os robots efetuam
			return;
		if(this.gold>0) {
			this.goldTime++;
			if(this.goldTime>=24 && !control.get(this.x-this.dx, this.y+1).isTrespassable() && control.get(this.x-this.dx, this.y).isVoid()) {
				let g= new Gold(this.x-this.dx,this.y);
				control.world[this.x-this.dx][this.y]=g;
				control.world[this.x-this.dx][this.y].show;
				this.gold=0;
				this.goldTime=0;
			}
		}
		if(control.getBehind(this.x, this.y).robotNotFall()) { //esta preso num buraco
			if(this.gold>0){
				let g= new Gold(this.x,this.y-1);
				control.world[this.x][this.y-1]=g;
				control.world[this.x][this.y-1].show;
				this.gold=0;
				this.goldTime=0;
			}
		}
		else {
			if(this.isFalling())
				this.move(0,1);
			else
				this.calculateMotion();
		}
	}

	
	isVillain() {
		return true;
	}

	show() {
		let behind=control.getBehind(this.x, this.y);
		if(this.time>0) {
			if(this.dx<0) {
				if(this.isFalling())
					this.imageName="robot_falls_left";
				
				else if(behind.canBeClimbed() && behind.isVisible()) { 
						
						this.imageName="robot_on_ladder_left";
				}
				else if(behind.canSlide()) {
						this.imageName="robot_on_rope_left"
				}
				else {
						this.imageName="robot_runs_left";
					
				}
			}
			else {
					if(this.isFalling()) {
							this.imageName="robot_falls_right";
					}
					else if(behind.canBeClimbed()) { 
						
							this.imageName="robot_on_ladder_right";
					}
					else if(behind.canSlide()) {
							this.imageName="robot_on_rope_right"
					}
					else {
							this.imageName="robot_runs_right";
						
					}
					
				}
		}	
		super.show();
	}
}

class Holes extends PassiveActor {
	constructor(x, y) {
		super(x, y, "empty");
		this.level=control.level; //criamos esta variavel para impedir que o tijolo 
		this.timecreated=0;		  //fosse criado noutro nivel no caso de passarmos de nivel
	}							  //ou perdermos um nivel e um buraco ainda estivesse ativo

	hasAnimation() {
		return true;
	}

	isTrespassable() {
		return true;
	}

	isVoid() {
		return true;
	}

	robotNotFall() {
		return true;
	}
 
	animation() {
		this.timecreated++;
		if(this.timecreated >= 32 && this.level===control.level) { //after 4 seconds the brick respawns
			let thispos=control.get(this.x,this.y);
			let above=control.get(this.x,this.y-1);
			if(above.isActiveActor()) {
				;
			}
			else {
				if(thispos.isActiveActor()) {
					if(thispos.isVillain()) {
						let b=new Brick(this.x, this.y);
						control.world[this.x][this.y]= b;
						thispos.hide();
						thispos.x=this.x;
						thispos.y=this.y-1;
						thispos.show();
						b.show();
					}
					else {
						if(this.y===WORLD_HEIGHT-1)
							control.gameOver();
						else {
							let b=new Brick(this.x, this.y);
							control.world[this.x][this.y]= b;
							thispos.hide();
							thispos.x=this.x;
							thispos.y=this.y-1;
							thispos.show();
							b.show();
						}
					}
				}
				else {
					let b=new Brick(this.x, this.y);
					control.world[this.x][this.y]= b;
					b.show()
				}
			}
		}
	}	

}

// GAME CONTROL

class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.boundary= new Boundary();
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(1);
		this.level=1;
		this.setupEvents();
		this.gold=0;
		this.lives=3;
		this.audio = null;
		this.difficulty=2;
	}
	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}
	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++) {
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
		}
		hero.countObjects();
		control.level=level;
	}
	getKey() {
		let k = control.key;
		control.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		}
	}
	setupEvents() {
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}
	animationEvent() {
		control.time++;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = control.worldActive[x][y];
				let i= control.world[x][y];
				if(i.time<control.time && i.hasAnimation()) {
					i.time=control.time;
					i.animation();
				}
				if( a.time < control.time && a.hasAnimation()) {
					a.time = control.time;
					a.animation();
				}
				document.getElementById("scoretxt").value = parseInt(score(),10);
				document.getElementById("scoreOnLeveltxt").value = parseInt(scoreOnLevel(),10);
				document.getElementById("leveltxt").value = parseInt(currentLevel(),10);
				document.getElementById("livestxt").value = parseInt(lives(),10);
			}
	}
	keyDownEvent(k) {
		control.key = k.keyCode;
	}
	keyUpEvent(k) {
	}

	isInside(x,y) {
		return 0<=x && x< WORLD_WIDTH && 0<=y && y<WORLD_HEIGHT;
	}
	get(x,y) {
		if(!this.isInside(x,y)) 
			return this.boundary;
		else 
			if(control.worldActive[x][y] !== empty)
				return control.worldActive[x][y];
		else
			return control.world[x][y];
	}

	getBehind(x,y) {
		return control.world[x][y];
	}



	restartGame() {
		this.gold=0;
		this.lives=3;
		this.level=1;
		
		this.ctx=document.getElementById("canvas1").getContext("2d");
		this.ctx.clearRect(0, 0, 504, 272); //limpa o canvas

		for(let x=0 ; x < WORLD_WIDTH ; x++) {
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				control.worldActive[x][y].hide();
				control.world[x][y].hide();
				control.worldActive[x][y].hide();
				control.world[x][y].hide();
			}
		}
		control.loadLevel(1);
	}

	gameOver() {
		
		this.lives--;
		if(this.lives==0){
			for(let x=0 ; x < WORLD_WIDTH ; x++) {
				for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					control.worldActive[x][y].hide();
					control.world[x][y].hide();
					control.worldActive[x][y].hide();
					control.world[x][y].hide();
				}
			}
			this.ctx=document.getElementById("canvas1").getContext("2d");
			this.ctx.rect(0, 0, 504, 272)
			this.ctx.fillStyle = "black";
			this.ctx.fill();
			this.ctx.font="20px Georgia";
			this.ctx.fillStyle = '#B22222';
			this.ctx.fillText("GAME OVER",199,55)
			this.ctx.fillText("You have lost.",202,125)
			this.ctx.fillText("Are you sure you want to replay?",128,170);
			this.ctx.fillText("Click the restart button to restart the game.",90,215);
		}
		else 
			control.restartLevel();
	}

	restartLevel() {
		this.gold=this.gold-hero.goldOnLevel;
		for(let x=0 ; x < WORLD_WIDTH ; x++) {
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				control.worldActive[x][y].hide();
				control.world[x][y].hide();
				control.worldActive[x][y].hide();
				control.world[x][y].hide();
			}
		}
		control.loadLevel(control.level);
	}

	nextLevel() {
		for(let x=0 ; x < WORLD_WIDTH ; x++) {
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				control.worldActive[x][y].hide();
				control.world[x][y].hide();
			}
		}
		control.level++;
		if(control.level <= 16)
			control.loadLevel(control.level);
		else

			alert("PARABENS! ACABOU O JOGO")
	}
}


// HTML FORM

function onLoad() {
  // Asynchronously load the images an then run the game
	GameImages.loadAll(function() { new GameControl(); });
}


//funcao para adicionar audio ao jogo atraves de 'radio buttons' que quando um 
//e selecionado, outro e desselecionado
 function b(){
	if(document.getElementById("button1").checked) {
		 document.getElementById("button1").value=1;
		 document.getElementById("button2").value=0;
		 if(control.audio == null ) 
			control.audio = new Audio("https://vgmdownloads.com/soundtracks/pokemon-original-game-soundtrack/wahjdqip/101%20-%20opening.mp3");
		control.audio.loop = true;
		control.audio.volume=0.15;
		control.audio.play(); // requires a previous user interaction with the page
	}
	else{
		document.getElementById("button1").value=0;
		document.getElementById("button2").value=1;
		if(control.audio != null )
			control.audio.pause();
	}

 }

 function score(){
	 return control.gold;
 }

 function scoreOnLevel() {
	 return hero.goldOnLevel;
 }
 
 function currentLevel() {
	 return control.level;
 }

 function lives() {
	 return control.lives;
 }

 function setDiffEasy() {
	control.difficulty=2;
 }
 
 function setDiffHard() {
	control.difficulty=5;
 }

 function setDiffImpossible() {
	control.difficulty=20;
 }

 function restartG() {
	control.restartGame();
 }
