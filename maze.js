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
    movementKeys = [ 38, 87, 40, 83, 37, 65, 39, 68 ],
    
// label, содержащий лучшее время
    btText = document.getElementById("bt");

// Стартовые операции
window.onload = function() {
  // Подготавливаем холст
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Рисуем фон лабиринта
  loadHard();

  // Получение лучшего результата
  displayBestTime(mazeLoaded);

  // При нажатии клавиши вызываем функцию processKey(e) для перемещения
  // при отпускании вызывается processUpKey(e) для остановки значка
  window.onkeydown = processKey;
  window.onkeyup = processUpKey;
}

// Таймеры и индикаторы состояний 
var timer,
    timerClock,
    mazeLoaded = "hard",
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
  dx = 0;
  dy = 0;

  // Отсчёт времени запускается только после перемещения значка
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

// Проверка столкновения со стеной
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
      // Вывод разного сообщения в зависимости от времени прохождения
      switch (compareWithBestTime([min, sec])) {
        case "equal":
          alert("Твоё время: " + timerText.innerHTML + "\nРекорд повторён!");
          break;
        case "less":
          setBestTime(mazeLoaded, [min, sec]);
          alert("Твоё время: " + timerText.innerHTML + "\nНовый рекорд!");
          break;
        case "more":
          alert("Твоё время: " + timerText.innerHTML + "\nРекорд не побит!");
          break;
      }
      isFinished = true;
      resetTimer();
      displayBestTime(mazeLoaded);
      return;
    }
  }

  // Рисуем следующий кадр через 10 миллисекунд
  timer = setTimeout(drawFrame, 10);
}

var min = 0, // минуты
    sec = 0; // секунды
var timerText = document.getElementById("timer"); // label для отображения таймера

// Обновление значения таймера (раз в секунду)
function tickTime() {
  ++sec;
  // Увеличение значения минут на 1, если дошло до 60 секунд
  // и сброс значения минут
  if (sec == 60) {
    ++min;
    sec = 0;
  }
  // Вывод значений времени на label
  timerText.innerHTML =
    (sec < 10)
    ? `${min}:0${sec}`
    : `${min}:${sec}`;  
}

// Сброс значения таймера
function resetTimer() {
  timerText.innerHTML = "0:00";
  min = 0;
  sec = 0;
  isClockStarted = false;
  clearInterval(timerClock);
}

// Получение значения рекордного времени из localStorage
function getBestTime(maze) {
  let bTime = (localStorage.getItem(maze) === null)
  ? [0, 0]
  : localStorage.getItem(maze).split(",");
  return bTime;
}

// Сравнение времени прохождения с рекордом
function compareWithBestTime(time) {
  let bTime = getBestTime(mazeLoaded);
  // Перевод содержимого массива из строк в числа
  bTime.forEach(function(item, index, array) {
    array[index] = parseInt(item, 10);
  });

  // Нет сохранённого рекорда
  if (bTime[0] == 0 && bTime[1] == 0) {
    return "less";
  }
  else {
    // Время прохождения равно рекорду
    if ((time[0] == bTime[0]) &&
        (time[1] == bTime[1])) {
          return "equal";
        }
    // Время прохождения меньше, чем рекорд (новый рекорд)
    if ((time[0] <= bTime[0]) &&
        (time[1] <= bTime[1])) {
          return "less";
        }
    // Время прохождения больше, чем рекорд
    else return "more";
  }
}

// Отображение рекорда на label
function displayBestTime(maze) {
  let time = getBestTime(maze);
  btText.innerHTML = (time[1] < 10)
  ? `${time[0]}:0${time[1]}`
  : `${time[0]}:${time[1]}`;  
}

// Сохранение рекорда в localStorage
function setBestTime(maze, time) {
  localStorage.setItem(maze, time);
}

// Очистка localStorage
function clearBT() {
  localStorage.clear();
  btText.innerHTML = "--:--";
}

// Загрузка лёгкого лабиринта
function loadEasy() {
  drawMaze('easy_maze.png', 5, 5);
  mazeLoaded = "easy";
  displayBestTime("easy");
  isFinished = false;
  resetTimer();
}

// Загрузка сложного лабиринта
function loadHard() {
  drawMaze('maze.png', 268, 5);
  mazeLoaded = "hard";
  displayBestTime("hard");
  isFinished = false;
  resetTimer();
}

// Рестарт уровня (при нажатии на кнопку рестарта)
function restart() {
  switch (mazeLoaded) {
    case "hard":
      loadHard();
      break;
    case "easy":
      loadEasy();
      break;
  }
}