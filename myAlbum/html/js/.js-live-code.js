/*jslint browser: true*/
/*jslint indent: 2 */
/*jslint plusplus: true */
/*global $, jQuery, init, initSmartObject, initObjects, stopRotate, SmartObject, dragStart, startRotate, getObjectCentre, rotateObject, alert*/


/*$(function () {
	
	$('.draggable').draggable({
		containment: "parent"
	});
	$('.resizable').resizable({
		aspectRatio: "true",
		handles: "ne, se, nw, sw"
	});
	
});*/

var newImageZIndex = 1; // Чтобы последний загруженый объект распологался сверху
var loaded = false;	// Для предотвращения запуска инициализации initObjects() дважды
var objectBeingRotated = false; // Объект DOM, который вращается в текущий момент
var mouseStartAngle = false;	// Угол отклонения положения мыши от центра изодражения в начале вращения
var objectStartAngle = false; // Угол поворота объекта в начале вращения
var workSpace = $('.workSpace'); // Кэш рабочего пространства
var newObjectId = 0;

// Когда документ загружен инициализируем рабочую область
$(init);

function init() {
  "use strict";
  var preloadWorkSpace = $('.preloadWorkSpace img');
  preloadWorkSpace.load(initObjects());

  // Код для браузеров, которые не запускают события загрузки для кешированных изображений
  //if(preloadWorkSpace.get(0).complete) $(preloadWorkSpace).trigger("load");
}

// Устанавливаем каждый объект на рабочую область
function initObjects() {
  "use strict";
  // Убеждаемся, что функция не запущена дважды
  if (loaded) {
    return;
  }
  loaded = true;

  // Изображение рабочей области загружено
  $("<div/>", {
    "class": "workSpace_filter"
  }).appendTo(workSpace);
  $('.workSpace').fadeIn('fast');

  // Добавляем обработчик события для остановки вращения, когда кнопка мыши будет отпущена
  $(document).mouseup(stopRotate);



  // Обрабатываем каждый объект
  $('.oldSmartObject').each(function (index) {
console.log(oldSmartObject)

    var currentObject = new SmartObject(newObjectId++, $($(this).children().get(0))),
    //currentObject.content = $(this).children().get(0);


    // Устанавливаем случайное положение и угол поворота для объекта
    // TODO заменить на загрузку начального положения
      left = Math.floor(Math.random() * 450 + 100),
      top = Math.floor(Math.random() * 100 + 100),
      angle = Math.floor(Math.random() * 60 - 30);
    $(this).css('left', left + 'px');
    $(this).css('top', top + 'px');
    $(this).css('transform', 'rotate(' + angle + 'deg)');
    $(this).css('-moz-transform', 'rotate(' + angle + 'deg)');
    $(this).css('-webkit-transform', 'rotate(' + angle + 'deg)');
    $(this).css('-o-transform', 'rotate(' + angle + 'deg)');
    $(this).data('currentRotation', angle * Math.PI / 180);

    // Делаем объект перемещаемым
    // TODO перенсти на кнопку
    $(this).draggable({ containment: 'parent', stack: '.smatrObject', cursor: 'pointer', start: dragStart() });

    // Делаем объект способным вращаться
    $(this).mousedown(startRotate);

	
    // Вызываем лайтбокс, когда на фотографии объекта нажимают кнопку мыши
    //$(this).bind( 'click', function() { openLightbox( this ) } );

    // Прячем объект в случае если он еще не загружен до конца
    $(this).hide();

    // После окончания загрузки изображения объекта...
    if ($(this).children().load()) {

    // (Убеждаемся, что функция не запущена дважды)
      if ($(this).data('loaded')) {
        return;
      }
      $(this).data('loaded', true);

      // Записываем реальные размеры объекта
			var objectWidth = $(this).width(),
        objectHeight = $(this).height() - 3; // хз почему и где появляются лишние 3px у врапера, но тут я их убираю

      $(this).children().each(function (index, elem) {
        $(elem).load(function () {
          var elemWidth = $(elem).width(),
            elemHeight = $(elem).height();
          $(elem).css('width', elemWidth * 1.5);
          $(elem).css('height', elemHeight * 1.5);
          $(elem).css('opacity', 0);
          $(elem).css('z-index', newImageZIndex);
          $(elem).animate({ width: elemWidth, height: elemHeight, opacity: 1 }, 1200);
        });
      });
      // Делаем объект больше, так что он будет выглядеть значительно больше рабочей области
      $(this).css('width', objectWidth * 1.5);
      $(this).css('height', objectHeight * 1.5);
      // $("img", this).get(0).css( 'width', objectWidth * 1.5 );
      // $("img", this).get(0).css( 'height', objectHeight * 1.5 );

      // Делаем его полностью прозрачным
      $(this).css('opacity', 0);
      $(this).show();

      // Устанавливаем z-index больше, чем у объектов, уже размещенных на столе
      $(this).css('z-index', newImageZIndex++);

      // Постепенно уменьшаем размеры объекта до нормальных размеров и одновременно уменьшаем его прозрачность
      $(this).animate({ width: objectWidth, height: objectHeight, opacity: 1 }, 1200);
    }

    // Код для браузеров, которые не запускают события загрузки для кешированных изображений
    if (this.complete) {
      $(this).trigger("load");
    }

  });

  var testObject = new SmartObject(19);
  
}

// Предотвращаем перетаскивание изображения, если оно уже вращается

function dragStart(e, ui) {
  "use strict";
  if (objectBeingRotated) {
    return false;
  }
}

function startRotate(e) {
  "use strict";
  // Выходим, если клавиша shift не удерживается, когда кнопка мыши нажата
  if (!e.shiftKey) {
    return;
  }

  // Изображение, которое будет вращаться
  /* jshint validthis: false */
  objectBeingRotated = e.currentTarget;

  // Сохраняем начальное значение угла положения курсора мыши относительно центра изображения
  var objectCentre = getObjectCentre(objectBeingRotated),
    mouseStartXFromCentre = e.pageX - objectCentre[0],
    mouseStartYFromCentre = e.pageY - objectCentre[1];
  mouseStartAngle = Math.atan2(mouseStartYFromCentre, mouseStartXFromCentre);

  // Сохраняем текущее значение угла поворота изображения
  objectStartAngle = $(objectBeingRotated).data('currentRotation');

  // Устанавливаем обработчик события для вращения изображения перемещениями курсора мыши
  $(document).mousemove(rotateObject);


  return false;
}

function stopRotate(e) {
  "use strict";
  // Выходим, если изображение не вращалось
  if (!objectBeingRotated) {
    return;
  }
  // Удаляем обработчик события, который отслеживал пермещения курсора мыши во время вращения
  $(document).unbind('mousemove');

  // Сбрасываем флаг вращения устанавливая перменной imageBeingRotated значение false.
  // Делаем это с небольшой задержкой - после генерации события click -
  // для предотвращения появления лайтбокса, как только клавищу Shift отпустят.
  setTimeout(function () { objectBeingRotated = false; }, 10);
  return false;
}

function rotateObject(e) {
  "use strict";
  // Выходим, если процесс вращения не запущен
  if (!e.shiftKey) {
    return;
  }
  if (!objectBeingRotated) {
    return;
  }

  // Вычисляем новый угол положения курсора мыши относительно центра изображения
  var objectCentre = getObjectCentre(objectBeingRotated),
    mouseXFromCentre = e.pageX - objectCentre[0],
    mouseYFromCentre = e.pageY - objectCentre[1],
    mouseAngle = Math.atan2(mouseYFromCentre, mouseXFromCentre),

  // Вычисляем новый угол поворота изображения
    rotateAngle = mouseAngle - mouseStartAngle + objectStartAngle;

  // Поворачиваем изображение на новый угол и сохраняем его значение
  $(objectBeingRotated).css('transform', 'rotate(' + rotateAngle + 'rad)');
  $(objectBeingRotated).css('-moz-transform', 'rotate(' + rotateAngle + 'rad)');
  $(objectBeingRotated).css('-webkit-transform', 'rotate(' + rotateAngle + 'rad)');
  $(objectBeingRotated).css('-o-transform', 'rotate(' + rotateAngle + 'rad)');
  $(objectBeingRotated).data('currentRotation', rotateAngle);
  return false;
}

function getObjectCentre(object) {
  "use strict";
  // Поворачиваем изображение к углу 0 радиан
  $(object).css('transform', 'rotate(0rad)');
  $(object).css('-moz-transform', 'rotate(0rad)');
  $(object).css('-webkit-transform', 'rotate(0rad)');
  $(object).css('-o-transform', 'rotate(0rad)');

  // Вычисляем центр изображения
	var objectOffset = $(object).offset(),
    objectCentreX = objectOffset.left + $(object).width() / 2,
    objectCentreY = objectOffset.top + $(object).height() / 2,

  // Поворачиваем изображение обратно к исходному углу
    currentRotation = $(object).data('currentRotation');
  $(objectBeingRotated).css('transform', 'rotate(' + currentRotation + 'rad)');
  $(objectBeingRotated).css('-moz-transform', 'rotate(' + currentRotation + 'rad)');
  $(objectBeingRotated).css('-webkit-transform', 'rotate(' + currentRotation + 'rad)');
  $(objectBeingRotated).css('-o-transform', 'rotate(' + currentRotation + 'rad)');

  // Возвращаем вычисленные координаты центра
  return [objectCentreX, objectCentreY];
}


