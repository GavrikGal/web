/*jslint plusplus: true */
/*global $, jQuery, init, initSmartObject, initObjects, stopRotate, SmartObject, dragStart, startRotate, getObjectCentre, rotateObject, newImageZIndex, workSpace, alert*/

function SmartObject(id, content) {
  "use strict";
  this.id = id;
  this.workSpace = workSpace;
  this.draggableWrapper = $("<div/>", {
    "class" : "draggableWrapper"
  }).appendTo(this.workSpace);
  this.wrapper = $("<div/>", {
    "class" : "smartObject light_border"
  }).appendTo(this.draggableWrapper);

  this.content = $("<div/>", {
    "class" : "smartStartContent"
  });

  if (content !== undefined) {
    this.content.remove();
    this.content = content.clone();
  }

  this.content.appendTo(this.wrapper);

  initSmartObject(this.wrapper, this.draggableWrapper);
	
  this.objectWidth = this.content.width();
  this.objectHeight = this.content.height();
  this.wrapper.width(this.objectWidth);
  this.wrapper.height(this.objectHeight);
  this.content.css('width', '100%');
  this.content.css('height', '100%');
  this.objectCurrentRotation = $(this.wrapper).data('currentRotation');

  this.width = function () {
    return this.objectWidth;
  };
  this.height = function () {
    return this.objectHeight;
  };
  this.currentRotation = function () {
    return this.objectCurrentRotation;
  };
}

function initSmartObject(wrapper, draggableWrapper) {
	"use strict";
	// Устанавливаем случайное положение и угол поворота для объекта
	// TODO заменить на загрузку начального положения
	var left = Math.floor(Math.random() * 450 + 100),
		top = Math.floor(Math.random() * 100 + 100),
		angle = Math.floor(Math.random() * 60 - 30);
	$(draggableWrapper).css('left', left + 'px');
	$(draggableWrapper).css('top', top + 'px');
	$(wrapper).css('transform', 'rotate(' + angle + 'deg)');
	$(wrapper).css('-moz-transform', 'rotate(' + angle + 'deg)');
	$(wrapper).css('-webkit-transform', 'rotate(' + angle + 'deg)');
	$(wrapper).css('-o-transform', 'rotate(' + angle + 'deg)');
	$(wrapper).data('currentRotation', angle * Math.PI / 180);

	// Делаем объект перемещаемым
	// TODO перенсти на кнопку
	$(draggableWrapper).draggable({ containment: 'parent', stack: '.smatrObject', cursor: 'pointer', start: dragStart() });

	// Делаем объект способным вращаться
	$(wrapper).mousedown(startRotate);

	// Устанавливаем z-index больше, чем у объектов, уже размещенных на столе
	$(wrapper).css('z-index', newImageZIndex++);
}