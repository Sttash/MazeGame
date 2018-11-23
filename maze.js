// Определяем глобальные переменные для холста и контекста 
var canvas,
    context,

// Отслеживаем текущую позицию значка
    iconX = 0,
    iconY = 0,

// Скорость перемещения значка
    dx = 0,
    dy = 0,

// коды клавиш (wasd и стрелки)
    movementKeys = [ 38, 87, 40, 83, 37, 65, 39, 68 ];

// стартовые операции
window.onload = function() {
  // Подготавливаем холст
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Рисуем фон лабиринта
  drawMaze("maze.png", 268, 5);

  // При нажатии клавиши вызываем функцию processKey(e) для перемещения
  // при отпускании вызывается processUpKey(e) для остановки значка
  window.onkeydown = processKey;
  window.onkeyup = processUpKey;
}

// Таймеры и индикаторы состояний 
var timer,
    timerClock,
    isClockStarted = false,
    isFinished = false;

// Отрисовка 
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
    // Рисуем значок
    iconX = startingX;
    iconY = startingY;

    var imgFace = document.getElementById("face");
    context.drawImage(imgFace, iconX, iconY);
    context.stroke();

    // Рисуем следующий кадр через 10 миллисекунд
    timer = setTimeout(drawFrame, 10);
  };
  imgMaze.src = mazeFile;
}

// Обработка нажатия клавиш
function processKey(e) {
  // Если значок находится в движении, останавливаем его
  //dx = 0;
  //dy = 0;

  // Таймер запускается только после перемещения значка
  if (isClockStarted == false && isFinished == false
    && movementKeys.includes(e.keyCode)) {
    isClockStarted = true;
    timerClock = setInterval(tickTime, 1000);
  }

  // Если нажата стрелка вверх, начинаем двигаться вверх
  if (e.keyCode == 38 || e.keyCode == 87) {dy = -1;}
  // Вниз
  if (e.keyCode == 40 || e.keyCode == 83) {dy = 1;}
  // Влево
  if (e.keyCode == 37 || e.keyCode == 65) {dx = -1;}
  // Вправо
  if (e.keyCode == 39 || e.keyCode == 68) {dx = 1;}
}

// Если клавиша отпущена, движение останавливается
function processUpKey() {
  dx = 0;
  dy = 0;
}

// проверка столкновения со стеной
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

// отрисовка значка и следа
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
      alert("Ты победил!\nТвоё время: " + timerText.innerHTML);
      resetTimer();
      isFinished = true;
      return;
    }
  }

  // Рисуем следующий кадр через 10 миллисекунд
  timer = setTimeout(drawFrame, 10);
}

var minTime = 0, // минуты
    secTime = 1; // секунды
var timerText = document.getElementById("timer"); // label для отображения таймера

// обновление значения таймера (раз в секунду)
function tickTime() {
  // добавление "0" перед значением секунды, если оно < 10
  timerText.innerHTML =
    (secTime < 10)
    ? `${minTime}:0${secTime++}`
    : `${minTime}:${secTime++}`;
  // увеличение значения минут на 1, если дошло до 60 секунд
  // и сброс значения минут
  if (secTime == 60) {
    ++minTime;
    secTime = 0;
  }
}

// сброс значения таймера
function resetTimer() {
  timerText.innerHTML = "0:00";
  minTime = 0;
  secTime = 1;
  isClockStarted = false;
  clearInterval(timerClock);
}

// загрузка лёгкото лабиринта
function loadEasy() {
  drawMaze('easy_maze.png', 5, 5);
  isFinished = false;
  resetTimer();
}

// загрузка сложного лабиринта
function loadHard() {
  drawMaze('maze.png', 268, 5);
  isFinished = false;
  resetTimer();
}
