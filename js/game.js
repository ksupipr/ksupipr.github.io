// класс типа игрока

function Server(host) {
	this._host = host || '192.168.1.7:8080';

	this.logErr = function(a,s,d) {
		log(s);
	}

	this.post = function(method, data, callback, errback) {
		$.ajax({
			method: 'POST', 
			url: 'http://'+this._host+'/'+method, 
			data: data, 
			success: callback, 
			error: errback || this.logErr
		});
	}
	this.get = function(method, data, callback, errback) {
		$.ajax({
			method: 'GET', 
			url: 'http://'+this._host+'/'+method, 
			data: data, 
			success: callback, 
			error: errback || this.logErr
		});
	}
}


// класс игрока
function Player(_name, _type, _secureKey) {
	this.name = _name; // введенное имя игрока
	this.exp = 0; // опыт
	this.score = 0;  // очки рейтинга
	this.type = _type; // тип игрока ... класс

	this.paramNames = {
		type: {
			0: 'Dark Mage',
			1: 'Damned Warrior',
			2: 'Ctulhu Cultist',
			3: 'Dead Avenger',
			4: 'Reality Progger'
		}
	}

	this.level = 0;  //  уровень
    this.wins = 0;
    this.loses = 0;
	this._server = new Server();
	this.secureKey = _secureKey;



	this.gui_obj = []; // масив GUI
	this.gui_obj["name"] = $('#player .name');
	this.gui_obj["exp"] = $('#player .exp');
	this.gui_obj["score"] = $('#player .score');
	this.gui_obj["type"] = $('#player .type');
	this.gui_obj["level"] = $('#player .level');
	this.gui_obj["wins"] = $('#player .wins');
	this.gui_obj["loses"] = $('#player .loses');

	this.register = function(cb) {
		var  self = this;
		this._server.post('register', {name: this.name}, function(d){
           self.setName(d.name);
           self.secureKey = d.secureKey;
           setCookie("name", d.name, 365);
           setCookie("secureKey", d.secureKey, 365);

           $.extend(self, d);
           self.showInfo();
           cb(self);
		});
	}

    this.loadParams = function(cb) {
		var  self = this;
		this._server.get('get', {name: this.name, secureKey: this.secureKey}, function(d){
           $.extend(self, d);
           self.showInfo();
           cb(self);
		});
    }

	// установка нового имени
	this.setName = function(new_name) {
		this.name = new_name;
		this.show('name');
	}
	
	// установка нового type
	this.setType = function(new_type) {
		this.type = new_type;
		this.show('type');
	}
	
	// установка score
	this.setScore = function(new_score) {
		this.score = new_score;
		this.show('score');
	}
	
	// установка добавление значения к score
	this.addScore = function(num) {
		num = num || 1;
		this.score += num;
		this.show('score');
	}
	
	// отображение параметров игрока
	
	this.showParamName = function(nm, tn) {
		return this.paramNames[nm] ? this.paramNames[nm][tn || this[nm]] : this[nm];
	}
	// тип
	this.show = function(nm) {
		this.gui_obj[nm].html( this.showParamName( nm ) );
	}
	
	// всех параметров
	this.showInfo = function() {
		this.show('name');
		this.show('score');
		this.show('type');
		this.show('exp');
		this.show('level');
		this.show('wins');
		this.show('loses');
	}
	
	this.updateAll = function(params) {
		this.wins = params.wins;
		this.loses = params.loses;
		this.level = params.level;
		this.exp = params.exp;
		
		this.showInfo()
	}
	
}


// класс самой игры
var GameClass = {
	player : null, // массив объектов игроков
	_server: new Server(),
	
    constructor: function( callback ) {
	// конструктор, проверяет загружен ли документ и если да, то выполняет стартовую функцию
        var listener = window.addEventListener ? [ "addEventListener", "" ] : 
                                [ "attachEvent", "on" ];

        // проверим, возможно документ загружен
        if ( document.readyState === "complete" ) {
            if ( callback && typeof callback === "function" ) {
                callback.call( this );
            }
            return;
        }
        var self = this;

        // событие на загрузку документа, если документ еще не загружен
        window[ listener[ 0 ] ]( listener[ 1 ] + "load", function() {

            if ( callback && typeof callback === "function" ) {
                callback.call( self );
            }
        }, false );
    },

 	start: function() {
		this.makePlayer()
	},

	

	checkPlayer: function() {
	    var
	    	user = getCookie("name");
        	secureKey = getCookie("secureKey");
	    if (user && secureKey) {
	        this.player = new Player(user, 1, secureKey);
	        this.player.loadParams( this.showFightButton.bind(this) );
	    } else {
	        user = prompt("Enter your name:", "");
	        if (user != "" && user != null) {
	        	this.player = new Player(user, 1);
	        	this.player.register( this.showFightButton.bind(this) );
	        }
	    }
	},

	showFightButton: function() {
		var self = this;
		$('#fightButton').show().click(function() {
			self.goBattle();
		});
		$('#fightButton2').show().click(function() {
			self.goBattle();
		});
	},

	goBattle: function() {
		var self = this;
		this._server.post('game', {name: this.player.name, secureKey: this.player.secureKey}, function(d){
			$('#battleLog').html( d.yourWin ? 'You WIN!!!' : 'You LOSE (').append('</br>').append(''+
				 '<div>Enemy: <span>'+d.enemy.name+'</span></div>'+
				 '<div>Class: <span>'+self.player.showParamName( 'type', d.enemy.type )+'</span></div>'+
				 '<div>Level: <span>'+d.enemy.level+'</span></div>'
			);
			self.player.updateAll( d.you );
           
		});
	},

	makePlayer: function(type, gui_id, name) {
		if (!this.player) {
			this.checkPlayer();
		}
	}
} 

GameClass.constructor(GameClass.start);