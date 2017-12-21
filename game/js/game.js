window.addEventListener("load", function(){
    game.init();
});

var game = {

    // store current game state = intro, wait for firing, firing, fired, load next hero, success,failure
    
    mode: "intro",

    slingshotX: 140,
    slingshotY: 280,
    slingshotBandX: 140 +55,
    slingshotBandY: 280 +23,
    
    ended: false,
    score: 0,

  

    offsetLeft: 0,

    start: function(){
        game.hideScreens();
        game.showScreen("gamecanvas");
        game.showScreen("scorescreen");
        
        game.mode = "intro";
        game.currentHero = undefined;

        game.offsetLeft = 0;
        game.ended = false;
        game.aniomationFrame = window.requestAnimationFrame(game.animate,game.canvas);
    },

    maxSpeed: 3,

    panTo:function(newCenter){
        if (Math.abs(newCenter-game.offsetLeft-game.canvas.width/4)>0 
            && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset){
        
            var deltaX = Math.round((newCenter-game.offsetLeft-game.canvas.width/4)/2);
            if (deltaX && Math.abs(deltaX)>game.maxSpeed){
                deltaX = game.maxSpeed*Math.abs(deltaX)/(deltaX);
            }
            game.offsetLeft += deltaX; 
        } else {
            
            return true;
        }
        if (game.offsetLeft <game.minOffset){
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset){
            game.offsetLeft = game.maxOffset;
            return true;
        }        
        return false;
    },


    handleGameLogic: function(){
        if(game.mode=="intro"){        
            if(game.panTo(700)){
                game.mode = "load-next-hero";
            }             
        }       

        if(game.mode=="wait-for-firing"){  
            if (mouse.dragging){
				game.panTo(mouse.x + game.offsetLeft)
            } else {
                game.panTo(game.slingshotX);
            }
        }
		
		if (game.mode=="load-next-hero"){
			// TODO: 
			// Check if any villains are alive, if not, end the level (success)
			// Check if there are any more heroes left to load, if not end the level (failure)
			// Load the hero and set mode to wait-for-firing
			game.mode="wait-for-firing";			
		}
		
		if(game.mode == "firing"){  
            game.panTo(game.slingshotX);
        }
        
		if (game.mode == "fired"){
			// TODO:
			// Pan to wherever the hero currently is
		}
    },

    animate:function(){
        // Animate the background
       game.handleGameLogic();
       
       // Animate the characters
     	
        
        //  Draw the background with parallax scrolling
        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,640,480,0,0,640,480);
        game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);
        

        // Draw the slingshot
        game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
		
		game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

      	if (!game.ended){
			game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
		}	
    },
    // start initializing objects, prealoading assets and display starts screen
    init: function(){
        // get handler for game canvas and context
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");

        // intialize objects
        levels.init();
        loader.init();
        mouse.init();

        // hide all game layers and display the start screen
        game.hideScreens();
        game.showScreen("gamestartscreen");
        //game.showScreen("levelselectscreen")
    },

    //
    hideScreens: function(){
            var screens = document.getElementsByClassName("gamelayer");

            for(let i = screens.length -1; i >= 0; i--){
                var screen = screens[i];
                screen.style.display = "none";
            }

    },

    hideScreen: function(id){
        var screen = document.getElementById(id);
        screen.style.display = "none";
        
    },

    showScreen: function(id){
        var screen = document.getElementById(id);
        screen.style.display = "block";
        console.log("show display:" + id);
    },

    showLevelScreen: function(){
        game.hideScreens();
        game.showScreen("levelselectscreen");
    }

};

var levels = {
    // level data
    data:[{ // first level
        foreground: 'desert-foreground',
        background: 'clouds-background',
        entities: []
    }, { // second level
        foreground: 'desert-foreground',
        background: 'clouds-background',
        entities: []
    }, { // second level
        foreground: 'desert-foreground',
        background: 'clouds-background',
        entities: []
    }],

    init: function(){
        var levelSelectScreen = document.getElementById("levelselectscreen");

        // an event handler to call
        var buttonClickHandler = function(){
            game.hideScreen("levelselectscreen");
            levels.load(this.value -1);
        };

        for (let i = 0; i < levels.data.length; i++){
            var button = document.createElement("input");

            button.type = "button";
            button.value = (i+1);
            button.addEventListener("click", buttonClickHandler);
            levelSelectScreen.appendChild(button);
        }
    },

        // Load all data and images for a specific level
        load:function(number){
            
                    // declare a new current level object
                    game.currentLevel = {number:number,hero:[]};
                    game.score=0;
                    document.getElementById("score").innerHTML = "Score: " + game.score;
                    var level = levels.data[number];
            
                    //load the background, foreground and slingshot images
                    game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
                    game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
                    game.slingshotImage = loader.loadImage("images/slingshot.png");
                    game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");
            
                    //Call game.start() once the assets have loaded
                    if(loader.loaded){
                        game.start()
                    } else {
                        loader.onload = game.start;
                    }
        }

};

var loader = {
    loaded: true,
    loadedCount: 0,
    totalCount: 0,

    init: function(){
        // check for sound support
        var mp3Support, oggSupport;
        var audio = document.createElement("audio");

        if(audio.canPlayType){
            mp3Support = "" !== audio.canPlayType("audio/mpeg");
            oggSupport = "" !== audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        } else {
            mp3Support = false;
            oggSupport = false;
        }

        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage: function(url){
        this.loaded = false;
        this.totalCount++;

        game.showScreen("loadingscreen");

        var image = new Image();

        image.addEventListener("load", loader.itemloaded, false);
        image.src = url;
        return image;
    },

    soundFileExtn: ".ogg",

    loadSound: function(url){
        this.loaded = false;
        this.totalCount++;

        game.showScreen("loadingscreen");

        var audio = new Audio();
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        audio.src = url + loader.soundFileExtn;

        return audio;
    },

    itemloaded: function(ev){
        ev.target.removeEventListener(ev.type,loader.itemloaded,false);
        loader.loadedCount++;

        document.getElementById("loadingmessage").innerHTML = "loaded " +loader.loadedCount + " of" + loader.totalCount;

        if(loader.loadedCount === loader.totalCount){
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            game.hideScreen("loadingscreen");

            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
};

var mouse = {
    x: 0,
    y: 0,
    down:false,
    dragging:false,

    init: function(){
        var canvas = document.getElementById("gamecanvas");

        canvas.addEventListener("mousemove", mouse.mousemovehandler, false);
        canvas.addEventListener("mousedown", mouse.mousedownhandler, false);
        canvas.addEventListener("mouseup", mouse.mouseuphandler, false);
        canvas.addEventListener("mouseout", mouse.mouseuphandler, false);
    },

    mousemovehandler: function(ev){
        var offset = game.canvas.getBoundingClientRect();

        mouse.x = ev.clientX - offset.left;
        mouse.y = ev.lcientY - offset.top;

        if (mouse.down){
            mouse.dragging = true;
        }

        ev.preventDefault();
    },

    mousedownhandler: function(ev){
        mouse.down = true;

        ev.preventDefault();
    },

    mouseuphandler: function(ev){
        mouse.down = false;
        mouse.dragging = false;
        ev.preventDefault();
    }
};

