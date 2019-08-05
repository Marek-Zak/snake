//snake
var games = {};
if (!games.hasOwnProperty("snake")) { 
	games.snake = function() {
		this.init = init;
		var options = {
			size: 15,
			speed: 50,
			direction: 2,
			startTime: null,
			xMax: 65,
			yMax: 39,
			points: 0,
			lives: 0,
			endGame: true,
			endRound: true
		};
		var snakeObj = { segments: [] };
		var artifacts = [];

		//one item = 1% drop rate
		//number = type of item
		//1 - bronze piece + 50pkt	(50%)
		//2 - silver piece + 200pkt	(20%)
		//3 - gold piece + 500pkt	(10%)
		//4 - diamond + 1000pkt		(10%)
		//5 - life - extra life		(5%)
		//6 - trap - lost life		(5%)
		var items = [
						1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6
					];
		var hiScore = 0;
		var clearSnake;
		var randomArt, removeArt, removeArtInit;

		function moveSnake(){
			var now = new Date().getTime();
			var time = now - options.startTime;
			var newSegment = $.extend({},snakeObj.segments[0]);
			

			if (options.direction == 0) {
				newSegment.x--;
			} else if (options.direction == 1) {
				newSegment.y--;
			} else if (options.direction == 2) {
				newSegment.x++;
			} else if (options.direction == 3) {
				newSegment.y++;
			}

			if (newSegment.x > options.xMax || newSegment.x < 0 || newSegment.y > options.yMax || newSegment.y < 0)	{
				//ogrodzenie
				crash();
			} else {
				//wejscie głową w ciało węża
				for (var i = 0; i < snakeObj.segments.length; i++) {
					if (snakeObj.segments[i].x == newSegment.x && snakeObj.segments[i].y == newSegment.y) {
						crash();
						break;
					}
				}

				//czy trafiamy głową na pole z artefaktem
				var bonus = null;
				if (artifacts.length > 0) {
					for (var a = 0; a < artifacts.length; a++) {
						if (snakeObj.segments[0].x == artifacts[a].x && snakeObj.segments[0].y == artifacts[a].y) {
							bonus = $.extend({},artifacts[a]);
							artifacts.splice(a,1);
							break;
						}
					}
				}
				
				//przesunięcie głowy
				snakeObj.segments.unshift(newSegment);
				var x = parseInt(newSegment.x * options.size) + "px";
				var y = parseInt(newSegment.y * options.size) + "px";
				var segmentDiv = "<div style='left: " + x + "; top: " + y +";'></div>";
				$("#game-window").prepend(segmentDiv);

				//przesunięcie ogona
				if (Math.floor(time / (options.speed*20)) <= snakeObj.segments.length-1){
					snakeObj.segments.pop();
					$("#game-window div:last").remove();

					var ls = snakeObj.segments[snakeObj.segments.length-1];
					var pls = snakeObj.segments[snakeObj.segments.length-2];
					var backDirection = pls.x < ls.x ? 0 : (pls.y < ls.y ? 1 : (pls.x > ls.x ? 2 : 3)); 

					if (backDirection == 0) {
						$("#game-window").removeClass("bd1").removeClass("bd2").removeClass("bd3").addClass("bd0");
					} else if (backDirection == 1) {
						$("#game-window").removeClass("bd0").removeClass("bd2").removeClass("bd3").addClass("bd1");
					} else if (backDirection == 2) {
						$("#game-window").removeClass("bd0").removeClass("bd1").removeClass("bd3").addClass("bd2");
					} else if (backDirection == 3) {
						$("#game-window").removeClass("bd0").removeClass("bd1").removeClass("bd2").addClass("bd3");
					}
				}
				
				if (bonus) {
					$("#art-id_" + bonus.showTime).remove();
					addBonus(bonus);
				} 
			}
		}
		
		function addBonus(bonus){
			//1 - bronze piece + 50pkt	(50%)
			//2 - silver piece + 200pkt	(20%)
			//3 - gold piece + 500pkt	(10%)
			//4 - diamond + 1000pkt		(10%)
			//5 - life - extra life		(5%)
			//6 - trap - lost life		(5%)
			switch (bonus.itemType) {
				case 1:
					$("#extra-points").text("+50").show().delay(500).fadeOut("slow", function(){$(this).hide()});
					options.points += 50;
					refreshCounters();
					break;
				case 2:
					$("#extra-points").text("+200").show().delay(500).fadeOut("slow", function(){$(this).hide()});
					options.points += 200;
					refreshCounters();
					break;
				case 3:
					$("#extra-points").text("+500").show().delay(500).fadeOut("slow", function(){$(this).hide()});
					options.points += 500;
					refreshCounters();
					break;
				case 4:
					$("#extra-points").text("+1000").show().delay(500).fadeOut("slow", function(){$(this).hide()});
					options.points += 1000;
					refreshCounters();
					break;	
				case 5:
					$("#extra-life").text("Extra Life").show().delay(500).fadeOut("slow", function(){$(this).hide()});
					options.lives++;
					if (options.lives > 3) {
						$("#header div").eq(2).find("span").html("<span class='heart'></span> x " + options.lives );
					} else if (options.lives == 3) {
						$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='heart'></span>");
					} else if (options.lives == 2) {
						$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='skull'></span>");
					} 
					break;
				case 6:
					$("#extra-life").text("Lost Life").delay(500).show().fadeOut("slow", function(){$(this).hide()});
					if (options.lives == 1) {
						crash();
					} else {
						options.lives--;
						if (options.lives > 3) {
							$("#header div").eq(2).find("span").html("<span class='heart'></span> x " + options.lives );
						} else if (options.lives == 3) {
							$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='heart'></span>");
						} else if (options.lives == 2) {
							$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='skull'></span>");
						} else if (options.lives == 1) {
							$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='skull'></span><span class='skull'></span>");
						} 	
					}
					break;	
			}
		}
		
		function drawSnake(){
			$.each(snakeObj.segments, function(i, segment){
				var x = parseInt(segment.x * options.size) + "px";
				var y = parseInt(segment.y * options.size) + "px";
				var segmentDiv = "<div style='left: " + x + "; top: " + y +";'></div>";
				$("#game-window").append(segmentDiv);
			});
		}
		function animateSnake(){
			options.animate = setInterval(function(){
				moveSnake();
				refreshPoints();
			}, options.speed);
		}
		function refreshPoints(clear){
			if (clear) {
				options.points = 0;
				$("#header div").eq(0).find("span").text("000000000000");
			} else {
				options.points += 3;
				refreshCounters();
			}
		}
		function refreshCounters(){
			var pointsStr = options.points.toString();
			var counterStr = $("#header div").eq(0).find("span").text();
			var pointsStrLen = pointsStr.length;

			for (var c = 11; c >= 1; c--) {
				counterStr = counterStr.substr(0, c) + (pointsStr.charAt(-12 + c + pointsStrLen) || "0") + counterStr.substr(c + 1);
			}
			$("#header div").eq(0).find("span").text(counterStr);

			if (hiScore < options.points) {
				hiScore = options.points;
				$("#header div").eq(1).find("span").text(counterStr);
			}
		}
		
		function crash(){
			//zatrzymujemy grę
			clearInterval(options.animate);
			//zatrzymujemy losowanie artefaktów
			clearInterval(randomArt);
			clearInterval(removeArt);
			clearTimeout(removeArtInit);
			
			//dodajemy efekt crash na snake-a
			$("#game-window").addClass("crash");
			//ustawiamy flage kośca rundy
			options.endRound = true;
			//odejmujemy jedno życie z puli
			options.lives--;
			if (options.lives > 3) {
				$("#header div").eq(2).find("span").html("<span class='heart'></span> x " + options.lives );
			} else if (options.lives == 3) {
				$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='heart'></span>");
			} else if (options.lives == 2) {
				$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='skull'></span>");
			} else if (options.lives == 1) {
				$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='skull'></span><span class='skull'></span>");
			} else if (options.lives == 0) {
				$("#header div").eq(2).find("span").html("<span class='skull'></span><span class='skull'></span><span class='skull'></span>");
			}
			//sprawdzamy warunek na zakończenie gry
			if (options.lives == 0) {
				//ustawiamy flagę końca gry
				options.endGame = true;
			}
			//wymazywanie snake-a
			clearSnake = setInterval(removeLastElement, 50);
		}
		function gameOver() {
			$("#game-over").show();
			//można dodać możliwość "wpisu"
			//gdy zamierzeamy zapisywać najlepsze wyniki
		}
		function newGame() {
			//usuwamy napis "Game Over"
			$("#game-over").hide();
			//ustawiamy poczatkową ilość żyć			
			options.lives = 3;
			//czyścimy listę artefaktów
			artifacts = [];
			$("#items-window div").html("");
			$("#header div").eq(2).find("span").html("<span class='heart'></span><span class='heart'></span><span class='heart'></span>");
			//zerujemy punkty
			refreshPoints(true);
			//zerujemy flagę zakończenia gry
			options.endGame = false;
			//startujemy nową runde gry
			newRound();
		}
		function newRound(){
			clearInterval(clearSnake);
			//czyścimy okno gry
			$("#game-window").removeClass("crash").html("");
			//ustawiamy poczatkową dlugość i pozycję snake-a
			snakeObj.segments = [{
				x: 33, y: 20
			}, {
				x: 32, y: 20
			}];
			//ustawiamy domyślny kierunek
			options.direction = 2;
			$("#game-window").attr("class", "d2");
			//rysujemy snake-a
			drawSnake();
			//zerujemy flagę zakończenia rundy
			options.endRound = false;
			//ustawiamy czas startu rundy
			options.startTime = new Date().getTime();
			//uruchamiamy grę
			animateSnake();
			randomArtifacts();
		}
		function randomArtifacts(){
			randomArt = setInterval(function(){
				var artifact = getNewArtifact();
				artifact.showTime = (new Date()).getTime();
				artifacts.push(artifact);	
				drawArtifact(artifact);
			}, 15000);
			removeArtInit = setTimeout(function(){
				removeArt = setInterval(function(){
					for (var a = 0; a < artifacts.length; a++){
						if ((new Date()).getTime() - artifacts[a].showTime > 20000) {
							$("#art-id_" + artifacts[a].showTime).remove();
							artifacts.splice(a, 1);
						} else {
							break;
						}
					}
				}, 200);
			}, 1000);
		}
		function checkArtifact(art){
			var checStatus = true;
			for(var s = 0; s < snakeObj.segments.length; s++){
				if (snakeObj.segments[s].x == art.x && snakeObj.segments[s].y == art.y) {
					return false;		
				}
			}
			for(var a = 0; a < artifacts.length; a++){
				if (artifacts[a].x == art.x && artifacts[a].y == art.y) {
					return false;		
				}
			}
			return true;
		}
		function drawArtifact(art){
			var x = parseInt(art.x * options.size) + "px";
			var y = parseInt(art.y * options.size) + "px";
			var artifactDiv = "<div id='art-id_"+art.showTime+"' class='a" + art.itemType + "' style='left: " + x + "; top: " + y +";'></div>";
			$("#items-window>div").append(artifactDiv);
		}
		function getNewArtifact(){
			var artifact = {
				itemType: items[Math.floor(Math.random() * 100)],
				x: Math.floor(Math.random() * (options.xMax+1)),
				y: Math.floor(Math.random() * (options.yMax+1))
			}
			if(checkArtifact(artifact)){
				return artifact;
			} else {
				return getNewArtifact();
			}
		}
		function removeLastElement(){
			$("#game-window").removeClass("bd0").removeClass("bd1").removeClass("bd2").removeClass("bd3");
			$("#game-window > div:last").fadeOut(10, function(){
				$(this).remove();
				if ($("#game-window > div").length == 0) {
					clearInterval(clearSnake);
					if (options.endGame === true) {
						//uruchamiamy funkcje zakończenia gry
						gameOver();
					}
				}
			});
		}
		function init(){
			//inicjujemy klawiaturę
			$(window).on("keydown", function(e){
				if (e.keyCode == 32) {
					//spacja
					if (options.endGame) {
						newGame();
					} else if (options.endRound) {
						newRound();
					}
				} else if (e.keyCode == 37 && options.endRound === false) {
					//strzałka w lewo
					$("#game-window").removeClass("d1").removeClass("d2").removeClass("d3").addClass("d0");
					options.direction = 0;
				} else if (e.keyCode == 38 && options.endRound === false) {
					//strzałka w górę
					$("#game-window").removeClass("d0").removeClass("d2").removeClass("d3").addClass("d1");
					options.direction = 1;
				} else if (e.keyCode == 39 && options.endRound === false) {
					//strzałka w prawo
					$("#game-window").removeClass("d0").removeClass("d1").removeClass("d3").addClass("d2");
					options.direction = 2;
				} else if (e.keyCode == 40 && options.endRound === false) {
					//strzałka w dół
					$("#game-window").removeClass("d0").removeClass("d1").removeClass("d2").addClass("d3");
					options.direction = 3;
				}
			});
		}
	}
}

var snake;
$(document).ready(function(){
	snake = new games.snake;	
	snake.init();
});

