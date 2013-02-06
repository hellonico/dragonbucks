// enchant.js本体やクラスをエクスポートする
enchant();

// REF
// http://downloads.khinsider.com/game-soundtracks/album/namco-x-capcom
// http://jsdo.it/nakakaz11/eeAt
// http://jsdo.it/nicekumo1/btW8
// http://www.slideshare.net/godaihori/enchantjs-15833276

function rand(num) {
    return Math.floor(Math.random()*num);
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// コインを作成するクラス
var Coin = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 32, 32);
    this.x = x;
    this.y = y;
    this.image = core.assets['piece.png'];
    this.tick = 0;
    this.frame = 0;

    this.anime = [8, 9, 10, 11];
    this.addEventListener('enterframe', function() {
      if (this.tick <= 8) {
        this.frame = this.tick;
      } else {
        this.frame = this.anime[this.tick % 4];
      }
      this.tick++;
    });
  }
}); 

var Player = enchant.Class.create(enchant.Sprite, {

  moveToward: function(person, velocity) {
      if(velocity == undefined) velocity=1;

      this.tick ++;

      if(this.tick < 50)  {

      if(person.x > this.x) {
        this.x += velocity;
        this.movingRight();
      } else {
        this.x -= velocity;
        this.movingLeft();
      }

      } else {
        if(person.y < this.y) {
        this.y -= velocity;
        this.movingUp();
      } else {
        this.y += velocity;
        this.movingDown();
      }
      }

      if(this.tick > 100) this.tick=0;

      
  }, 

  movingUp: function() {
    this.frame = this.tick % 3 + 12 + this.characters * 24;
  },
  movingLeft: function() {
    this.frame = this.tick % 3 + 6 + this.characters * 24;
  }, 
  movingRight: function() {
    this.frame = this.tick % 3 + 18 + this.characters * 24;
  },
  movingDown: function() {
    this.frame = this.tick % 3 + this.characters * 24;
  },

  initialize: function(x, y, c, bad) {
    enchant.Sprite.call(this, 24, 32);

    this.x = x;
    this.y = y;
    this.bad = bad;
    this.characters = c;
    this.image = core.assets['characters.png'];
    this.frame = this.characters * 24;
    this.tick = 0;

    // 「touchmove」イベントが発生したときに実行するリスナを登録する
    this.addEventListener('touchmove', function(e) {
      // スプライトをタッチして移動した場所、またはドラッグした場所に移動する
      this.x = e.x - this.width / 2;
      this.y = e.y - this.height / 2;
    });

    this.addEventListener('enterframe', function(e) {
      if(this.bad) return false;

      if (core.input.left) {
        this.x -= 4;
        this.movingLeft();
        this.tick ++;
      } 
      if (core.input.right) {
        this.x += 4;
        this.movingRight();
        this.tick ++;
      }
      if (core.input.up) {
        this.y -= 4;
        this.movingUp();
        this.tick ++;
      }
      if (core.input.down) {
        this.y += 4;
        this.movingDown();
        this.tick ++;
      }
      
    });

   }
});

// ページが読み込まれたときに実行される関数
window.onload = function() {

  core = new Core(500, 320);
  core.fps = 16;
  core.preload('characters.png','valkyrie.mp3', 'piece.png', 'departed.mp3');
  
  core.bgm2 = Sound.load('departed.mp3');
  core.bgm = Sound.load('valkyrie.mp3');

  core.onload = function() {

    core.bgm.volume = 0.5;
    core.bgm.play();

    var image = new Surface(520, 320);
    // 「flowers.png」の(0, 96)の位置から幅「126」ピクセル、高さ「64」ピクセルの領域を
    // サーフィスの(64, 64)の位置に幅「126」ピクセル、高さ「64」ピクセルで描画する
    // image.draw(core.assets['flowers.png'], 0, 96, 126, 64, 64, 64, 126, 64);
    
    // サーフィスを表示するためのスプライトを作成する
    var bg = new Sprite(320, 320);
    // スプライトにサーフィスを設定する
    bg.image = image;
    
    core.rootScene.addChild(bg);

    var player = new Player(120, 50, 3);
    core.rootScene.addChild(player);

    var infoLabel = new Label('Dragon Quest Variation');
    infoLabel.x = 16;
    infoLabel.y = 0;
    infoLabel.color = '#0000FF';
    infoLabel.font ='14px Verdana';
    core.rootScene.addChild(infoLabel);

    var scoreLabel = new ScoreLabel(16, 20);
    scoreLabel.score = 0;
    core.rootScene.addChild(scoreLabel);

    // コイン生成処理
    var coins = [];
    var enemies = [];
    var coinsLeft = 0; 
    var enemyCount = 0;

    restartGame(enemies, coins);
    

    core.rootScene.addEventListener('enterframe', function(e) {
      for (var j in enemies) {
        // alert(enemies[i]);
        if(player.within(enemies[j],10)) {
          endGame(false);  
        }
        try {
          enemies[j].moveToward(player,2);
        } catch(e) {}
      }

      for (var i in coins) {
        try {
        if (player.within(coins[i], 20)) {
          // alert("coin");
          core.score = scoreLabel.score += 100;

          core.rootScene.removeChild(coins[i]);
          delete coins[i];
          coinsLeft--;
          if(coinsLeft <= 0) {
            endGame(true);
          }
         }
       } catch(e) {
        console.log(e)
       }
      }

    });

    function restartGame() {
      for(var k in enemies) {
        core.rootScene.removeChild(enemies[k]);
      }
      enemies = [];
      coins = [];
      enemyCount ++;
    
    var newCoins = rand(10)+1;
    for (var i = 0; i < newCoins; i++) {
      var coin = new Coin(rand(320), rand(120) + 16 *i);
      core.rootScene.addChild(coin);
      coins.push(coin);
    }
    coinsLeft = coins.length;

      for (var i = 0; i < enemyCount; i++) {
        var enemy = new Player(rand(360), rand(320), 13 + rand(3), true);
        core.rootScene.addChild(enemy);
        enemies[i] = enemy;
      }

    }

    function endGame(win) {
      if(win) {
        restartGame();
      } else {
        core.bgm.pause();
        core.bgm2.play();
        core.stop();
      }
    }

  }

  core.start();
}
