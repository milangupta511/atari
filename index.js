
(function(){
  
  var canvas=document.getElementById('canvas'),
    buttonStart = document.getElementsByClassName('button-start-game')[0],
    backgroundLayer = document.getElementsByClassName('background-layer')[0],
    score = document.getElementsByClassName('score')[0],
    ball = {
      radius: 10,
      color: "#02912a",
      X: canvas.width/2,
      Y: canvas.height/2,
      VX:3,
      VY:-3
    },
    isRightPressed = false,
    isLeftPressed = false,
    timer, tileSetting ,tileArr, totalTiles, slider;
  
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  buttonStart.addEventListener('click', startGame);
  
  function startGame(){
    backgroundLayer.classList.add('is-hidden');
    buttonStart.classList.add('is-hidden');
    timer = setInterval(draw,10);
  }

  function tileSetting(){
    this.width = 50,
    this.height = 15,
    this.color= "#30b0d3",
    this.gutter= 10,
    this.columnCount= 5,
    this.rowCount=  Math.floor((canvas.width-this.gutter)/(this.width+this.gutter)),
    this.tile = function(){
      var tileArr = [];
      for(var i=0; i<this.rowCount;i++){
        tileArr[i]=[]
        for(var j=0; j< this.columnCount; j++){
          tileArr[i][j]={
            X:this.gutter+i*(this.width+this.gutter),
            Y:this.gutter+j*(this.gutter+this.height),
            isCollided:false
          }
        }
      }
      return tileArr
    }
  }

  tileSetting = new tileSetting();
  tileArr = tileSetting.tile();
  totalTiles = tileSetting.rowCount*tileSetting.columnCount
  function Slider() {
    this.width=100,
    this.height=15,
    this.color="#19330e",
    this.X = canvas.width/2,
    this.Y = canvas.height-30-(this.height/2),
    this.VX = 8 
  }
  slider = new Slider();
  
  

  function draw(){
    var ctx;
    
    if(canvas.getContext){
      
      ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width, canvas.height);
      
      // slider moves right if right button pressed and slider's right edge is inside canvas
      if(isRightPressed && slider.X+slider.VX+(slider.width/2)<=canvas.width){
        slider.X =slider.X+slider.VX;
      }
      //slider moves left if left button is pressed and slider's left edge is inside canvas
      if(isLeftPressed && slider.X+slider.VX-(slider.width/2)>=0){
        slider.X = slider.X-slider.VX;
        
      }
      // if ball's X coordinate is within canvas then keep in same direction,  else when ball meets the edges of canvas then change the direction
      if(ball.X+ball.VX+(ball.radius)<=canvas.width && ball.X+ball.VX-(ball.radius)>=0){
        ball.X = ball.X+ball.VX;
      } else {
        ball.VX=-1*ball.VX;
      }
      //if ball's Y coordinate is within canvas
      if(ball.Y+ball.VY+ball.radius<=canvas.height && ball.Y+ball.VY-ball.radius>=0){
        //if ball touches slider:  if slider's Y and and X coordinates matches with ball's. then change ball's Y direction
        if(ball.Y+ball.radius+ball.VY>=slider.Y-(slider.height/2) && ball.Y+ball.radius+ball.VY<=slider.Y &&  ball.X+ball.VX-ball.radius<=slider.X+slider.VX+slider.width/2 && ball.X+ball.VX+ball.radius>=slider.X+slider.VX-slider.width/2){
          ball.VY = -1*ball.VY
          //edge touching for slider
          if(ball.X+ball.VX<=slider.X+slider.VX-slider.width/2 || ball.X+ball.VX>=slider.X+slider.VX+slider.width/2){
            ball.VX=-1*ball.VX
          }
        }
        else{
          ball.Y = ball.Y+ball.VY;
        }
      }
      else{
        if(ball.Y+ball.VY+ball.radius>=canvas.height) {
          stopGame(false);
        } else {
          ball.VY = -1*ball.VY
        }
      }
      
    }
      detectCollision();

      drawTiles(ctx, tileSetting.width, tileSetting.height, tileSetting.color,tileSetting.gutter,tileSetting.columnCount);
      drawSlider(ctx,slider.X,slider.Y, slider.width, slider.height, slider.color);
      drawBall(ctx,ball.X, ball.Y, ball.radius, ball.color);
  }

  function drawTiles(ctx, width, height,bgColor, gutter, columnCount){

    var rowCount = tileSetting.rowCount;
    
    for(var i=0;i< rowCount; i++){
      for(var j=0; j<columnCount;j++){
        if(!tileArr[i][j].isCollided){
          ctx.beginPath();
          ctx.fillStyle=bgColor;
          ctx.fillRect(tileArr[i][j].X, tileArr[i][j].Y, width, height);
          ctx.fill();
        }
      }
    }
  }
  function drawSlider(ctx,X,Y, width, height, bgColor){  

    ctx.beginPath();
    ctx.fillStyle = bgColor;
    ctx.save();
    ctx.translate(X,Y);
    ctx.fillRect(-width/2,-height/2, width,height);
    ctx.restore();
  }

  function drawBall(ctx,X,Y,radius,bgColor){
    var canvasHeight = document.getElementById('canvas').height,
        canvasWidth = document.getElementById('canvas').width;
    ctx.beginPath();
    ctx.fillStyle = bgColor;
    ctx.save();
    ctx.translate(X, Y);
    ctx.arc(0,0,radius,0, 2*Math.PI,true);
    ctx.fill();
    ctx.restore();

  }
  function detectCollision(){
    for(var i=0; i<tileSetting.rowCount;i++){
      for(var j=0; j<tileSetting.columnCount;j++){
        if(ball.X+ball.VX-ball.radius<=tileArr[i][j].X +tileSetting.width && ball.X+ball.VX+ball.radius>=tileArr[i][j].X && ball.Y+ball.VY-ball.radius<=tileArr[i][j].Y+tileSetting.height){
          if(!tileArr[i][j].isCollided){
            tileArr[i][j].isCollided=true;
            ball.VY=-1*ball.VY; 
            incrementCount();
          }
        }
      }
    }
  }

  function incrementCount() {
    score.innerText = +score.innerText +1
   
    if(+score.innerText === totalTiles) {
      stopGame(true);
    }
  }
  function stopGame(isWin) {
    clearInterval(timer);

    backgroundLayer.innerText= isWin?'Congratulations!! You won.':''+'Your score is ' + score.innerText;
    backgroundLayer.classList.remove('is-hidden');
    setTimeout(function(){
      document.location.reload();
    }, 3000);
  }

  function keyDownHandler(e) {
    
      if(e.keyCode == 39) {
          isRightPressed = true;
      }
      else if(e.keyCode == 37) {
          isLeftPressed = true;
      }
  }
  function keyUpHandler(e) {
      if(e.keyCode == 39) {
          isRightPressed = false;
      }
      else if(e.keyCode == 37) {
          isLeftPressed = false;
      }
  }
  buttonStart.focus();
  draw();  
})();
