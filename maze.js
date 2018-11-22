// Определяем глобальные переменные для холста и контекста 
var canvas;
var context;

// Отслеживаем текущую позицию значка
var iconX = 0;
var iconY = 0;

// Скорость перемещения значка
var dx = 0;
var dy = 0;

window.onload = function() {
  // Подготавливаем холст
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Рисуем фон лабиринта
  drawMaze("maze.png", 268, 5);

  // При нажатии клавиши вызываем функцию processKey(e)
  // при отпускании вызывается processUpKey(e)
  window.onkeydown = processKey;
  window.onkeyup = processUpKey;
}

// Таймер, включающий и отключающий новый лабиринт в любое время
var timer;

function drawMaze(mazeFile, startingX, startingY) {
  // Остановить таймер (если запущен)
  clearTimeout(timer);

  // Остановить перемещение значка
  dx = 0;
  dy = 0;

  // Загружаем изображение лабиринта
  var imgMaze = new Image;
  
  imgMaze.onload = function() {
  // Изменяем размер холста в соответствии 
	// с размером изображения лабиринта
    canvas.width = imgMaze.width;
    canvas.height = imgMaze.height;

    // Рисуем лабиринт
    context.drawImage(imgMaze, 0,0);
    //imgMaze.appendChild(canvas);
    // Рисуем значок
    iconX = startingX;
    iconY = startingY;

    var imgFace = document.getElementById("face");
    context.drawImage(imgFace, iconX, iconY);
    context.stroke();

    // Рисуем следующий кадр через 10 миллисекунд
    timer = setTimeout(drawFrame, 10);
  };
  //imgMaze.crossOrigin = "Anonymous";
  imgMaze.src = mazeFile;
}

// Обработка нажатия клавиш
function processKey(e) {
  // Если значок находится в движении, останавливаем его
  dx = 0;
  dy = 0;

  // Если нажата стрелка вверх, начинаем двигаться вверх
  if (e.keyCode == 38) {dy = -1;}
  // Вниз
  if (e.keyCode == 40) {dy = 1;}
  // Влево
  if (e.keyCode == 37) {dx = -1;}
  // Вправо
  if (e.keyCode == 39) {dx = 1;}
}

// Если клавиша отпущена, движение останавливается
function processUpKey(e) {
  dx = 0;
  dy = 0;
}

function checkForCollision() {
  // Перебираем все пикселы и инвертируем их цвет
  var imgData = context.getImageData(iconX-1, iconY-1, 15+2, 15+2);
  var pixels = imgData.data;

  // Получаем данные для одного пиксела
  for (let i = 0; n = pixels.length, i < n; i += 4) {
    var red = pixels[i];
    var green = pixels[i+1];
    var blue = pixels[i+2];
    var alpha = pixels[i+3];

    // Смотрим на наличие черного цвета стены, что указывает на столкновение
    if (red == 0 && green == 0 && blue == 0) {
      return true;
    }
    // Смотрим на наличие серого цвета краев, что указывает на столкновение
    if (red == 169 && green == 169 && blue == 169) {
      return true;
    }
  }
  // Столкновения не было
  return false;
}


function drawFrame() {
  // Обновляем кадр только если значок движется
  if (dx != 0 || dy != 0) {
    // Закрашиваем перемещение значка желтым цветом
    context.beginPath();
    context.fillStyle = "rgb(254,244,207)";
    context.rect(iconX, iconY, 15, 15);
    context.fill()

    // Обновляем координаты значка, создавая перемещение
    iconX += dx;
    iconY += dy;

    // Проверка столкновения со стенками лабиринта
	  // (вызывается доп. функция)
    if (checkForCollision()) {
      iconX -= dx;
      iconY -= dy;
      dx = 0;
      dy = 0;
    }

    // Перерисовываем значок
    var imgFace = document.getElementById("face");
    context.drawImage(imgFace, iconX, iconY);

    // Проверяем дошел ли пользователь до финиша.
	  // Если дошел, то выводим сообщение
    if (iconY > (canvas.height - 17)) {
      alert("Ты победил!");
      return;
    }
  }

  // Рисуем следующий кадр через 10 миллисекунд
  timer = setTimeout(drawFrame, 10);
}

function loadEasy() {
  drawMaze('easy_maze.png', 5, 5);
}

function loadHard() {
  drawMaze('maze.png', 268, 5);
}
