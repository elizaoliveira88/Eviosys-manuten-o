/*

           ██╗████████╗    ██████╗ ██████╗      ██╗███████╗ ██████╗████████╗███████╗  
           ██║╚══██╔══╝   ██╔═══██╗██╔══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝  
           ██║   ██║█████╗██║   ██║██████╔╝     ██║█████╗  ██║        ██║   ███████╗  
           ██║   ██║╚════╝██║   ██║██╔══██╗██   ██║██╔══╝  ██║        ██║   ╚════██║  
           ██║   ██║      ╚██████╔╝██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ███████║  
           ╚═╝   ╚═╝       ╚═════╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝  

RamaniMap, V1.3.29 (2022-04-22T13:19:23.876Z)
it-objects GmbH 2019, www.it-objects.de , Philip Korte (philip.korte@it-objects.de)

*/

function Ramani(options) {
    this.options =  Object.assign({
        id: null,
        showBackgroundGrid: true,
        backgroundGridBackgroundColor: '#e6ebee',
		backgroundGridLineColor: '#dfdedc',	
        backgroundGridLineDash: [],	
        showHitMap: false,
        keyBindings: {},
        defaultColor: {
            lineNormal: '#000000',
            lineHover: '#0000FF',
            lineSelected: 'blue',
            fillNormal: '#d8d8d8',
            connection: 'blue'              
        }
	}, options);
	
	this.options.keyBindings = Object.assign({
		multiSelect: 'Shift',
		deleteShape: 'Delete',
		fastPathDrawing: 'x'
	}, this.options.keyBindings || {});

    if(!this.options.id) {
        alert('missing id for Ramani !')
    }

    this.createErrorResponse = function(code, text) {
        return { 'CODE': code, 'MESSAGE': text };
    };
    
    var _addListener = function(eventGroup, event, callback) {
        var guid = Date.now();
        if(!this.storage.listener.hasOwnProperty(eventGroup)) {
            this.storage.listener[eventGroup] = {};
        }
        if(!this.storage.listener[eventGroup].hasOwnProperty(event)) {
            this.storage.listener[eventGroup][event] = {};
        }
        this.storage.listener[eventGroup][event][guid] = callback;
        return function(eventGroup, event, g) {
            delete this.storage.listener[eventGroup][event][g];
        }.bind(this, eventGroup, event, guid);
    }.bind(this);
    
    var _callListener = function(eventGroup, event, params) {
        //console.debug(eventGroup, event, params);
        if(!this.storage.listener.hasOwnProperty(eventGroup) || !this.storage.listener[eventGroup].hasOwnProperty(event)) return;
        var keys = Object.keys(this.storage.listener[eventGroup][event]);
        for(var x = 0; x < keys.length; x++) {
            try {
                this.storage.listener[eventGroup][event][keys[x]].apply(this, [params]);
            } catch(err) {}
        }
    }.bind(this);
    
    this.storage = {
        currentAction: 'A:N',
        currentShapeType: 'S:-',
        listener: {
            'shape': {
                'onSelect': {},
                'change': {},
                'changeEnd': {},
                'add': {},
                'addEnd': {}
            } 
        },
        map: new BaseMap({
            rootElement: document.getElementById(this.options.id),
            showHitMap: this.options.showHitMap,
            keyBindings: this.options.keyBindings,
            onAction: _callListener.bind(this),
            defaultColor: this.options.defaultColor,
            showBackgroundGrid: this.options.showBackgroundGrid,
            backgroundGridBackgroundColor: this.options.backgroundGridBackgroundColor,
    		backgroundGridLineColor: this.options.backgroundGridLineColor,
            backgroundGridLineDash: this.options.backgroundGridLineDash
        })
    };
    
    // Public API
    return {
        destroy: function() { 
            this.storage.map.destroy(); 
            this.storage.map = null;
        }.bind(this),
        zoomIn: function() { this.storage.map.zoomIn(); }.bind(this),
        zoomOut: function() { this.storage.map.zoomOut(); }.bind(this),
        getCurrentAction: function() {
            return Ramani.getActionName(this.storage.currentAction);
        }.bind(this),
        switchAction: function(action) {
            //console.debug('switchAction: ' + action);
            return new Promise(function(resolve, reject) {
                if(!Ramani.getActionName(action)) {
                    reject(this.createErrorResponse('1-0-1', 'unknown action (' + action + ')'));
                    return;
                }
                
                this.storage.map.switchAction(action).then(function() {
                    this.storage.currentAction = action;
                    resolve({
                        'action': action
                    });
                }.bind(this), function() {
                    reject(this.createErrorResponse('1-0-2', 'error on action (' + action + ')'));
                }.bind(this));
                
            }.bind(this));
        }.bind(this),
        getCurrentShapeType: function() { // tempalte of a new shape
            return Ramani.getShapeTypeName(this.storage.currentShapeType);
        }.bind(this),
        deleteShape: function(id) { // tempalte of a new shape
            return new Promise(function(resolve, reject) {
                this.storage.map.deleteShape(id).then(function() {
                    resolve();
                }.bind(this), function() {
                    reject(this.createErrorResponse('2-0-3', 'unknown shape (' + id + ')'));
                }.bind(this));
                
            }.bind(this));
        }.bind(this),
        switchShapeType: function(shape) {
            return new Promise(function(resolve, reject) {
                if(!Ramani.getShapeTypeName(shape)) {
                    reject(this.createErrorResponse('2-0-1', 'unknown shape (' + shape + ')'));
                    return;
                }
                
                this.storage.map.switchShapeType(shape).then(function() {
                    this.storage.currentShapeType = shape;
                    resolve({
                        'shape': shape
                    });
                }.bind(this), function() {
                    reject(this.createErrorResponse('2-0-2', 'unknown shape (' + shape + ')'));
                }.bind(this));
                
            }.bind(this));
        }.bind(this),
        addListenerOnSelectShape: function(fn) {
            return _addListener('shape', 'onSelect', fn);
        }.bind(this),
        addListenerOnChangeShape: function(fn) {
            return _addListener('shape', 'change', fn);
        }.bind(this),
        addListenerOnChangeEndShape: function(fn) {
            return _addListener('shape', 'changeEnd', fn);
        }.bind(this),
        addListenerOnAddShape: function(fn) {
            return _addListener('shape', 'add', fn);
        }.bind(this),
        addListenerOnAddEndShape: function(fn) {
            return _addListener('shape', 'addEnd', fn);
        }.bind(this),
        addListenerOnActionClicked: function(fn) {
            return _addListener('action', 'clicked', fn);
        }.bind(this),        
        addListener: function(cat, action, fn) {
            return _addListener(cat, action, fn);
        }.bind(this),
        selectShapes: function(arrOfShapeIds) {
            this.storage.map.selectShapes(arrOfShapeIds);
        }.bind(this),
        setZIndex: function(shapeIdOne, idx) {
            return new Promise(function(resolve, reject) {
                this.storage.map.setZIndex(shapeIdOne, idx).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('3-2-0', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        couldAddRoundingShape:  function(shapeIdOne, shapeIdTwo) {
            return new Promise(function(resolve, reject) {
                this.storage.map.couldAddRoundingShape(shapeIdOne, shapeIdTwo).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    console.debug(e);
                    reject(this.createErrorResponse('5-0-0', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        couldCreateThreeWayJunction:  function(shapeIdOne, shapeIdTwo) {
            return new Promise(function(resolve, reject) {
                this.storage.map.couldCreateThreeWayJunction(shapeIdOne, shapeIdTwo).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('4-1-1', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        addThreeWayJunction: function(shapeIdOne, shapeIdTwo, options) {
            return new Promise(function(resolve, reject) {
                this.storage.map.addThreeWayJunction(shapeIdOne, shapeIdTwo, options).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('4-1-0', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        couldCreateCurve:  function(shapeIdOne, shapeIdTwo) {
            return new Promise(function(resolve, reject) {
                this.storage.map.couldCreateCurve(shapeIdOne, shapeIdTwo).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('3-1-1', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        addCurve: function(shapeIdOne, shapeIdTwo, options) {
            return new Promise(function(resolve, reject) {
                this.storage.map.addCurve(shapeIdOne, shapeIdTwo, options).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('3-1-0', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        couldCreateCrossRoad:  function(shapeIdOne, shapeIdTwo) {
            return new Promise(function(resolve, reject) {
                this.storage.map.couldCreateCrossRoad(shapeIdOne, shapeIdTwo).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('3-2-1', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        addCrossRoad: function(shapeIdOne, shapeIdTwo, options) {
            return new Promise(function(resolve, reject) {
                this.storage.map.addCrossRoad(shapeIdOne, shapeIdTwo, options).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('3-2-0', 'error ' + e));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        changeShapeParameter: function(shapeId, propertyName, value) {
            return new Promise(function(resolve, reject) {
                this.storage.map.changeShapeParameter(shapeId, propertyName, value).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('2-1-1', 'error ' + e + ' on shape (' + shapeId + ')'));
                }.bind(this));
            }.bind(this));
        }.bind(this),
        exportToDXF: function() {
            return new Promise(function(resolve, reject) {
                var f = this.storage.map.exportAsDXF();
                resolve(f);
            }.bind(this));
        }.bind(this),
        exportJSON: function() {
    		return this.storage.map.exportJSON();
    	}.bind(this),
        importSavedMap: function(mapData) {
    		return this.storage.map.importSavedMap(mapData);
    	}.bind(this),
        importJSON: function() {
    		return this.storage.map.importJSON();
    	}.bind(this),
        importJSONObjects: function(shapes) {
    		return this.storage.map.importJSONObjects(shapes);
    	}.bind(this),
        exportJSONObjects: function(shapes) {
    		return this.storage.map.exportJSONObjects();
    	}.bind(this),
        clearMap: function() {
    		return this.storage.map.clearMap();
    	}.bind(this),
        findPath: function(shapeId, options) {
    		return this.storage.map.findPath(shapeId, options);
    	}.bind(this),
        deselectAllShapes: function() {
    		return this.storage.map.deselectAllShapes();
    	}.bind(this),
        resetColor: function(shapeId) {
            return new Promise(function(resolve, reject) {
                this.storage.map.resetColor(shapeId).then(function(ret) {
                    resolve(ret);
                }.bind(this), function(e) {
                    reject(this.createErrorResponse('2-1-1', 'error ' + e + ' on shape (' + shapeId + ')'));
                }.bind(this));
            }.bind(this));
    	}.bind(this),
        undo: function() {
    		return this.storage.map.undoAction();
    	}.bind(this),
        getHistorySize: function() {
    		return this.storage.map.getHistorySize();
    	}.bind(this),
        centerView: function(opts) {
    		return this.storage.map.centerView(opts);
    	}.bind(this),
        getImage: function(opts) {
            var options = Object.assign({
    		   excludeImages: false,
               showBackgroundGrid: this.options.showBackgroundGrid
    	   	}, opts || {});
            
            return new Promise(function(resolve, reject) {
                var tmpElement = document.createElement('div');
                    tmpElement.style.width = '29.7cm';
                    tmpElement.style.height = '21cm';

                var tmpMap = new BaseMap({
                    rootElement: tmpElement,
                    showBackgroundGrid: options.showBackgroundGrid
                });
                
                var mapAsJson = this.storage.map.exportJSONObjects();

                if(options.excludeImages == true) {
                    for(var x=0; x<mapAsJson.layer.base.shapes.length; x++) {
                        if(mapAsJson.layer.base.shapes[x].type == Ramani.SHAPETYPES.IMAGE) {
                            mapAsJson.layer.base.shapes[x] = null;
                        }
                    }
                    mapAsJson.layer.base.shapes = mapAsJson.layer.base.shapes.filter(function(shape) { return shape != null; });
                }                

                tmpMap.importSavedMap(mapAsJson).then(function() {
                    tmpMap.centerView();
                    var img = tmpMap.toDataURL();
                    // cleanup
                    tmpMap.destroy();
                    delete tmpElement;
                    delete tmpMap;
                    // return
            		resolve(img);
                });
            }.bind(this));    
    	}.bind(this),
        checkShapeId: function (id) {
            return this.storage.map.checkShapeExists(id);
        }.bind(this),
        hightlightPath: function (arrayOfShapeIds, optionalColor) {
            return this.storage.map.hightlightPath(arrayOfShapeIds, optionalColor);
        }.bind(this),
        joinPaths: function (one, two) {
            return this.storage.map.joinPaths(one, two);
        }.bind(this)
    };
};

Ramani.SHAPETYPES = {
    'NONE': 'S:-',
    'CURVE': 'S:C',
    'DESTINATION':'S:D',
    'GATE': 'S:G',
    'IMAGE': 'S:I',
    'CLIPART': 'S:CA',
    'PATH': 'S:P',
    'SOURCE': 'S:S',
    'SOURCE_DESTINATION':'S:SD',
    'TUGGERSTOPPOINT':'S:TSP',
    'WALL': 'S:W',
    'OBJECT':'S:_',
    'REFLINE':'S:RL',
    'ACTION_POINT':'S:AP',
    'SELECT':'S:SEL'
};

Ramani.getShapeTypeName = function(short){
    var keys = Object.keys(Ramani.SHAPETYPES);
    for(var x=0; x<keys.length; x++) {
        if(short == Ramani.SHAPETYPES[keys[x]]) {
            return keys[x];
        }
    }
    return null;
};

Ramani.SHAPEPARAMETER 

Ramani.ACTION = {
    'CREATE': 'A:C',
    'NONE': 'A:N',
    'SELECT': 'A:S',
    'MOVE': 'A:M'  
};
Ramani.getActionName = function(short){
    var keys = Object.keys(Ramani.ACTION);
    for(var x=0; x<keys.length; x++) {
        if(short == Ramani.ACTION[keys[x]]) {
            return keys[x];
        }
    }
    return null;
};

function BaseMap(options) {
	this.options = Object.assign({
		rootElement: null,
		gridSize: 20,
		scale: 1.1,
		onAction: function() {},
		showHitMap: false,
		showBackgroundGrid: true,
		backgroundGridBackgroundColor: '#e6ebee',
		backgroundGridLineColor: '#dfdedc',	
		backgroundGridLineDash: [],
		keyBindings: {},
		defaultColor: {
            lineNormal: '#000000',
            lineHover: '#0000FF',
            lineSelected: 'blue',
            fillNormal: '#d8d8d8',
            connection: 'blue'              
        }
	}, options);
	
	this.options.keyBindings = Object.assign({
		multiSelect: 'Shift',
		deleteShape: 'Delete',
		fastPathDrawing: 'x',
		lassoSelect: 'm'
	}, this.options.keyBindings || {});

	this.storage = {
		canvas: document.createElement('canvas'),
		canvasTemp: document.createElement('canvas'),
		canvasHitmap: document.createElement('canvas'),
		ctx: null,
		ctxTemp: null,
		ctxHitmap: null,
        canvasRatio: 1,
		boundingClientRect: { x:0, y:0 },
		paintObjects: [],
		paintObjectsHitmap: {},
		currentPaintObjectType: Ramani.SHAPETYPES.PATH,
		mode: 'create',
		isMouseDown: false,
		isFirstMouseDown: false,
		isMoving: false,
		backgroundGrid: null
	};
	
	this.storage.ctx = this.storage.canvas.getContext("2d");
	this.storage.ctxTemp = this.storage.canvasTemp.getContext("2d");
	this.storage.ctxHitmap = this.storage.canvasHitmap.getContext("2d");
	
	this.tmp = {
		currentHoverObjIndex: null,
		currentObjIndex: null,
		selectedObjectsIndex: [],
		addedMultiTouchActionPoints: {},
		fastPathDrawing: true,
		lassoSelect: false,
		lassoElement: null
	};
	
	this.fnEvents = {
		"resize": function() {
			this.updateBoundingClientRect();
			this.storage.canvas.width = this.storage.boundingClientRect.width;// * this.storage.canvasRatio;
			this.storage.canvas.height = this.storage.boundingClientRect.height; // * this.storage.canvasRatio;
			this.storage.canvasTemp.width = this.storage.boundingClientRect.width; // * this.storage.canvasRatio;
			this.storage.canvasTemp.height = this.storage.boundingClientRect.height; // * this.storage.canvasRatio;
			this.storage.canvasHitmap.width = this.storage.boundingClientRect.width; // * this.storage.canvasRatio;
			this.storage.canvasHitmap.height = this.storage.boundingClientRect.height; // * this.storage.canvasRatio;
			
			if(this.storage.backgroundGrid) {
				this.storage.backgroundGrid.setEndPoint({ x: this.storage.canvas.width, y: this.storage.canvas.height });
			}
			
			this.paint();
		}.bind(this),
		"checkHeight": function() {
			if(this.storage.canvas.height == 0) {
				window.setTimeout(this.fnEvents.checkHeight, 1000);
			} else {
				this.fnEvents.resize();
			}
		}.bind(this)
	};	
	
	this.getIndexOfFirstItemHovered = function() {
		var pos = this.helper.zoomAndMove.getMousePositionOnCanvas();
		const pixel = this.storage.ctxHitmap.getImageData(pos.x, pos.y, 1, 1).data;
  		const color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
		if(this.storage.paintObjectsHitmap.hasOwnProperty(color)) {
			var idn = null;
			if(this.storage.paintObjects.length < 2) return idn;
			for(var x=this.storage.paintObjects.length - 1; x>0; x--) { // skip grid ...
				if(this.storage.paintObjects[x].getId() == this.storage.paintObjectsHitmap[color]) {
					idn = x;
					x = 0;
				}
			}	
			return idn;
		} else {
			return null;
		}
	}.bind(this);
	
	this.addActionPoint = function(couldAddRoundingShapeResultInformation) {
		this._createShape({
			type: Ramani.SHAPETYPES.ACTION_POINT,
			positionStart: couldAddRoundingShapeResultInformation.point
		}).then(function(inst) {
			this.tmp.addedMultiTouchActionPoints[couldAddRoundingShapeResultInformation.shapeOneId + '#' + couldAddRoundingShapeResultInformation.shapeTwoId] = inst.getId();
			inst.setActionPayload({
				type: 'couldAddRoundingShape',
				shapeStyle: couldAddRoundingShapeResultInformation.curve ? 'C': (couldAddRoundingShapeResultInformation.crossRoad ? 'X':'T'),
				call: function(carsResInfo, actionPointObjInstance, param) {
					this.deleteShape(actionPointObjInstance.getId());
					delete this.tmp.addedMultiTouchActionPoints[carsResInfo.shapeOneId + '#' + carsResInfo.shapeTwoId];
					
					// clear connection points
					var shapes = this._getShapesById(carsResInfo.shapeOneId, carsResInfo.shapeTwoId);
						shapes.shapeOne.clearAdditionalPoints('connections');
						shapes.shapeTwo.clearAdditionalPoints('connections');
					
					if(carsResInfo.curve) {
						return this.addCurve(carsResInfo.shapeOneId, carsResInfo.shapeTwoId, param);
					} else if(carsResInfo.crossRoad) {
						return this.addCrossRoad(carsResInfo.shapeOneId, carsResInfo.shapeTwoId, param);
					} else {
						return this.addThreeWayJunction(carsResInfo.shapeOneId, carsResInfo.shapeTwoId, param);
					}
				}.bind(this, couldAddRoundingShapeResultInformation, inst)
			});
			inst.copyColorFrom(this.storage.paintObjects[1]);
			this._addShapeToMap(inst);
			//var idn = this._addShapeToMap(inst);	
			//this.tmp.selectedObjectsIndex.push(idn);
			this.animate();			
		}.bind(this));
	}.bind(this);
	this.clearActionPoints = function() {
		var keys = Object.keys(this.tmp.addedMultiTouchActionPoints);
		for(var x=0; x<keys.length; x++) {
			this.deleteShape(this.tmp.addedMultiTouchActionPoints[keys[x]]);
		}
		this.tmp.addedMultiTouchActionPoints = {};
		this.paint();
	}.bind(this);
	
	window.setTimeout(this.fnEvents.checkHeight, 1000);
	
	window.addEventListener("resize", this.fnEvents['resize']);

	var helperSharedData = new HelperSharedData({
		gridSize: this.options.gridSize
	});

	this.helper = {
		undo: new HelperUndo(this),
		subset: function(arra, arra_size) {
    		var result_set = [], result;
			for(var x = 0; x < Math.pow(2, arra.length); x++) {
    			result = [];
    			i = arra.length - 1; 
	     		do {
	      			if( (x & (1 << i)) !== 0) {
	             		result.push(arra[i]);
	           		}
	        	}  while(i--);
	    		if( result.length == arra_size) {
	          		result_set.push(result);
	        	}
	    	}
			return result_set; 
		},
		sharedData: helperSharedData,
		zoomAndMove: new HelperZoomAndMove({
			canvas: this.storage.canvas,
			scale: this.options.scale,
			onBeforeChangeScaleByRatio: function(newScale, newWorldOrigin) {
				for(var t=1; t<this.storage.paintObjects.length; t++) {
					this.storage.paintObjects[t].onBeforeChangeScaleByRatio(newScale, newWorldOrigin);
				}
			}.bind(this),
			onChangeScaleByRatio: function(ratio) {
				for(var t=1; t<this.storage.paintObjects.length; t++) {
					this.storage.paintObjects[t].onChangeScaleByRatio(ratio);
				}
			}.bind(this)
		}),
		mouse: new HelperMouse({
			helperSharedData: helperSharedData,
			rootElement: this.options.rootElement,
			canvas: this.storage.canvas,
			onMouseDown: function(pos, posRaw) {
				this.storage.isMouseDown = true;
				this.storage.isFirstMouseDown = false;
				this.storage.isMoving = false; // reset
				this.helper.zoomAndMove.track(posRaw);
				if(this.storage.mode == 'none') return;

				switch(this.storage.mode) {
					case 'none': 
						break;
						
					case 'move':
						this.helper.zoomAndMove.startMove(posRaw);
						break;
						
					case 'select':
						var hoveredIndex = this.getIndexOfFirstItemHovered();
						if(this.storage.paintObjects[hoveredIndex] && this.storage.paintObjects[hoveredIndex].getType() == Ramani.SHAPETYPES.ACTION_POINT) {
							this.storage.paintObjects[hoveredIndex].onClick();
							return;
						}
						
						var hasSelection = false;
						if(this.tmp.selectedObjectsIndex.length > 0) {
							var found = false;
							for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
								if(this.tmp.selectedObjectsIndex[x] == hoveredIndex) {
									found = true;
									x = this.tmp.selectedObjectsIndex.length;
								}
							}
							if(!found) {
								for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
									this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('hover', false);
									this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('selected', false);
									this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('multiSelect', false);
								}
								this.tmp.selectedObjectsIndex = [];
								this.clearActionPoints();
								this.fireEvent('shape','onDeSelect');
							} else {
								break;
							}
						}
						
						// wenn selektiert dann prüfe ob geklickt oder deseletiere 
						if(this.tmp.currentObjIndex != null) {
							var hasSelection = true;
							if(this.tmp.currentObjIndex != hoveredIndex) {
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('multiSelect', false);
								this.tmp.currentObjIndex = null;	
							} else {
								this.storage.paintObjects[this.tmp.currentObjIndex].onClick();
								return;
							}	
						}

						if(this.tmp.currentObjIndex == null) {
							if(hasSelection == true && this.storage.paintObjects[hoveredIndex] && 
								(this.storage.paintObjects[hoveredIndex].getType() == Ramani.SHAPETYPES.IMAGE || this.storage.paintObjects[hoveredIndex].getType() == Ramani.SHAPETYPES.CLIPART)
							) {
								
							} else {
								this.tmp.currentObjIndex = hoveredIndex; 
								this.storage.isFirstMouseDown = true;
								
								// check connection points
								this._checkConnectionPoints(this.tmp.currentObjIndex)
							}
						}

						if(this.tmp.currentObjIndex) {
							this.fireEvent('shape','onSelect');
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', true);
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', true);
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('multiSelect', false);
							this.storage.paintObjects[this.tmp.currentObjIndex].onClick();
							
							this.paint();
							
							this.helper.undo.addHistoryStep({
								changes: [{
									type: 'EDIT',
									shapeId: this.storage.paintObjects[this.tmp.currentObjIndex].getId(),
									params: this.storage.paintObjects[this.tmp.currentObjIndex].toJSON()
								}]
							});
						} else if(hasSelection) {
							this.fireEvent('shape','onDeSelect');
						}
						break;
					
					case 'lasso-select':
							this._createShape({
								type: Ramani.SHAPETYPES.SELECT
							}).then(function(inst) {
								this.tmp.lassoElement = inst;
								//inst.copyColorFrom(shapes.shapeOne);
								inst.setPoint('positionStart', this.helper.zoomAndMove.getMousePosition());
								inst.setPoint('positionEnd', this.helper.zoomAndMove.getMousePosition());
								//this._addShapeToMap(inst, undefined, true);
								this.tmp.currentObj = this.tmp.lassoElement;
								this.animate();
							}.bind(this));
						break;
						
					case 'multi-select':
						var hoveredIndex = this.getIndexOfFirstItemHovered();
						if(!hoveredIndex) { break; }
						
						if(this.storage.paintObjects[hoveredIndex] && this.storage.paintObjects[hoveredIndex].getType() == Ramani.SHAPETYPES.ACTION_POINT) {
							this.storage.paintObjects[hoveredIndex].onClick();
							return;
						}
						
						if(this.tmp.selectedObjectsIndex.indexOf(hoveredIndex) > -1) { 
							// handle deselect
							this.storage.paintObjects[hoveredIndex].setMode('selected', false); // will clear additional points from type connections
							this.storage.paintObjects[hoveredIndex].setMode('hover', false);
							this.storage.paintObjects[hoveredIndex].setMode('multiSelect', false);
							this.tmp.selectedObjectsIndex.splice(this.tmp.selectedObjectsIndex.indexOf(hoveredIndex), 1);
							this.fireEvent('shape','onDeSelect');
							if(this.tmp.selectedObjectsIndex.length == 1) {
								this.tmp.currentObjIndex = this.tmp.selectedObjectsIndex[0];
								this.tmp.selectedObjectsIndex = [];
								this.clearActionPoints();
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('multiSelect', false);
								this.storage.paintObjects[this.tmp.currentObjIndex].onClick();
							} else if(this.tmp.selectedObjectsIndex.length > 1) {
								for(var st=0; st < this.tmp.selectedObjectsIndex.length; st++) {
									var o2 = this.storage.paintObjects[this.tmp.selectedObjectsIndex[st]];
									var oId1 = this.storage.paintObjects[hoveredIndex].getId() + '#' + o2.getId();
									var oId2 = o2.getId() + '#' + this.storage.paintObjects[hoveredIndex].getId();
									if(this.tmp.addedMultiTouchActionPoints.hasOwnProperty(oId1)) {
										this.deleteShape(this.tmp.addedMultiTouchActionPoints[oId1]);
										delete this.tmp.addedMultiTouchActionPoints[oId1];
									} else if( this.tmp.addedMultiTouchActionPoints.hasOwnProperty(oId2)) {
										this.deleteShape(this.tmp.addedMultiTouchActionPoints[oId2]);
										delete this.tmp.addedMultiTouchActionPoints[oId2];
									}
								}
							}
							this.paint();
							break; 
						}
						
						this.tmp.selectedObjectsIndex.push(hoveredIndex);
						
						// check connection points
						this._checkConnectionPoints(hoveredIndex);
						
						if(this.tmp.selectedObjectsIndex.length > 1) {
							this.tmp.currentObjIndex = null;
							this.storage.isFirstMouseDown = true;

							var o1 = this.storage.paintObjects[this.tmp.selectedObjectsIndex[this.tmp.selectedObjectsIndex.length - 1]]; // last element 

							for(var st=0; st < this.tmp.selectedObjectsIndex.length - 1; st++) {
								var o2 = this.storage.paintObjects[this.tmp.selectedObjectsIndex[st]];
								var oId = o1.getId() + '#' + o2.getId();
								if(!this.tmp.addedMultiTouchActionPoints.hasOwnProperty(oId)) {
									this.couldAddRoundingShape(o1, o2).then(function(tX) {
										if(tX != null && (tX.curve || tX.crossRoad || tX.threeWayJunction)) {
											this.addActionPoint(tX);
										}
									}.bind(this), function() { });
								}
							}
						}
						
						this.storage.paintObjects[hoveredIndex].setMode('selected', true);
						this.storage.paintObjects[hoveredIndex].setMode('hover', true);
						this.storage.paintObjects[hoveredIndex].setMode('multiSelect', true);
						this.storage.paintObjects[hoveredIndex].onClick();
						this.fireEvent('shape','onSelect');
						
						this.paint();
						break;
						
					case 'create':	
						if(this.storage.currentPaintObjectType == Ramani.SHAPETYPES.IMAGE) return; // no create for image ... only change
	
						var hoveredIndex = this.getIndexOfFirstItemHovered();

						if(this.tmp.currentObjIndex != null) {
							if(hoveredIndex != this.tmp.currentObjIndex) {
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
								this.tmp.currentObjIndex = null;	
								this.fireEvent('shape','onDeSelect');
							} else {
								this.storage.paintObjects[this.tmp.currentObjIndex].onClick();
								this.helper.undo.addHistoryStep({
									changes: [{
										type: 'EDIT',
										shapeId: this.storage.paintObjects[this.tmp.currentObjIndex].getId(),
										params: this.storage.paintObjects[this.tmp.currentObjIndex].toJSON()
									}]
								});
								return;
							}	
						}
							
						// wenn nichts in bearbeitung ist und wir auch nichts hovern malen wir 
						if(this.storage.currentPaintObjectType == Ramani.SHAPETYPES.REFLINE) {
							var ind = null;
							for(var v=0; v<this.storage.paintObjects.length;v++) {
								if(this.storage.paintObjects[v].getType() == Ramani.SHAPETYPES.REFLINE) {
									ind = v;
									v = this.storage.paintObjects.length;
								}
							}
							if(ind != null) {
								// this._removeShapeFromMap(ind); // remove old line
								return; // prevent new line
							}							
						}

						this._createShape({
							type: this.storage.currentPaintObjectType,
							positionStart: this.helper.zoomAndMove.getMousePosition()
						}).then(function(inst) {
							if(this.storage.currentPaintObjectType == Ramani.SHAPETYPES.CLIPART) {
								this.tmp.currentObjIndex = this._addShapeToMap(inst, 1);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
								this.fireEvent('shape','addImageEnd', this.tmp.currentObjIndex);
								this.tmp.currentObjIndex = null;	
							} else {
								this.tmp.currentObjIndex = this._addShapeToMap(inst);	
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', true);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', true);

								this.fireEvent('shape','onDeSelect'); //?
								this.fireEvent('shape','add');
							}

							this.paint();
						}.bind(this));
						break;
				};
				this.paint();
			}.bind(this),
			onMove: function(pos, posDelta, posDown, posRaw) {
				this.helper.zoomAndMove.track(posRaw, posDelta);
				switch(this.storage.mode) {
					case 'move':
						if(this.storage.isMouseDown == true) {
							this.storage.isMoving = true;
							this.helper.zoomAndMove.move();
							this.paint();
							return;
						}
						break;
					case 'create':
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.storage.isMoving = true;
							this.storage.paintObjects[this.tmp.currentObjIndex].move();	
							this._checkConnectionPoints(this.tmp.currentObjIndex);
							this.fireEvent('shape','change');
							this.animate();
						} 
						break;
					case 'select':
						if(this.storage.isFirstMouseDown == true) {
							this.hover();
							return;
						} 
						
						if(this.tmp.selectedObjectsIndex.length > 0) {
							if(this.storage.isMouseDown == true) {
								this.storage.isMoving = true;
								
								var keys = Object.keys(this.tmp.addedMultiTouchActionPoints);
								if(keys.length > 0) {
									for(var x=0; x<keys.length; x++) {
										this.deleteShape(this.tmp.addedMultiTouchActionPoints[keys[x]]);
									}
									this.tmp.addedMultiTouchActionPoints = {};
								}
								
								for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
									this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].move();	
									this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].clearAdditionalPoints('connections');
								}
								
								this.fireEvent('shape','change');
								this.animate();
							}
						} else if(this.tmp.currentObjIndex != null) {
							if(this.storage.isMouseDown == true) {
								this.storage.isMoving = true;
								this.storage.paintObjects[this.tmp.currentObjIndex].move();	
								this._checkConnectionPoints(this.tmp.currentObjIndex);
								this.fireEvent('shape','change');
								this.animate();
							}
						} else {
							this.hover();
						}
						break;
					case 'lasso-select':
						if(this.storage.isFirstMouseDown == true) return;
						if(this.storage.isMouseDown == true) {
							this.storage.isMoving = true;
							if(this.tmp.lassoElement != null) {
								this.tmp.lassoElement.setPoint('positionEnd', this.helper.zoomAndMove.getMousePosition());
								this.tmp.currentObj = this.tmp.lassoElement;
								this.animate();
							}
						}
						break;		
					case 'multi-select':
						if(this.storage.isFirstMouseDown == true) return;
						if(this.storage.isMouseDown == true) {
							this.storage.isMoving = true;
							for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
								this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].move();	
							}
							this.fireEvent('shape','change');
							this.animate();
						}
						break;	
				};
			}.bind(this),
			onMouseUp: function(pos, posRaw) {
				this.storage.isFirstMouseDown = false;
				switch(this.storage.mode) {
					case 'move':
						this.fireEvent('shape','changeEnd');
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();	
							this.paint();
						}
						break;
					case 'select':
						if(this.storage.isFirstMouseDown == true) return;
						this.fireEvent('shape','changeEnd');
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();	
							this.paint();
						}
						break;
					case 'lasso-select':
						if(this.tmp.lassoElement != null && this.storage.paintObjects.length > 1) {
							this.tmp.currentObj = null;
							this.animate();
							
							// clear old selection 
							for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
								this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('hover', false);
								this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('selected', false);
								this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('multiSelect', false);
							}
							this.tmp.selectedObjectsIndex = [];
							this.clearActionPoints();
							
							var lst = this.tmp.lassoElement.getPoint('positionStart');
							var led = this.tmp.lassoElement.getPoint('positionEnd');
							var start = { x: Math.min(lst.x, led.x), y: Math.min(lst.y, led.y) };
							var end = { x: Math.max(lst.x, led.x), y: Math.max(lst.y, led.y) };
							
							var mapOfIndexes = {};
							for(var z=this.storage.paintObjects.length - 1; z>0; z--) { // skip grid ...
								mapOfIndexes[this.storage.paintObjects[z].getId()] = z;
							}	
							for(var x=start.x; x<end.x; x=x+2) {
								for(var y=start.y; y<end.y; y=y+2) {
									var pixel = this.storage.ctxHitmap.getImageData(x, y, 1, 1).data;	
									var color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
									if(this.storage.paintObjectsHitmap.hasOwnProperty(color)) {
										var idn = mapOfIndexes.hasOwnProperty(this.storage.paintObjectsHitmap[color]) ? mapOfIndexes[this.storage.paintObjectsHitmap[color]] : null;
										if(idn != null && this.tmp.selectedObjectsIndex.indexOf(idn) == -1) {
											this.tmp.selectedObjectsIndex.push(idn);
											
											// check connection points
											this._checkConnectionPoints(idn);
											
											if(this.tmp.selectedObjectsIndex.length > 1) {
												this.tmp.currentObjIndex = null;
												this.storage.isFirstMouseDown = true;

												var o1 = this.storage.paintObjects[this.tmp.selectedObjectsIndex[this.tmp.selectedObjectsIndex.length - 1]]; // last element 

												for(var st=0; st < this.tmp.selectedObjectsIndex.length - 1; st++) {
													var o2 = this.storage.paintObjects[this.tmp.selectedObjectsIndex[st]];
													var oId = o1.getId() + '#' + o2.getId();
													if(!this.tmp.addedMultiTouchActionPoints.hasOwnProperty(oId)) {
														this.couldAddRoundingShape(o1, o2).then(function(tX) {
															if(tX != null && (tX.curve || tX.crossRoad || tX.threeWayJunction)) {
																this.addActionPoint(tX);
															}
														}.bind(this), function() { });
													}
												}
											}
											
											this.storage.paintObjects[idn].setMode('selected', true);
											this.storage.paintObjects[idn].setMode('hover', true);
											this.storage.paintObjects[idn].setMode('multiSelect', true);
											this.storage.paintObjects[idn].onClick();
										}
									}
								}	
							}
							
							this.tmp.currentObj = null;
							this.tmp.lassoElement = null;
							this.paint();
						}
						break;
					case 'multi-select':
						this.fireEvent('shape','changeEnd');
						if(this.storage.isMouseDown == true) {
							for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
								this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].onEndMove();	
							}
							this.paint();
						}
						break;						
					case 'create':
						this.fireEvent('shape','addEnd');
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();
							if(!this.storage.paintObjects[this.tmp.currentObjIndex].isValid()) {
								this._removeShapeFromMap(this.tmp.currentObjIndex);
								this.tmp.currentObjIndex = null;
								this.fireEvent('shape','onDeSelect');
							} 
							this.paint();
						}
						if(this.storage.currentPaintObjectType == Ramani.SHAPETYPES.PATH && this.tmp.fastPathDrawing == true) {
							this.deselectAllShapes();
							this.paint();
						}
						break;
				};
				this.storage.isMouseDown = false;
			}.bind(this),
			onMouseOut: function() {
				this.storage.isFirstMouseDown = false;
				switch(this.storage.mode) {
					case 'move':
						this.fireEvent('shape','changeEnd');
						if(this.tmp.currentObjIndex != null) {
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
							if(this.storage.isMouseDown == true) {
								this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();	
							}
							this.tmp.currentObjIndex = null;
							this.fireEvent('shape','onDeSelect');
						}	
						break;
					case 'select':
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
							this.storage.isMouseDown == false;
							this.fireEvent('shape','changeEnd');
							this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();	
							this.tmp.currentObjIndex = null;
							this.fireEvent('shape','onDeSelect');
						}
						break;	
					case 'create':
						if(this.tmp.currentObjIndex != null) {
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
							this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
							this.fireEvent('shape','addEnd');
							if(!this.storage.paintObjects[this.tmp.currentObjIndex].isValid()) {
								this._removeShapeFromMap(this.tmp.currentObjIndex);
								this.tmp.currentObjIndex = null;
								this.fireEvent('shape','onDeSelect');
							} else if(this.storage.isMouseDown == true) {
								this.fireEvent('shape','changeEnd');
								this.storage.paintObjects[this.tmp.currentObjIndex].onEndMove();	
								this.tmp.currentObjIndex = null;
								this.fireEvent('shape','onDeSelect');
							}
						}
						break;
				};
				this.paint();
			}.bind(this),
			onWheel: function(delta) {
				if(this.storage.mode != 'none') {
					this.helper.zoomAndMove.zoom(delta);
					this.paint();
				}
			}.bind(this)
		}),
		paint: new HelperPaint({
			helperSharedData: helperSharedData,
			baseMap: this,
			defaultColor: this.options.defaultColor
		}),
		keyboard: new HelperKeyboard({
			onKeyDown: function(key, event) {
				switch(key) {
					case this.options.keyBindings.multiSelect:
						if(this.storage.mode == 'select') {
							this.storage.mode = 'multi-select';
							if(this.tmp.currentObjIndex && this.tmp.selectedObjectsIndex.indexOf(this.tmp.currentObjIndex) == -1) {
								this.tmp.selectedObjectsIndex.push(this.tmp.currentObjIndex);
								this.storage.paintObjects[this.tmp.currentObjIndex].setMode('multiSelect', true);
								this.paint();
							}
						}
						break;
					case this.options.keyBindings.deleteShape:
						if(this.tmp.currentObjIndex) {
							this._removeShapeFromMap(this.tmp.currentObjIndex);
							this.tmp.currentObjIndex = null;
							this.paint();
						}
						break;
					case this.options.keyBindings.fastPathDrawing:	
						this.tmp.fastPathDrawing = false;
						break;
					case this.options.keyBindings.lassoSelect:	
						this.tmp.lassoSelect = true;
						if(this.storage.mode == 'select') {
							this.storage.mode = 'lasso-select';
						}
						break;	
					case 'r': 
						this.centerView();
						break;
				};
			}.bind(this),
			onKeyUp: function(key, event) {
				switch(key) {
					case this.options.keyBindings.multiSelect:
						if(this.storage.mode == 'multi-select') {
							this.storage.mode = 'select';
						}
						break;
					case this.options.keyBindings.fastPathDrawing:	
						this.tmp.fastPathDrawing = true;
						this.deselectAllShapes();
						this.paint();
						break;
					case this.options.keyBindings.lassoSelect:	
						this.tmp.lassoSelect = false;
						this.tmp.lassoElement = null;
						if(this.storage.mode == 'lasso-select') {
							this.storage.mode = 'select';
						}
						break;	
	
				};
			}.bind(this)
		})
	};
	
	this.options.rootElement.appendChild(this.storage.canvas);
	this.options.rootElement.appendChild(this.storage.canvasTemp);
	if(this.options.showHitMap == true) {
		this.options.rootElement.appendChild(this.storage.canvasHitmap);
	}
	
	/* pixeldichte */
	this.storage.canvasRatio = (function () {
	    var dpr = window.devicePixelRatio || 1,
	        bsr = this.storage.ctx.webkitBackingStorePixelRatio ||
	        	  this.storage.ctx.mozBackingStorePixelRatio ||
	        	  this.storage.ctx.msBackingStorePixelRatio ||
	        	  this.storage.ctx.oBackingStorePixelRatio ||
	        	  this.storage.ctx.backingStorePixelRatio || 1;
	    return dpr / bsr;
	}.bind(this))();

	this.fnEvents["resize"]();

	this.storage.backgroundGrid = new RamaniGrid({
		zoomAndMove: this.helper.zoomAndMove,
		helperSharedData: this.helper.sharedData,
		visible: this.options.showBackgroundGrid,
		backgroundColor: this.options.backgroundGridBackgroundColor,
		lineColor: this.options.backgroundGridLineColor,
		lineDash: this.options.backgroundGridLineDash
	});
	this.storage.backgroundGrid.setEndPoint({ x: this.storage.canvas.width, y: this.storage.canvas.height });
	this.storage.paintObjects.splice(0,0,this.storage.backgroundGrid);

/*
	if(this.storage.canvasRatio != 1) {
		this.storage.ctx.setTransform(this.storage.canvasRatio, 0, 0, this.storage.canvasRatio, 0, 0);
		this.storage.ctxTemp.setTransform(this.storage.canvasRatio, 0, 0, this.storage.canvasRatio, 0, 0);
	}
	*/
	this.paint();
}

BaseMap.prototype = {
	_calcToMm: function(value) { return value * 0.264583; }, // 1 pixel = 0.264583 mm (mm / 0.264583 = px)
	_calcToPx: function(value) { return value / 0.264583; }, // 1 mm = 72/25.4 point
	
	_roundToMm: function(value) {
		value = this._calcToMm(value);
		return Math.round(value*100)/100;
	},
	
	_generateHitMapColor: function() {
		const r = Math.round(Math.random() * 255);
		const g = Math.round(Math.random() * 255);
		const b = Math.round(Math.random() * 255);
		var k = 'rgb(' + r + ',' + g + ',' + b + ')';
		if(this.storage.paintObjectsHitmap.hasOwnProperty(k)) {
			return this._generateHitMapColor();
		}
		return k;
	},
	
	_addShapeToMap: function(shape, pos, skipHistory) {
		if(pos === undefined) {
			pos = this.storage.paintObjects.length;
			this.storage.paintObjects.push(shape);
		} else {
			this.storage.paintObjects.splice(pos, 0, shape);
		}
		this.storage.paintObjectsHitmap[shape.getHitMapColor()] = shape.getId();
		
		if(shape.getType() == Ramani.SHAPETYPES.ACTION_POINT) {
			skipHistory = true;
		}

		if(skipHistory !== true) {
			this.helper.undo.addHistoryStep({
				changes: [{
					type: 'ADD',
					shapeId: shape.getId()
				}]
			});
		}
		
		return pos;
	},
	
	_removeShapeFromMap: function(pos, skipHistory) {
		if(this.storage.paintObjects.length < pos) return;
		var obj = this.storage.paintObjects[pos];
		
		if(obj.getType() == Ramani.SHAPETYPES.ACTION_POINT) {
			skipHistory = true;
		}
		
		this.storage.paintObjects.splice(pos, 1);
		if(this.storage.paintObjectsHitmap.hasOwnProperty(obj.getHitMapColor())) {
			delete this.storage.paintObjectsHitmap[obj.getHitMapColor()];		
		}
		if(this.tmp.currentObjIndex == pos) {
			this.tmp.currentObjIndex = null;
		} 
		
		if(this.tmp.selectedObjectsIndex.length > 0 && this.tmp.selectedObjectsIndex.indexOf(pos) > -1) {
			this.tmp.selectedObjectsIndex.splice(this.tmp.selectedObjectsIndex.indexOf(pos), 1);
		}
		
		if(skipHistory !== true) {
			this.helper.undo.addHistoryStep({
				changes: [{
					type: 'DELETE',
					shapeId: obj.getId(),
					params: obj.toJSON()
				}]
			});
		}
		//this.paint(); /// useless ?
	},
	
	_changeShapeIndexOnMap: function(posOld, posNew) {
		if(posNew >= this.storage.paintObjects.length) {
			this.storage.paintObjects.push(this.storage.paintObjects.splice(posOld, 1)[0]);
			return;
		}
		this.storage.paintObjects.splice(posNew,0, this.storage.paintObjects.splice(posOld, 1)[0]);
	},
	
	_createShape: function(options) {
		return this.helper.paint.createObject(Object.assign({
			zoomAndMove: this.helper.zoomAndMove,
			hitMapColor: this._generateHitMapColor()
		}, options || {}));
	},
	
	destroy: function() {
		window.removeEventListener("resize", this.fnEvents['resize']);
		this.helper.mouse.destroy();
		this.helper.keyboard.destroy();
		try {
			this.options.rootElement.removeChild(this.storage.canvas);	
		} catch(err) {}
		try {
			this.options.rootElement.removeChild(this.storage.canvasTemp);
		} catch(err) {}
		try {
			if(this.options.showHitMap == true) {
				this.options.rootElement.removeChild(this.storage.canvasHitmap);
			}
		} catch(err) {}
	},
	
	_checkConnectionPoints: function(index) {
		if(index == null || index == undefined) {
			index = this.tmp.currentObjIndex;
		}
		
		if(index == null) return;
		
		// check connection points
		var shape = this.storage.paintObjects[index];
		if(shape.shouldCheckPointConnection()) {
			var prmLst = [];
			for(var t=0; t<this.storage.paintObjects.length; t++) {
				if(t != index && this.storage.paintObjects[t].shouldCheckPointConnection() ) {
					prmLst.push(new Promise(function(shape, shapeTwo, resolve, reject) { 
						this.hasConnectionPoint(shapeTwo, shape).then(function(shape, c) {
							resolve({ shape: shape, point: c[1] });
						}.bind(this, shape), function(shape, err) {
							resolve({ shape: shape, point: null }); 
						}.bind(this, shape));
					}.bind(this, shape, this.storage.paintObjects[t])));
				}
			}
			Promise.all(prmLst).then(function(values) {
				shape.clearAdditionalPoints('connections');
				for(var f=0; f<values.length; f++) {
					if(values[f].point != null) {
						shape.addAdditionalPoint('connections', values[f].point);
					}
				}
			}, function() {});
		}	
	},
	
	fireEvent: function(act, cat, payload) {
		var fnGetShapeData = function() {
			var shapeData = [];
			for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
				if(this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]]) {
					shapeData.push(this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].getParams());	
				}				
			}
			if(shapeData.length == 0 && this.tmp.currentObjIndex != null) {
				if(this.storage.paintObjects[this.tmp.currentObjIndex]) {
					shapeData.push(this.storage.paintObjects[this.tmp.currentObjIndex].getParams());	
				}
			}
			return shapeData;
		}.bind(this);

		switch(act) {
			case 'shape':
				switch(cat) {
					case 'add':	
						if(payload) {
							this.options.onAction(act, cat, payload.getParams());
						}
					case 'change':
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true) {
							this.options.onAction(act, cat, this.storage.paintObjects[this.tmp.currentObjIndex].getParams());
						}
						break;

					case 'addEnd':
					case 'changeEnd':
						if(this.tmp.currentObjIndex != null && this.storage.isMouseDown == true && this.storage.isMoving == true) {
							var tmpP = this.tmp.currentObjIndex ? (this.storage.paintObjects[this.tmp.currentObjIndex] ? this.storage.paintObjects[this.tmp.currentObjIndex].getParams() : null) : null;
							this.options.onAction(act, cat, tmpP);
						}
						break;

					case 'addImageEnd':
						this.options.onAction(act, 'addEnd', this.storage.paintObjects[payload].getParams());
						break;

					case 'onSelect':
						this.options.onAction(act, cat, fnGetShapeData());
						break;
						
					case 'onDeSelect':
						this.options.onAction(act,'onSelect', fnGetShapeData());
						break;
				};
				break;
			
			case 'action':
				switch(cat) {
					case 'clicked':	
						this.options.onAction(act, cat, payload);
					break;
				};
				break;
		};
	},
	
	animate: function() {
		this.storage.ctxTemp.clearRect(0, 0, this.storage.canvas.width, this.storage.canvas.height);
		
		for(var x=0; x<this.storage.paintObjects.length; x++) {
			this.storage.paintObjects[x].animate(this.storage.ctxTemp);
		}
		if(this.tmp.currentObj != null) {
			this.tmp.currentObj.animate(this.storage.ctxTemp);			
		}
	},
	
	paint: function() {
		this.animate();
		this.storage.ctx.clearRect(0, 0, this.storage.canvas.width, this.storage.canvas.height);
		this.storage.ctxHitmap.clearRect(0, 0, this.storage.canvas.width, this.storage.canvas.height);
		for(var x=0; x<this.storage.paintObjects.length; x++) {
			if(this.storage.paintObjects[x] != null) {
				this.storage.paintObjects[x].paint(this.storage.ctx);
				this.storage.paintObjects[x].paintHitMap(this.storage.ctxHitmap);	
			}
		}
		if(this.tmp.currentObjIndex != null && this.storage.paintObjects[this.tmp.currentObjIndex]) {
			this.storage.paintObjects[this.tmp.currentObjIndex].paintHitMap(this.storage.ctxHitmap);	
		}
	},
	hover: function() {
		var tmp = this.getIndexOfFirstItemHovered();
		
		if(this.tmp.currentHoverObjIndex != tmp) {
			for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
				this.storage.paintObjects[x].setMode('hover', false);
			}
		}
		
		if(tmp) {
			this.storage.paintObjects[tmp].setMode('hover', true);
		}
		
		this.animate();		
		this.tmp.currentHoverObjIndex = tmp;
		return tmp;
	},
	getCrossBrowserElementCoords: function(mouseEvent) {
		var result = {
			x: 0,
			y: 0
		};

		if (mouseEvent.pageX || mouseEvent.pageY) {
			result.x = mouseEvent.pageX;
			result.y = mouseEvent.pageY;
		} else if (mouseEvent.layerX || mouseEvent.layerY) {
			result.x = mouseEvent.layerX;
			result.y = mouseEvent.layerY;
		} else if (mouseEvent.clientX || mouseEvent.clientY) {
			result.x = mouseEvent.clientX + document.body.scrollLeft +
			document.documentElement.scrollLeft;
			result.y = mouseEvent.clientY + document.body.scrollTop +
			document.documentElement.scrollTop;
		}
		
		this.storage.mousePositionRaw = { x:result.x, y:result.y };

		result.x = Math.ceil(result.x - this.storage.boundingClientRect.x);
		result.y = Math.ceil(result.y - this.storage.boundingClientRect.y);

		if(result.x < 0) result.x = 0;
		if(result.y < 0) result.y = 0;
		if(result.x > this.storage.canvas.width) result.x = this.storage.canvas.width - 10;
		if(result.y > this.storage.canvas.height) result.y = this.storage.canvas.height - 10;

		return result;
    },
	
    getDimensions: function() { return { width:this.storage.canvas.width / this.storage.canvasRatio, height:this.storage.canvas.height / this.storage.canvasRatio }; },
    getGridSize: function() { return this.helper.sharedData.getGridSize(); },
    setGridSize: function(size) { this.helper.sharedData.setGridSize(size); },
	getContext: function() { return this.storage.ctx; },
	getContextTemp: function() { return this.storage.ctxTemp; },
	getContextHitMap: function() { return this.storage.ctxHitmap; },

	updateBoundingClientRect: function() {
		this.storage.boundingClientRect = this.options.rootElement.getBoundingClientRect();
		if(!this.storage.boundingClientRect.x && this.storage.boundingClientRect.left) {
			this.storage.boundingClientRect.x = this.storage.boundingClientRect.left;
			this.storage.boundingClientRect.y = this.storage.boundingClientRect.top;
		}			
		this.storage.boundingClientRect.x += (window.scrollX || window.pageXOffset);
		this.storage.boundingClientRect.y += (window.scrollY || window.pageYOffset);

		if(this.storage.boundingClientRect.width == 0 && this.storage.boundingClientRect.height == 0) {
			this.storage.boundingClientRect = { x: 0, y: 0, width: 1122.5166015625, height: 793.7000122070312, top: 0, right: 1122.5166015625, bottom: 793.7000122070312, left: 0 };
		}
	},
	
	selectShapes: function(arrOfShapeIds) {
		if(arrOfShapeIds.length == 0) return;
		
		this.deselectAllShapes();
		
		var indexes = [];
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			if(arrOfShapeIds.indexOf(this.storage.paintObjects[x].getId()) > -1) {
				indexes.push(x);
			}
		}
		
		if(indexes.length == 1) {
			this.tmp.currentObjIndex = indexes[0];
			this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', true);
			this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', true);
			this.storage.paintObjects[this.tmp.currentObjIndex].setMode('multiSelect', false);
		} else {
			this.tmp.selectedObjectsIndex = indexes;
			for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('hover', true);
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('selected', true);
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('multiSelect', true);
			}
		}
		
		this.paint();
		this.fireEvent('shape','onSelect');
	},
	
	_getShapesById: function(shapeIdOne, shapeIdTwo) {
		if(typeof shapeIdOne === 'object' && typeof shapeIdTwo === 'object' ) {
			return {
				shapeOne: shapeIdOne,
				shapeTwo: shapeIdTwo
			};
		}
		var shapeOne = null;
		var shapeTwo = null;
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			if(this.storage.paintObjects[x].getId() == shapeIdOne) {
				shapeOne = this.storage.paintObjects[x];
			} else if(this.storage.paintObjects[x].getId() == shapeIdTwo) {
				shapeTwo = this.storage.paintObjects[x];
			}
			if(shapeOne != null && shapeTwo != null) {
				x = this.storage.paintObjects.length;
			}
		}
		return {
			shapeOne: shapeOne,
			shapeTwo: shapeTwo
		};
	},
	
	hasConnectionPoint: function(shapeIdOne, shapeIdTwo) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			if(!shapes.shapeOne.shouldCheckPointConnection() || !shapes.shapeTwo.shouldCheckPointConnection()) {
				reject(403);
				return;
			}
			
			var typeSwitch = shapes.shapeOne.getType() + '#' + shapes.shapeTwo.getType();
						
			switch(typeSwitch) {
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.PATH:
				case Ramani.SHAPETYPES.CURVE + '#' + Ramani.SHAPETYPES.PATH:
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.CURVE:
				case Ramani.SHAPETYPES.CURVE + '#' + Ramani.SHAPETYPES.CURVE:
					var p1 = shapes.shapeOne.getPointRaw('positionStart');
					var p2 = shapes.shapeOne.getPointRaw('positionEnd');
					var p3 = shapes.shapeTwo.getPointRaw('positionStart');
					var p4 = shapes.shapeTwo.getPointRaw('positionEnd');

					if(HelperFunctions.pointsAreEqual(p1,p3)) {
						resolve([p1,p3,'#1.1']);
					} else if(HelperFunctions.pointsAreEqual(p1,p4)) {
						resolve([p1,p4,'#1.2']);
					} else if(HelperFunctions.pointsAreEqual(p3,p2)) {
						resolve([p3,p2,'#1.3']);
					} else if(HelperFunctions.pointsAreEqual(p4,p2)) {
						resolve([p4,p2,'#1.4']);
					} else {
						reject(400);	
					}
					break;
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.SOURCE_DESTINATION:
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.SOURCE:
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.DESTINATION:
				case Ramani.SHAPETYPES.PATH + '#' + Ramani.SHAPETYPES.TUGGERSTOPPOINT:
					var p1 = shapes.shapeOne.getPointRaw('positionStart');
					var p2 = shapes.shapeOne.getPointRaw('positionEnd');

					var pS = shapes.shapeTwo.getPointRaw('positionStart');
					var pE = shapes.shapeTwo.getPointRaw('positionEnd');
					var gridSize = this.helper.sharedData.getGridSize();
					var found = false;
					for(var t = Math.min(pS.x, pE.x); t <= Math.max(pS.x, pE.x); t = t + gridSize) {
						var list = []
						if(t == Math.min(pS.x, pE.x) || t == Math.max(pS.x, pE.x)) {
							for(var y = Math.min(pS.y, pE.y); y <= Math.max(pS.y, pE.y); y = y + gridSize) {
								var pT = { x:t, y:y };
								list.push(pT);
							}
						} else {
							list.push({ x:t, y: Math.min(pS.y, pE.y) });
							list.push({ x:t, y: Math.max(pS.y, pE.y) });
						}

						for(var y = 0; y < list.length; y++) {
							if(HelperFunctions.pointsAreEqual(p1,list[y])) {
								found = true;
								resolve([p1,list[y],'#2.1']);
							} else if(HelperFunctions.pointsAreEqual(p2,list[y])) {
								found = true;
								resolve([p2,list[y],'#2.2']);
							} 
						}
					}

					if(!found) {
						reject(400);	
					}
					break;
				case Ramani.SHAPETYPES.SOURCE_DESTINATION + '#' + Ramani.SHAPETYPES.PATH:
				case Ramani.SHAPETYPES.SOURCE + '#' + Ramani.SHAPETYPES.PATH:
				case Ramani.SHAPETYPES.DESTINATION + '#' + Ramani.SHAPETYPES.PATH:
				case Ramani.SHAPETYPES.TUGGERSTOPPOINT + '#' + Ramani.SHAPETYPES.PATH:
					var p1 = shapes.shapeTwo.getPointRaw('positionStart');
					var p2 = shapes.shapeTwo.getPointRaw('positionEnd');

					var pS = shapes.shapeOne.getPointRaw('positionStart');
					var pE = shapes.shapeOne.getPointRaw('positionEnd');
					var gridSize = this.helper.sharedData.getGridSize();
					var found = false;
					for(var t = Math.min(pS.x, pE.x); t <= Math.max(pS.x, pE.x); t = t + gridSize) {
						var list = []
						if(t == Math.min(pS.x, pE.x) || t == Math.max(pS.x, pE.x)) {
							for(var y = Math.min(pS.y, pE.y); y <= Math.max(pS.y, pE.y); y = y + gridSize) {
								var pT = { x:t, y:y };
								list.push(pT);
							}
						} else {
							list.push({ x:t, y: Math.min(pS.y, pE.y) });
							list.push({ x:t, y: Math.max(pS.y, pE.y) });
						}

						for(var y = 0; y < list.length; y++) {
							if(HelperFunctions.pointsAreEqual(p1,list[y])) {
								found = true;
								resolve([list[y],p1,'#2.3']);
							} else if(HelperFunctions.pointsAreEqual(p2,list[y])) {
								found = true;
								resolve([list[y],p2,'#2.4']);
							} 
						}
					}

					if(!found) {
						reject(400);	
					}
					break;
				default:
					reject(400);	
					break;
			};
		}.bind(this));
	},
	
	couldAddRoundingShape: function(shapeIdOne, shapeIdTwo) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);

			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			if(shapes.shapeOne.getType() != Ramani.SHAPETYPES.PATH || shapes.shapeTwo.getType() != Ramani.SHAPETYPES.PATH) {
				reject(500);
				return;
			}

			if(this.helper.sharedData.getFactorPXtoM() == 1) {
				reject('missing refline');
				return;
			}
			
			var ret = {
				shapeOneId: shapes.shapeOne.getId(),
				shapeTwoId: shapes.shapeTwo.getId(),
				curve: false,
				crossRoad: false,
				threeWayJunction: false,
				point: HelperFunctions.findIntersectionPoint({
				   shapeOne: shapes.shapeOne,
				   shapeTwo: shapes.shapeTwo
			   	})
			};

			if(ret.point == null) {
				resolve(ret);
				return;
			}
			
			Promise.all([new Promise(function(res, rej) {
				return this.couldCreateCurve(shapes.shapeOne, shapes.shapeTwo).then(function(p) {
					ret.curve = true; 
					ret.point = p;
				}, function() { ret.curve = false; }).finally(function() { res(); });
			}.bind(this)), new Promise(function(res, rej) {
				return this.couldCreateCrossRoad(shapes.shapeOne, shapes.shapeTwo).then(function(p) {
					ret.crossRoad = true; 
					ret.point = p;
				}, function() { ret.crossRoad = false; }).finally(function() { res(); });
			}.bind(this)), new Promise(function(res, rej) {
				return this.couldCreateThreeWayJunction(shapes.shapeOne, shapes.shapeTwo).then(function(p) { 
					ret.threeWayJunction = true; 
					ret.point = p;
				}, function() { ret.threeWayJunction = false; }).finally(function() { res(); });
			}.bind(this))]).then(function() {
			   	resolve(ret);
			}.bind(this));
		}.bind(this));
	},
	
	couldCreateThreeWayJunction: function(shapeIdOne, shapeIdTwo) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			if(this.helper.sharedData.getFactorPXtoM() == 1) {
				reject('missing refline');
				return
			}

			var getPointOnPath = function(p1, p2, p3) {
				if(p2.x == p1.x) {
					if(p3.x != p1.x) return false;
					return (Math.min(p1.y, p2.y) < p3.y && p3.y < Math.max(p1.y, p2.y));
				}
		        var m = (p2.y - p1.y) / (p2.x - p1.x);
		        var b = p2.y - m * p2.x;
				var y = m * p3.x + b;
				return p3.y == y;
		    };
			
			var p1 = shapes.shapeOne.getPointRaw('positionStart');
			var p2 = shapes.shapeOne.getPointRaw('positionEnd');
			var p3 = shapes.shapeTwo.getPointRaw('positionStart');
			var p4 = shapes.shapeTwo.getPointRaw('positionEnd');

			if(HelperFunctions.pointsAreEqual(p1,p3) || HelperFunctions.pointsAreEqual(p1,p4) || HelperFunctions.pointsAreEqual(p3,p2) || HelperFunctions.pointsAreEqual(p4,p2)) {
				reject(500);
				return;
			}

			var s = getPointOnPath(p1, p2, p3);
			if(s) { resolve(p3); return; }
			var s = getPointOnPath(p1, p2, p4);
			if(s) { resolve(p4); return; }
			var s = getPointOnPath(p3, p4, p1);
			if(s) { resolve(p1); return; }
			var s = getPointOnPath(p3, p4, p2);
			if(s) { resolve(p2); return; }
			
			reject(404);
		}.bind(this));
	},
	
	couldCreateCurve: function(shapeIdOne, shapeIdTwo) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			if(this.helper.sharedData.getFactorPXtoM() == 1) {
				reject('missing refline');
				return
			}
			
			var p1 = null;
			if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionStart'), shapes.shapeTwo.getPointRaw('positionStart'))) {
				p1 = shapes.shapeOne.getPointRaw('positionStart');
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionStart'), shapes.shapeTwo.getPointRaw('positionEnd'))) {
				p1 = shapes.shapeOne.getPointRaw('positionStart');
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionEnd'), shapes.shapeTwo.getPointRaw('positionStart'))) {
				p1 = shapes.shapeOne.getPointRaw('positionEnd');
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionEnd'), shapes.shapeTwo.getPointRaw('positionEnd'))) {
				p1 = shapes.shapeOne.getPointRaw('positionEnd');
			} else {
				reject(500);
				return;
			}
			resolve(p1);
		}.bind(this));
	},
	
	couldCreateCrossRoad: function(shapeIdOne, shapeIdTwo) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}

			if(this.helper.sharedData.getFactorPXtoM() == 1) {
				reject('missing refline');
				return
			}
			
			var p1 = shapes.shapeOne.getPointRaw('positionStart');
			var p2 = shapes.shapeOne.getPointRaw('positionEnd');
			var p3 = shapes.shapeTwo.getPointRaw('positionStart');
			var p4 = shapes.shapeTwo.getPointRaw('positionEnd');

			if(HelperFunctions.pointsAreEqual(p1,p3) || HelperFunctions.pointsAreEqual(p1,p4) || HelperFunctions.pointsAreEqual(p3,p2) || HelperFunctions.pointsAreEqual(p4,p2)) {
				reject(500);
				return;
			}
			
			var point1 = HelperFunctions.findIntersectionPoint({
				shapeOne: shapes.shapeOne,
				shapeTwo: shapes.shapeTwo
			});
			var point2 = HelperFunctions.findIntersectionPoint({
				p0: p3, 
				p1: p4, 
				p2: p1, 
				p3: p2
			});
			if(point1 == null || point2 == null || !HelperFunctions.pointsAreEqual(point1,point2)){
				reject(500);
			} else {
				if(
					HelperFunctions.pointsAreEqual(point1,p1) ||
					HelperFunctions.pointsAreEqual(point1,p2) ||
					HelperFunctions.pointsAreEqual(point1,p3) ||
					HelperFunctions.pointsAreEqual(point1,p4)
				) {
					reject(300);
				} else {
					resolve(point1);
				}
			}
		}.bind(this));
	},
	
	addThreeWayJunction: function(shapeIdOne, shapeIdTwo, opts) {
		var options = Object.assign({
		   shortenPath: false,
		   radius: 1.5
	   	}, opts || {});
		
		var undoChanges = [];
		
		return new Promise(function(resolve, reject) {
			this.couldCreateThreeWayJunction(shapeIdOne, shapeIdTwo).then(function(point) {
				var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
				
				if(this.helper.sharedData.getFactorPXtoM() == 1) {
					reject('missing refline');
					return
				}
				
				var shapeThatHits = 'shapeOne';
				if(HelperFunctions.pointsAreEqual(point, shapes.shapeOne.getPointRaw('positionStart')) || HelperFunctions.pointsAreEqual(point, shapes.shapeOne.getPointRaw('positionEnd'))) {
					shapeThatHits = 'shapeTwo';
				}
				
				undoChanges.push({
					type: 'EDIT',
					shapeId: shapes.shapeOne.getId(),
					params: { 
						positionStart: shapes.shapeOne.getPointRaw('positionStart'),
						positionEnd: shapes.shapeOne.getPointRaw('positionEnd') 
					}
				});
				undoChanges.push({
					type: 'EDIT',
					shapeId: shapes.shapeTwo.getId(),
					params: { 
						positionStart: shapes.shapeTwo.getPointRaw('positionStart'),
						positionEnd: shapes.shapeTwo.getPointRaw('positionEnd') 
					}
				});
				
				// slit line where other line hits to we create a new line with endpoint of the hit location
				// -| => -'-
				this._createShape({
	                type: Ramani.SHAPETYPES.PATH
	            }).then(function(inst) {
					inst.copyColorFrom(shapes.shapeOne);
					shapes.shapeThree = inst;
					inst.setPoint('positionStart', point);
		            inst.setPoint('positionEnd', shapes[shapeThatHits].getPointRaw('positionEnd'));
		            inst.setMode('hover', false);
		            inst.setMode('selected', false);
		            inst.setMode('multiSelect', false);
					this._addShapeToMap(inst, undefined, true);
					undoChanges.push({
						type: 'ADD',
						shapeId: inst.getId()
					});
					shapes[shapeThatHits].setPoint('positionEnd', point);
					
					return this._createShape({
						type: Ramani.SHAPETYPES.CURVE,
						radius: options.radius
					});
				}.bind(this)).then(function(inst) {
					shapes.curveOne = inst;
					inst.copyColorFrom(shapes.shapeOne);
					inst.setMode('hover', false);
					inst.setMode('selected', false);
					inst.setMode('multiSelect', false);
					this._addShapeToMap(inst, undefined, true);
					undoChanges.push({
						type: 'ADD',
						shapeId: inst.getId()
					});
					return inst.connectCurve({
						shortenPath: true, // NEW T-JUNCTION without middle line
						//shortenPath: options.shortenPath, // OLD T-JUNCTION with middle line
						shapeIdOne: shapes.shapeOne,
						shapeIdTwo: shapes.shapeTwo,
						connectionPoint: point,
						shapeIdOneConnection: HelperFunctions.pointsAreEqual(point, shapes.shapeOne.getPointRaw('positionEnd')) ? 'positionStart': 'positionEnd',
						shapeIdTwoConnection: HelperFunctions.pointsAreEqual(point, shapes.shapeTwo.getPointRaw('positionEnd')) ? 'positionStart': 'positionEnd'
					}, undoChanges);
				}.bind(this)).then(function(inst) {	
					var tmp = shapes.curveOne.getConnectionData();
					return this._createShape({
		                type: Ramani.SHAPETYPES.PATH,
						positionStart: shapeThatHits == 'shapeTwo' ? tmp.p2p1[0] : tmp.p3p1[0],
						positionEnd: shapeThatHits == 'shapeTwo' ? tmp.p2p1[1] : tmp.p3p1[1]
		            });
				}.bind(this)).then(function(inst) {	
					shapes.shapeFour = inst;
					inst.copyColorFrom(shapes.shapeOne);

					return this._createShape({
						type: Ramani.SHAPETYPES.CURVE,
						radius: options.radius
					});	
				}.bind(this)).then(function(inst) {
					shapes.curveTwo = inst;
					inst.copyColorFrom(shapes.shapeOne);
					inst.setMode('hover', false);
					inst.setMode('selected', false);
					inst.setMode('multiSelect', false);
					this._addShapeToMap(inst, undefined, true);
					undoChanges.push({
						type: 'ADD',
						shapeId: inst.getId()
					});
					
					return inst.connectCurve({
						shortenPath: true, // lines are created from other curve
						shapeIdOne: shapes.shapeFour,
						shapeIdTwo: shapes.shapeThree,
						connectionPoint: point,
						shapeIdOneConnection: HelperFunctions.pointsAreEqual(point, shapes.shapeFour.getPointRaw('positionEnd')) ? 'positionStart': 'positionEnd',
						shapeIdTwoConnection: HelperFunctions.pointsAreEqual(point, shapes.shapeThree.getPointRaw('positionEnd')) ? 'positionStart': 'positionEnd'
					}, undoChanges);
				}.bind(this)).then(function(inst) {	
	
					var tmp = shapes.curveTwo.getConnectionData();
					return this._createShape({
		                type: Ramani.SHAPETYPES.PATH,
						positionStart: shapeThatHits == 'shapeTwo' ? tmp.p2p1[0] : tmp.p3p1[0],
						positionEnd: shapeThatHits == 'shapeTwo' ? tmp.p2p1[1] : tmp.p3p1[1]
		            });
				}.bind(this)).then(function(inst) {	
					if(options.shortenPath == false) {
						var tmpCDC2 = shapes.curveTwo.getConnectionData();
						var tmpCDC1 = shapes.curveOne.getConnectionData();
						
	                   	inst.copyColorFrom(shapes.shapeOne);
	                    //inst.setPoint('positionStart', point);  // OLD T-JUNCTION with middle line
						inst.setPoint('positionStart', shapeThatHits == 'shapeTwo' ? tmpCDC1.p3p1[0] : tmpCDC1.p2p1[0]); // NEW T-JUNCTION without middle line
	                    inst.setPoint('positionEnd', tmpCDC2.p3p1[0]);
	                    inst.setMode('hover', false);
	                    inst.setMode('selected', false);
	                    inst.setMode('multiSelect', false);
	                    this._addShapeToMap(inst, undefined, true);
                        undoChanges.push({
        					type: 'ADD',
        					shapeId: inst.getId()
        				});
					}
				}.bind(this))
				.then(function(inst) {	
					this.helper.undo.addHistoryStep({
						changes: undoChanges
					});
					this.paint();
					resolve();
				}.bind(this))
				.catch(error => { reject(error.message); });
			}.bind(this), function() {
				reject(404);
			}.bind(this))
		}.bind(this));
	},

	addCurve: function(shapeIdOne, shapeIdTwo, opts) {
		var options = Object.assign({
		   shortenPath: true,
		   radius: 1.5
	   	}, opts || {});
		
		var undoChanges = [];

		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			undoChanges.push({
				type: 'EDIT',
				shapeId: shapes.shapeOne.getId(),
				params: { 
					positionStart: shapes.shapeOne.getPointRaw('positionStart'),
					positionEnd: shapes.shapeOne.getPointRaw('positionEnd') 
				}
			});
			undoChanges.push({
				type: 'EDIT',
				shapeId: shapes.shapeTwo.getId(),
				params: { 
					positionStart: shapes.shapeTwo.getPointRaw('positionStart'),
					positionEnd: shapes.shapeTwo.getPointRaw('positionEnd') 
				}
			});

			var p1 = null;
			var p2Field = '';
			var p3Field = '';
			if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionStart'), shapes.shapeTwo.getPointRaw('positionStart'))) {
				p1 = shapes.shapeOne.getPointRaw('positionStart');
				p2Field = 'positionEnd';
				p3Field = 'positionEnd';
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionStart'), shapes.shapeTwo.getPointRaw('positionEnd'))) {
				p1 = shapes.shapeOne.getPointRaw('positionStart');
				p2Field = 'positionEnd';
				p3Field = 'positionStart';
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionEnd'), shapes.shapeTwo.getPointRaw('positionStart'))) {
				p1 = shapes.shapeOne.getPointRaw('positionEnd');
				p2Field = 'positionStart';
				p3Field = 'positionEnd';
			} else if(HelperFunctions.pointsAreEqual(shapes.shapeOne.getPointRaw('positionEnd'), shapes.shapeTwo.getPointRaw('positionEnd'))) {
				p1 = shapes.shapeOne.getPointRaw('positionEnd');
				p2Field = 'positionStart';
				p3Field = 'positionStart';
			} else {
				reject(500);
				return;
			}
			
			this._createShape({
				type: Ramani.SHAPETYPES.CURVE,
				radius: options.radius
			}).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				inst.setMode('hover', false);
				inst.setMode('selected', false);
				inst.setMode('multiSelect', false);
				
				this.fireEvent('shape','add', inst);

				return inst.connectCurve({
					shortenPath: options.shortenPath,
					shapeIdOne: shapeIdOne,
		            shapeIdTwo: shapeIdTwo,
		            connectionPoint: p1,
		            shapeIdOneConnection: p2Field,
		            shapeIdTwoConnection: p3Field
				}, undoChanges);
			}.bind(this), function(e1) { reject(500-2); }).then(function(inst) {	
				this.tmp.currentObjIndex = this._addShapeToMap(inst, undefined, true);				
				this.paint();
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				this.helper.undo.addHistoryStep({
					changes: undoChanges
				});
				resolve(inst.getParams());
			}.bind(this), function(e1) {
				reject(500-3);
			});
		}.bind(this));
	},
	
	addCrossRoad: function(shapeIdOne, shapeIdTwo, opts) {
		var options = Object.assign({
		   shortenPath: false,
		   radius: 1.5
	   	}, opts || {});
		
		var undoChanges = [];
		
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			undoChanges.push({
				type: 'EDIT',
				shapeId: shapes.shapeOne.getId(),
				params: { 
					positionStart: shapes.shapeOne.getPointRaw('positionStart'),
					positionEnd: shapes.shapeOne.getPointRaw('positionEnd') 
				}
			});
			undoChanges.push({
				type: 'EDIT',
				shapeId: shapes.shapeTwo.getId(),
				params: { 
					positionStart: shapes.shapeTwo.getPointRaw('positionStart'),
					positionEnd: shapes.shapeTwo.getPointRaw('positionEnd') 
				}
			});

			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}

			var point = HelperFunctions.findIntersectionPoint({
				shapeOne: shapes.shapeOne,
				shapeTwo: shapes.shapeTwo
			});
			if(point == null){
				reject(500);
				return;
			}
			
			shapes.shapeThree = null;
			shapes.shapeFour = null;
			shapes.curveOne = null;
			shapes.curveTwo = null;
			
			this._createShape({
                type: Ramani.SHAPETYPES.PATH
            }).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				shapes.shapeThree = inst;
				inst.setPoint('positionStart', point);
	            inst.setPoint('positionEnd', shapes.shapeOne.getPointRaw('positionEnd'));
	            inst.setMode('hover', false);
	            inst.setMode('selected', false);
	            inst.setMode('multiSelect', false);
				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				shapes.shapeOne.setPoint('positionEnd', point);
				
	  			return this._createShape({
	                type: Ramani.SHAPETYPES.PATH
	            });
			}.bind(this)).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				shapes.shapeFour = inst;
				inst.setPoint('positionStart', point);
	            inst.setPoint('positionEnd', shapes.shapeTwo.getPointRaw('positionEnd'));
	            inst.setMode('hover', false);
	            inst.setMode('selected', false);
	            inst.setMode('multiSelect', false);
				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				shapes.shapeTwo.setPoint('positionEnd', point);

				return this._createShape({
					type: Ramani.SHAPETYPES.CURVE,
					radius: options.radius
				});
			}.bind(this)).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				shapes.curveOne = inst;
				inst.setMode('hover', false);
				inst.setMode('selected', false);
				inst.setMode('multiSelect', false);
				
				this.fireEvent('shape','add', inst);
				
				return inst.connectCurve({
					//shortenPath: options.shortenPath, // old version with middle point in cross
					shortenPath: true, // new version without point in cross middle
					shapeIdOne: shapes.shapeOne.getId(),
					shapeIdTwo: shapes.shapeFour.getId(),
					connectionPoint: point,
					shapeIdOneConnection: 'positionStart',
					shapeIdTwoConnection: 'positionEnd'
				}, undoChanges);
			}.bind(this)).then(function(inst) {	
				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				return this._createShape({
					type: Ramani.SHAPETYPES.CURVE,
					radius: options.radius
				});				
			}.bind(this)).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				shapes.curveTwo = inst;
				inst.setMode('hover', false);
				inst.setMode('selected', false);
				inst.setMode('multiSelect', false);
				
				this.fireEvent('shape','add', inst);
				
				return inst.connectCurve({
					//shortenPath: options.shortenPath, // old version with middle point in cross
					shortenPath: true, // new version without point in cross middle
					shapeIdOne: shapes.shapeTwo.getId(),
					shapeIdTwo: shapes.shapeThree.getId(),
					connectionPoint: point,
					shapeIdOneConnection: 'positionStart',
					shapeIdTwoConnection: 'positionEnd'
				}, undoChanges);
			}.bind(this)).then(function(inst) {	
				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				return this._createShape({
					type: Ramani.SHAPETYPES.CURVE,
					radius: options.radius
				});	
			}.bind(this)).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				inst.setConnected(true);
				inst.setMode('hover', false);
				inst.setMode('selected', false);
				inst.setMode('multiSelect', false);
				inst.setPoint('positionStart', shapes.curveOne.getPointRaw('positionStart'));
				inst.setPoint('positionEnd', shapes.curveTwo.getPointRaw('positionStart'));
				inst.setPoint('positionControll', { x: shapes.curveTwo.getPointRaw('positionControll').x, y: shapes.curveOne.getPointRaw('positionControll').y});

				this.fireEvent('shape','add', inst);

				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				return this._createShape({
					type: Ramani.SHAPETYPES.CURVE,
					radius: options.radius
				});	
			}.bind(this)).then(function(inst) {
				inst.copyColorFrom(shapes.shapeOne);
				inst.setConnected(true);
				inst.setMode('hover', false);
				inst.setMode('selected', false);
				inst.setMode('multiSelect', false);
				inst.setPoint('positionStart', shapes.curveOne.getPointRaw('positionEnd'));
				inst.setPoint('positionEnd', shapes.curveTwo.getPointRaw('positionEnd'));
				inst.setPoint('positionControll', { x: shapes.curveOne.getPointRaw('positionControll').x, y: shapes.curveTwo.getPointRaw('positionControll').y});

				this.fireEvent('shape','add', inst);
				this._addShapeToMap(inst, undefined, true);
				undoChanges.push({
					type: 'ADD',
					shapeId: inst.getId()
				});
				
				return this._createShape({
	                type: Ramani.SHAPETYPES.PATH
	            });
			}.bind(this)).then(function(inst) {
				if(options.shortenPath == false) { // \ line
					inst.copyColorFrom(shapes.shapeOne);
					inst.setPoint('positionStart', shapes.curveOne.getPointRaw('positionStart'));
		            inst.setPoint('positionEnd', shapes.curveTwo.getPointRaw('positionEnd'));
		            inst.setMode('hover', false);
		            inst.setMode('selected', false);
		            inst.setMode('multiSelect', false);
					this._addShapeToMap(inst, undefined, true);
					undoChanges.push({
						type: 'ADD',
						shapeId: inst.getId()
					});
				}
				
				return this._createShape({
	                type: Ramani.SHAPETYPES.PATH
	            });
			}.bind(this)).then(function(inst) {
				if(options.shortenPath == false) { // - line
					inst.copyColorFrom(shapes.shapeOne);
					inst.setPoint('positionStart', shapes.curveOne.getPointRaw('positionEnd'));
		            inst.setPoint('positionEnd', shapes.curveTwo.getPointRaw('positionStart'));
		            inst.setMode('hover', false);
		            inst.setMode('selected', false);
		            inst.setMode('multiSelect', false);
					this._addShapeToMap(inst, undefined, true);
					undoChanges.push({
						type: 'ADD',
						shapeId: inst.getId()
					});
				}

				this.helper.undo.addHistoryStep({
					changes: undoChanges
				});
				this.paint();
				resolve();				
			}.bind(this)).catch(function() {
				reject(500);
			});
		}.bind(this));
	},
	
	exportAsDXF: function() {
		var exporter = new HelperExportDXF();
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			var tmp = this.storage.paintObjects[x].toDxfString();
			if(tmp != null) {
				exporter.addShape(tmp);
			}
		}							
		return exporter.toDxfString();
	},
	
	exportJSON: function() {
		var exporter = new HelperExportImportJSON();
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			exporter.addShape(this.storage.paintObjects[x]);
		}
		return exporter.export({
			zoomAndMove: this.helper.zoomAndMove.toJSON()
		});
	},
	
	exportJSONObjects: function() {
		var exporter = new HelperExportImportJSON();
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			exporter.addShape(this.storage.paintObjects[x]);
		}
		return exporter.exportObject({
			zoomAndMove: this.helper.zoomAndMove.toJSON()
		});
	},
	
	clearMap: function() {
		this.tmp.currentObjIndex = null;
		this.storage.isMouseDown == false;
		this.storage.paintObjects = [this.storage.backgroundGrid];
		this.paint();
	},
	
	importJSON: function() {
		return new Promise(function(resolve, reject) {
			new HelperExportImportJSON().import().then(function(importedData) {
				this.importSavedMap(importedData).then(resolve, reject);		
			}.bind(this), function() {}.bind(this));
		}.bind(this));	
	},
	
	importSavedMap: function(importedData) {
		return new Promise(function(resolve, reject) {
			if(importedData.hasOwnProperty('zoomAndMove') && importedData.zoomAndMove != null) {
				this.helper.zoomAndMove.fromJSON(importedData.zoomAndMove);
			}
			var shapes = importedData.layer.base.shapes;
			var promises = [];
			for(var x=0; x<shapes.length; x++) {
				if(shapes[x].type == Ramani.SHAPETYPES.ACTION_POINT) continue;
				
				if(shapes[x].hasOwnProperty('display')) {
					delete shapes[x].display;
				}
				promises.push(this._createShape(shapes[x]).then(function(inst) {
					if(!inst.isValid()) { return; }
					inst.setMode('hover', false);
					inst.setMode('selected', false);
					inst.setMode('multiSelect', false);
					if(inst.getType() == Ramani.SHAPETYPES.IMAGE || inst.getType() == Ramani.SHAPETYPES.CLIPART) {
						this._addShapeToMap(inst, 1);
					} else {
						this._addShapeToMap(inst);	
					}
				}.bind(this)));						
			}
			Promise.all(promises).then(function() {
				this.paint();
				resolve();	
			}.bind(this));
		}.bind(this));				
	},
	
	importJSONObjects: function(shapes) {
		return new Promise(function(resolve, reject) {
			var promises = [];
			for(var x=0; x<shapes.length; x++) {
				if(shapes[x].hasOwnProperty('display')) {
					delete shapes[x].display;
				}
				var imp = shapes[x].hasOwnProperty('params') ? shapes[x].params : shapes[x];
				promises.push(this._createShape(Object.assign({
					id: shapes[x].id,
					type: shapes[x].type
				}, imp)).then(function(inst) {
					if(!inst.isValid()) { return; }
					inst.setMode('hover', false);
					inst.setMode('selected', false);
					if(inst.getType() == Ramani.SHAPETYPES.IMAGE || inst.getType() == Ramani.SHAPETYPES.CLIPART) {
						this._addShapeToMap(inst, 1);
					} else {
						this._addShapeToMap(inst);	
					}
				}.bind(this)));
			}
			Promise.all(promises).then(function() {
				this.paint();
				resolve();	
			}.bind(this));			
		}.bind(this));
	},
	
	zoomOut: function() {
		this.helper.zoomAndMove.zoom(1, { x: this.storage.canvas.width / 2, y: this.storage.canvas.height / 2 });
		this.paint();
	},

	zoomIn: function() {
		this.helper.zoomAndMove.zoom(-1, { x: this.storage.canvas.width / 2, y: this.storage.canvas.height / 2 });
		this.paint();
	},
	
	switchAction: function(action) {
		return new Promise(function(resolve, reject) {
			switch(action) {
				case Ramani.ACTION.MOVE:
				 	this.storage.mode = 'move';
					break;
				case Ramani.ACTION.SELECT:
				 	this.storage.mode = 'select';
					break;
				case Ramani.ACTION.NONE:
				 	this.storage.mode = 'none';
					break;
				case Ramani.ACTION.CREATE:
					this.storage.mode = 'create';
					break;					
				default: 
					reject();
					break;
			};
/*
			for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
				this.storage.paintObjects[x].setMode('selected', false);
				this.storage.paintObjects[x].setMode('hover', false);
			}
			this.tmp.currentObjIndex = null;
*/
			this.paint();
			resolve();
		}.bind(this));
	},
	
	deselectAllShapes: function() {
		if(this.tmp.currentObjIndex != null) {
			this.storage.paintObjects[this.tmp.currentObjIndex].setMode('hover', false);
			this.storage.paintObjects[this.tmp.currentObjIndex].setMode('selected', false);
			this.tmp.currentObjIndex = null;	
			this.fireEvent('shape','onDeSelect');
		}
		if(this.tmp.selectedObjectsIndex.length > 0) {
			for(var x=0; x<this.tmp.selectedObjectsIndex.length; x++) {
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('hover', false);
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('selected', false);
				this.storage.paintObjects[this.tmp.selectedObjectsIndex[x]].setMode('multiSelect', false);
			}
			this.tmp.selectedObjectsIndex = [];
			this.clearActionPoints();
			this.fireEvent('shape','onDeSelect');
		}
	},
	
	switchShapeType: function(shape) {
		return new Promise(function(resolve, reject) {
			for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
				this.storage.paintObjects[x].setMode('selected', false);
				this.storage.paintObjects[x].setMode('hover', false);
			}
			this.tmp.currentObjIndex = null;
			this.storage.currentPaintObjectType = shape;
			
			if(this.storage.currentPaintObjectType == Ramani.SHAPETYPES.IMAGE) {
				this._createShape({
					type: this.storage.currentPaintObjectType,
					positionStart: this.helper.zoomAndMove.getWorldOrigin()
				}).then(function(inst) {
					var index = this._addShapeToMap(inst, 1);
					this.storage.paintObjects[index].setMode('hover', false);
					this.storage.paintObjects[index].setMode('selected', false);
					this.fireEvent('shape','addImageEnd', index);

					this.paint();
					resolve();
				}.bind(this));
			} else {
				resolve();
			}
		}.bind(this));
	},
	
	deleteShape: function(shapeId, skipHistory) {
		return new Promise(function(resolve, reject) {
			var objInd = this.getShapeIndexById(shapeId);
			if(objInd == null) {
				reject(404);
				return;
			}
			this._removeShapeFromMap(objInd, skipHistory);
		
			this.paint();
			resolve();
		}.bind(this));
	},

	changeShapeParameter: function(shapeId, propertyName, value) {
		return new Promise(function(resolve, reject) {
			var obj = this.getShapeById(shapeId);
			if(!obj) {
				reject(404);
				return;
			}
		
			var r = obj.changeParameter(propertyName, value);
			this.paint();
			if(r === false) {
				resolve(obj.getParams());
			} else {
				resolve(obj.getParams());
			}
		}.bind(this));
	},
	
	setZIndex: function(shapeId, value) {
		return new Promise(function(resolve, reject) {
			var objInd = this.getShapeIndexById(shapeId);
			if(objInd == null) {
				reject(404);
				return;
			}
			this._changeShapeIndexOnMap(objInd, Number(value));
			this.paint();
			resolve();
		}.bind(this));
	},
	
	getShapeById: function(shapeId) {
		var shapeObj = null;
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			if(this.storage.paintObjects[x].getId() == shapeId) {
				shapeObj = this.storage.paintObjects[x];
				x = this.storage.paintObjects.length;
			}
		}
		return shapeObj;
	},
	
	getShapeIndexById: function(shapeId) {
		var shapeObjIndex = null;
		for(var gsix = 1; gsix < this.storage.paintObjects.length; gsix++) { // skip grid ...
			if(this.storage.paintObjects[gsix].getId() == shapeId) {
				shapeObjIndex = gsix;
				break;
			}
		}
		return shapeObjIndex;
	},
	
	resetColor: function(shapeId) {
		return new Promise(function(resolve, reject) {
			if(shapeId) {
				var obj = this.getShapeById(shapeId);
				if(!obj) {
					reject(404);
					return;
				}
				obj.resetColor();
				this.paint();
				resolve(obj.getParams());
			} else {
				for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
					this.storage.paintObjects[x].resetColor();
				}
				this.paint();
				resolve();
			}
		}.bind(this));
	},
	
	findPath: function(shapeId, opts) {
		return new Promise(function(resolve, reject) {
			var options = Object.assign({
	            targetShapeIds: null,
				targetShapeTypes: null,
				onlyShortestPath: false,
				onlyTuggerTrain: false,
				onlyUseRoads: true
	        }, opts || {});
			
			if(options.onlyTuggerTrain == true && options.targetShapeIds == null) {
				options.targetShapeIds = null;
			}
			
			var rootShape = this.getShapeById(shapeId);
			if(!rootShape) {
				resolve([]);
				return;
			}
		
			var map = {};
			var fnAddShapeToMap = function(shape,a,b) {
				if(!map.hasOwnProperty(a)) { map[a] = {}; }
				if(!map[a].hasOwnProperty(b)) { map[a][b] = shape.getId(); }
			};
			
			var fnGetAllConnectionPoints = function(shape) {
				var pS = shape.getPointRaw('positionStart');
				var pE = shape.getPointRaw('positionEnd');
				var gridSize = this.helper.sharedData.getGridSize();
				var retArr = [];
				for(var t = Math.min(pS.x, pE.x); t <= Math.max(pS.x, pE.x); t = t + gridSize) {
					if(t == Math.min(pS.x, pE.x) || t == Math.max(pS.x, pE.x)) {
						for(var y = Math.min(pS.y, pE.y); y <= Math.max(pS.y, pE.y); y = y + gridSize) {
							retArr.push(t + '#' + y);
						}
					} else {
						retArr.push(t + '#' + Math.min(pS.y, pE.y));
						retArr.push(t + '#' + Math.max(pS.y, pE.y));
					}
				}
				return retArr;
			}.bind(this);

			for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
				var shape = this.storage.paintObjects[x];
				if(options.targetShapeTypes != null) {
					if(shape.getId() != shapeId && options.targetShapeTypes.indexOf(shape.getType()) > -1) {
						options.targetShapeIds.push(shape.getId());
					}
				}

				switch(shape.getType()) {
					case Ramani.SHAPETYPES.PATH:
					case Ramani.SHAPETYPES.CURVE:
						if(shape.hasDirectionAB()) { fnAddShapeToMap(shape, shape.getPointAsString('positionStart'), shape.getPointAsString('positionEnd')); }
						if(shape.hasDirectionBA()) { fnAddShapeToMap(shape, shape.getPointAsString('positionEnd'), shape.getPointAsString('positionStart')); }
						break;
						
					case Ramani.SHAPETYPES.DESTINATION:
					case Ramani.SHAPETYPES.SOURCE:
					case Ramani.SHAPETYPES.SOURCE_DESTINATION:
					/*
						if(options.onlyUseRoads == false || (options.targetShapeIds != null && (shape.getId() == shapeId || options.targetShapeIds.indexOf(shape.getId()) > -1))) {
							var allPoints = fnGetAllConnectionPoints(shape);
							for(var y = 0; y < allPoints.length; y++) {
								fnAddShapeToMap(shape, allPoints[y], 'end');
							}
						}
						break;
						*/
					case Ramani.SHAPETYPES.TUGGERSTOPPOINT:
						if(options.onlyUseRoads == false || (options.targetShapeIds != null && (shape.getId() == shapeId || options.targetShapeIds.indexOf(shape.getId()) > -1))) {
							var allPoints = fnGetAllConnectionPoints(shape);
							for(var y = 0; y < allPoints.length; y++) {
								for(var z = 0; z < allPoints.length; z++) {
									if(y != z) { // no 1:1 return
										fnAddShapeToMap(shape, allPoints[y], allPoints[z]);	
									}							
								}
							}	
						}
						break;
				};
			}

			var resultingPaths = [];
			var resultingPathsLookupDublicatesMap = [];
			var minFound = null;

			var fnAddResult = function(path) {
				if(path.length < 2) return; 

				var pathAsString = JSON.stringify(path);
				if(resultingPathsLookupDublicatesMap.indexOf(pathAsString) != -1) return;

				if(options.onlyTuggerTrain == true) {
					var temp = this.getShapeById(path[path.length-1]);
					if(temp.getType() == Ramani.SHAPETYPES.TUGGERSTOPPOINT) return;
				}
				
				if(options.targetShapeIds != null) {
					var minPerPath = {};
					var max = 0;
					var pathFound = false;
					for(var x=0; x<options.targetShapeIds.length; x++) {
						var pos = path.indexOf(options.targetShapeIds[x]);
						if(pos > -1) {
							path.splice(pos + 1);
							resultingPaths.push(path);
							resultingPathsLookupDublicatesMap.push(pathAsString);
							pathFound = true;
							if(!minPerPath.hasOwnProperty(options.targetShapeIds[x])|| minPerPath[options.targetShapeIds[x]] > path.length) {
								minPerPath[options.targetShapeIds[x]] = path.length;
								max = Math.max(max, path.length);
							}
						}
					}
					if(options.targetShapeIds.length == 1 && resultingPaths.length > 0 && pathFound == true) {
						if(minFound == null || minFound > path.length) {
							minFound = path.length;
						}
					} else if(Object.keys(minPerPath).length == options.targetShapeIds.length) { // für jeden pfad was gefunden
						minFound = max;
					}

					resultingPaths = resultingPaths.filter(function(item, pos, self) {
	    				return self.indexOf(item) == pos;
					});

					return;
				} else {
					if(minFound == null || minFound > path.length) {
						minFound = path.length;
					}
				}

				resultingPaths.push(path); 
				resultingPathsLookupDublicatesMap.push(pathAsString);
			}.bind(this);
			
			var fnGetAngleDegree = function(a,b,c) {
				if(c == 'end' || b == null) {
					return 180;
				}
				a = a.split('#');
				b = b.split('#');
				c = c.split('#');
				// result is between pi and -pi
				var angle = Math.atan2(c[1] - a[1], c[0] - a[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
				// result is a number between 0 and 180;
				return Math.abs(angle * 180 / Math.PI);
			};
			
			var secureNet = 0;
			var fnSearchPath = function(path, point, pointBefore) {
				secureNet++;
				if(secureNet > 200000) return;
				if(point == null || point == 'end' || !map.hasOwnProperty(point)) {
					fnAddResult(path);
					return path;
				}
				var targets = Object.keys(map[point]).filter(function(tP) {
					if(options.onlyTuggerTrain == true) {
						var pathCopy = JSON.parse(JSON.stringify(path));
						pathCopy.splice(0,1);
						return (pathCopy.indexOf(map[point][tP]) == -1);
					}

					return (path.indexOf(map[point][tP]) == -1);
				}.bind(this));
				
				if(targets.length == 0) {
					fnAddResult(path);
					return path;
				}
				for(var x=0; x<targets.length; x++) {
					if(pointBefore != null) {
						var resultAngle = fnGetAngleDegree(point, pointBefore, targets[x]);
						if(resultAngle < 89) { continue; }
						var _targetShape = this.getShapeById(map[point][targets[x]]);
						// zwei kurven problem (drehung auf der spitze)
						if(_targetShape == null) { continue; }

						if(!map.hasOwnProperty(pointBefore)) {
							continue;
						}
						var _currentShape = this.getShapeById(map[pointBefore][point]);
						if(_currentShape == null) { continue; }
												
						if(_targetShape.getType() == Ramani.SHAPETYPES.CURVE) {
							// if two curves are checked the angle must be greater 90!
							
							if(_currentShape.getType() == Ramani.SHAPETYPES.CURVE) {
								// two curves with same controll point means t or x cross and we do not want to turn back  ....
								if(_targetShape.getPointAsString('positionControll') == _currentShape.getPointAsString('positionControll')) {
									continue;
								}
								if(resultAngle < 95) { continue; }
							} else { 
								// linien / curven problem (drehung auf der spitze) .. lange linie ...
								if(resultAngle == 315) { continue; }
								if(_currentShape.getType() == Ramani.SHAPETYPES.PATH) { // stehen auf pfad, schauen auf eine curve
									// linien / curven problem (drehung auf der spitze) (#1 grade ist gemacht mit tool)
									if(_targetShape.getPointAsString('positionControll') == pointBefore) {
										continue;
									}
									// linien / curven problem (drehung auf der spitze) (#1 grade ist selbst gemacht, dh controllpunkt ist nicht ein endpunkt der linie)
									if(HelperFunctions.pointIsOnLine({
										point: _targetShape.getPoint('positionControll'),
										line1: _currentShape.getPoint('positionStart'),
										line2: _currentShape.getPoint('positionEnd')
									})) {
										continue;
									}
								}
							}
						} else { // sind z.b in der curve .. target ist keine !
							// linien / curven problem (drehung auf der spitze) .. lange linie ...
							if(_currentShape.getType() == Ramani.SHAPETYPES.CURVE) { // stehen in der curve, schauen auf z.b. eine grade
								if(resultAngle == 315) { continue; }
								// linien / curven problem (drehung auf der spitze) (#1 grade ist selbst gemacht, dh controllpunkt ist nicht ein endpunkt der linie)
								if(_currentShape.getPointAsString('positionControll') == point) {
									continue;
								}
								// linien / curven problem (drehung auf der spitze) (#1 grade ist selbst gemacht, dh controllpunkt ist nicht ein endpunkt der linie)
								if(HelperFunctions.pointIsOnLine({
									point: _currentShape.getPoint('positionControll'),
									line1: _targetShape.getPoint('positionStart'),
									line2: _targetShape.getPoint('positionEnd')
								})) {
									continue;
								}
							}							
						}
					}
					
					var pathCopy = JSON.parse(JSON.stringify(path))
						pathCopy.push(map[point][targets[x]]);
						
					if(options.onlyShortestPath === true && minFound != null){
						if(pathCopy.length <= minFound) {
							fnSearchPath(pathCopy, targets[x], point);		
						}
					} else {
						fnSearchPath(pathCopy, targets[x], point);	
					}
				}
			}.bind(this);

			var fnStartSearch = function() {
				if(
					rootShape.getType() == Ramani.SHAPETYPES.DESTINATION ||
					rootShape.getType() == Ramani.SHAPETYPES.SOURCE ||
					rootShape.getType() == Ramani.SHAPETYPES.SOURCE_DESTINATION ||
					rootShape.getType() == Ramani.SHAPETYPES.TUGGERSTOPPOINT 
				) {
					var pS = rootShape.getPointRaw('positionStart');
					var pE = rootShape.getPointRaw('positionEnd');
					var gridSize = this.helper.sharedData.getGridSize();
					for(var x= Math.min(pS.x, pE.x); x <= Math.max(pS.x, pE.x); x = x + gridSize) {
						for(var y= Math.min(pS.y, pE.y); y <= Math.max(pS.y, pE.y); y = y + gridSize) {
							fnSearchPath([rootShape.getId()], x + '#' + y, null);
						}
					}
				} else {
					fnSearchPath([rootShape.getId()], rootShape.getPointAsString('positionStart'), rootShape.getPointAsString('positionEnd'));
					fnSearchPath([rootShape.getId()], rootShape.getPointAsString('positionEnd'), rootShape.getPointAsString('positionStart'));
				}
			}.bind(this);
			fnStartSearch();

			if(options.onlyTuggerTrain == true) {
				var filtered = [];
				if(resultingPaths.length > 0) {
				    var maxNumStopPoints = 0;
					for(var x=0; x<resultingPaths.length; x++) {
						var row = resultingPaths[x];

						if(row.length > 2 && row[0] == row[row.length-1]) {
						    //count number of stopPoints
						    var numStopPoints = 0;
	                        for(var y=0; y<row.length; y++) {
	                            var el = this.getShapeById(row[y]);
	                            if(el.getType() == Ramani.SHAPETYPES.TUGGERSTOPPOINT) {
									numStopPoints++;
								}
	                        }
	                        if(numStopPoints>0){
	                            //just accept the path with the most stopPoints on route
	                            if (numStopPoints > maxNumStopPoints) {
	                                maxNumStopPoints = numStopPoints;
	                                filtered = [];
	                                filtered.push(row);
	                            }else if (numStopPoints === maxNumStopPoints){

	                                //check reverse
	                                for(var s=0; s<filtered.length;s++){
	                                    var isReverseSame = true;
	                                    for(var p=0; p<filtered[s].length;p++){
	                                        if(p<(row.length-1-p)){
	                                            if(row[p] !== filtered[s][filtered[s].length-1-p]) {
	                                                isReverseSame = false;
	                                                break;
	                                            }
	                                        }
	                                    }
	                                }
	                                if(!isReverseSame) filtered.push(row);
								}
	                        }
						}
					}

					//check right order
	                for(var k=0; k<filtered.length;k++){
	                    var arr = filtered[k];
	                    var previousName = null;
	                    var arrSwitch = false;
	                    for(var s=0; s<arr.length;s++){
	                        var elId = arr[s];
	                        var el = this.getShapeById(elId);
	                        if(el.getType() == Ramani.SHAPETYPES.TUGGERSTOPPOINT){
	                            if(el.storage.hasOwnProperty('customName')){
	                                if(previousName===null) previousName = el.storage.customName;
	                                else {
	                                    if(previousName>el.storage.customName){
	                                        arrSwitch = true;
	                                        break;
	                                    }
	                                 }
	                            }
	                        }
	                    }
	                    if(arrSwitch) arr.reverse();
	                }
				}
				resultingPaths = filtered;
			} else if(options.onlyTuggerTrain == false && options.onlyShortestPath === true) {
				var map = {};
				for(var x=0; x<resultingPaths.length; x++) {
					var row = resultingPaths[x];
					var key = row[0]+'#'+row[row.length-1];
					if(!map.hasOwnProperty(key)) {
						map[key] = row;
					}
					if(map[key].length > row.length) {
						map[key] = row;
					}
				}
				var k = Object.keys(map);
				var ret = [];
				for(x=0; x<k.length; x++) {
					ret.push(map[k[x]]);
				}
				resultingPaths = ret;
			}
			resolve(resultingPaths);
		}.bind(this));
	},
	
	undoAction: function() {
		this.deselectAllShapes();
		return this.helper.undo.undo();
	},
	getHistorySize: function() {
		return this.helper.undo.getHistorySize();
	},
	centerView: function(opts) {
		var options = Object.assign({
			paddingTop: null,
			paddingBottom: null,
			paddingLeft: null,
			paddingRight: null,
			padding: null
		}, opts || {});
		
		if(options.padding == null) {
			options.padding = 0;
		}
		if(options.paddingTop == null) {
			options.paddingTop = options.padding;
		}	
		if(options.paddingBottom == null) {
			options.paddingBottom = options.padding;
		}	
		if(options.paddingLeft == null) {
			options.paddingLeft = options.padding;
		}	
		if(options.paddingRight == null) {
			options.paddingRight = options.padding;
		}	
		
		this.updateBoundingClientRect();

		var min = { x: null, y: null };
		var max = { x: null, y: null };
		
		if(this.storage.paintObjects.length > 1) {
			var shape = this.storage.paintObjects[1];
			min.x = shape.getPointRaw('positionStart').x;
			min.y = shape.getPointRaw('positionStart').y;
			max.x = shape.getPointRaw('positionEnd').x;
			max.y = shape.getPointRaw('positionEnd').y;
		} else {
			return;
		}
		
		for(var x=1; x<this.storage.paintObjects.length; x++) { // skip grid ...
			var shape = this.storage.paintObjects[x];
			var pStart = shape.getPointRaw('positionStart');
			if(min.x > pStart.x) { min.x = pStart.x; }
			if(max.x < pStart.x) { max.x = pStart.x; }
			if(min.y > pStart.y) { min.y = pStart.y; }
			if(max.y < pStart.y) { max.y = pStart.y; }
			var pEnd = shape.getPointRaw('positionEnd');
			if(min.x > pEnd.x) { min.x = pEnd.x; }
			if(max.x < pEnd.x) { max.x = pEnd.x; }
			if(min.y > pEnd.y) { min.y = pEnd.y; }
			if(max.y < pEnd.y) { max.y = pEnd.y; }
		}

		var fnCalcScale = function(pMin, pMax) {
			var shapePileWidth = pMax.x - pMin.x;
			var shapePileHeight = pMax.y - pMin.y;

			var scaleWidth = this.storage.boundingClientRect.width / shapePileWidth;
			var scaleHeight = this.storage.boundingClientRect.height / shapePileHeight;

			return Math.min(scaleWidth, scaleHeight);
		}.bind(this);
		
		// padding
		var potNewScale = fnCalcScale(min, max);

		min.y = min.y - options.paddingTop / potNewScale;
		max.y = max.y + options.paddingBottom / potNewScale;
		min.x = min.x - options.paddingLeft / potNewScale;
		max.x = max.x + options.paddingRight / potNewScale;
		
		// new scale
		var newScale = fnCalcScale(min, max);

		this.helper.zoomAndMove.setScale(newScale);

		this.helper.zoomAndMove.setWorldOrigin({ x: min.x, y: min.y });
		this.helper.zoomAndMove.resetMouseData();

		this.helper.zoomAndMove.zoom(1, { x: this.storage.canvas.width / 2, y: this.storage.canvas.height / 2 });
		this.helper.zoomAndMove.zoom(1, { x: this.storage.canvas.width / 2, y: this.storage.canvas.height / 2 });
		this.paint();
		
		return {
			width: (max.x - min.x), 
			height: (max.y - min.y)
		};
	},
	toDataURL: function() {
		return this.storage.canvas.toDataURL();
	},
	checkShapeExists: function(shapeId) {
    	return this.getShapeIndexById(shapeId) !== null;
	},
	hightlightPath: function(arrayOfShapeIds, optionalColor) {
		arrayOfShapeIds = arrayOfShapeIds || [];
		optionalColor = optionalColor || '#FF0000';
		
		var shapes = [];
		for(var gsix = 1; gsix < this.storage.paintObjects.length; gsix++) { // skip grid ...
			if(arrayOfShapeIds.indexOf(this.storage.paintObjects[gsix].getId()) != -1) {
				shapes.push(this.storage.paintObjects[gsix]);
			} else {
				this.storage.paintObjects[gsix].resetColor();
			}
		}

		for(var c=0; c<shapes.length; c++) {
			shapes[c].setColor(optionalColor);
		}
		this.paint();

		var fnUndo = function(shapes) {
			for(var c=0; c<shapes.length; c++) {
				shapes[c].resetColor();
			};
			this.paint();
		};
		return fnUndo.bind(this, shapes);
	},
	joinPaths: function(shapeIdOne, shapeIdTwo, skipHistory) {
		return new Promise(function(resolve, reject) {
			var shapes = this._getShapesById(shapeIdOne, shapeIdTwo);
			
			if(!shapes.shapeOne || !shapes.shapeTwo) {
				reject(404);
				return;
			}
			
			if(shapes.shapeOne.getType() != shapes.shapeTwo.getType() || shapes.shapeOne.getType() != Ramani.SHAPETYPES.PATH) {
				reject(500);
				return;
			}
			
			var connections = null;
			
			if(shapes.shapeOne.getPointAsString('positionEnd') == shapes.shapeTwo.getPointAsString('positionStart')) {
				connections = { one: 'positionEnd', two: 'positionStart' };
			} else if(shapes.shapeOne.getPointAsString('positionStart') == shapes.shapeTwo.getPointAsString('positionStart')) {
				connections = { one: 'positionStart', two: 'positionStart' };
			} else if(shapes.shapeOne.getPointAsString('positionStart') == shapes.shapeTwo.getPointAsString('positionEnd')) {
				connections = { one: 'positionStart', two: 'positionEnd' };
			} else if(shapes.shapeOne.getPointAsString('positionEnd') == shapes.shapeTwo.getPointAsString('positionEnd')) {
				connections = { one: 'positionEnd', two: 'positionEnd' };
			}
			
			if(connections == null) {
				reject(401);
				return;
			}
			
			if(skipHistory !== true) {
				this.helper.undo.addHistoryStep({
					changes: [{
						type: 'EDIT',
						shapeId: shapes.shapeOne.getId(),
						params: shapes.shapeOne.toJSON()
					}]
				});
			}

			shapes.shapeOne.setPoint(connections.one, shapes.shapeTwo.getPointRaw(connections.two == 'positionStart' ? 'positionEnd':'positionStart'));
			this.deleteShape(shapes.shapeTwo.getId(), skipHistory);
			
			resolve(shapes.shapeOne.getId());
		}.bind(this));
	}
};
 
 

class HelperExportDXF {
    
  	constructor(options) {
        this.shapes = [];
    }
    
    addShape(s) {
        this.shapes.push(s);
    }
    
    _getDxfLtypeTable() {
        let s = '0\nTABLE\n'; //start table
        s += '2\nLTYPE\n';    //name table as LTYPE table

        var lineTypes = [
            {name: 'CONTINUOUS', description: '______', elements: [], elementsSum: 0 },
            {name: 'DASHED',    description: '_ _ _ ', elements: [5.0, -5.0], elementsSum: 10 },
            {name: 'DOTTED',    description: '. . . ', elements: [0.0, -5.0], elementsSum: 5 }
        ];
        for (let lineTypeName in lineTypes) {
            let s = '0\nLTYPE\n';
            s += '72\n65\n';
            s += '70\n64\n';
            s += `2\n${lineTypes[lineTypeName].name}\n`;
            s += `3\n${lineTypes[lineTypeName].description}\n`;
            s += `73\n${lineTypes[lineTypeName].elements.length}\n`;
            s += `40\n${lineTypes[lineTypeName].elementsSum}\n`;

            for (let i = 0; i < lineTypes[lineTypeName].elements.length; ++i) {
                s += `49\n${lineTypes[lineTypeName].elements[i]}\n`;
            }
        }
        s += '0\nENDTAB\n'; //end table

        return s;
    }

    _getDxfLayerTable() {
        let s = '0\nTABLE\n'; //start table
        s += '2\nLAYER\n'; //name table as LAYER table

        //for (let layerName in this.layers) {
            s += '0\nLAYER\n';
            s += '70\n64\n';
            s += `2\n0\n`;
            s += `62\n7\n`;
            s += `6\nCONTINUOUS\n`;
        //}

        s += '0\nENDTAB\n';

        return s;
    }
    
    toDxfString() {
        let s = '';
        
        // set null point
        s += '23\n0\n';
        s += '33\n0\n';

        //start section
        s += '0\nSECTION\n';
        //name section as TABLES section
        s += '2\nTABLES\n';

        s += this._getDxfLtypeTable();
        s += this._getDxfLayerTable();

        //end section
        s += '0\nENDSEC\n';

        //ENTITES section
        s += '0\nSECTION\n';
        s += '2\nENTITIES\n';

        s += this.shapes.join('');

        s += '0\nENDSEC\n';

        //close file
        s += '0\nEOF';

        this.download('export.dxf', s);
        return s;
    }
    
    download(filename, text) {
        var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
};

class HelperExportImportJSON {
    
  	constructor(options) {
        this.shapes = [];
    }
    
    addShape(s) {
        this.shapes.push(s);
    }
    
    exportObject(opts) {
        opts = Object.assign({
            zoomAndMove: null
        }, opts || {});
        let s = [];
        for(var x=0; x<this.shapes.length; x++) {
            if(this.shapes[x].isValid()) {
                var json = this.shapes[x].toJSON();
                if(json != null) {
                    s.push(json);
                }
            }
        }
        return {
            'layer': {
                'base': {
                    'shapes': s                    
                }
            },
            'zoomAndMove': opts.zoomAndMove
        };
    }
    
    export(opts) {
        var s = JSON.stringify(this.exportObject(opts));
        this.download('export.json', s);
        return s;
    }
    
    import() {
        return new Promise(function(resolve, reject) { 
            var element = document.createElement('input');
                element.setAttribute('type', 'file');
                element.style.display = 'none';

                document.body.appendChild(element);

                element.addEventListener('change', function (evt) {
                    document.body.removeChild(element);
                    var files = evt.target.files; // FileList object
                    // files is a FileList of File objects. List some properties.
                    if(files.length == 0) {
                        reject();
                        return;
                    }
                    var reader = new FileReader();

                    // Closure to capture the file information.
                    reader.onload = (function (theFile) {
                        return function (e) {
                            try {
                                var json = JSON.parse(e.target.result);
                                resolve(json);
                            } catch (err) {
                                console.debug(err);
                                reject(err);
                            }
                        }
                    })(files[0]);
                    reader.readAsText(files[0]);
                    
                }, false);
                element.click();
        });
    }
    
    download(filename, text) {
        var element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
};

class HelperFunctions {
    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    
    static pointsAreEqual(p1, p2) {
        return (p1.x == p2.x && p1.y == p2.y);
    }
    
    static createPoint(x, y) { return {x,y} }	
    static createPointFromString(y) { 
        if((t+'').indexOf('#') == -1) return null; 
        var t = y.split('#'); 
        return { x: t[0], y: t[1] }; 
    }	
/*
    static findIntersectionPoint(p0, p1, p2, p3) {
        var s10_x = p1.x - p0.x;
        var s10_y = p1.y - p0.y;
        var s32_x = p3.x - p2.x;
        var s32_y = p3.y - p2.y;
        var denom = s10_x * s32_y - s32_x * s10_y;

        if(denom == 0) { return null; }; // collinear

        var denom_is_positive = denom > 0;
        var s02_x = p0.x - p2.x;
        var s02_y = p0.y - p2.y;
        var s_numer = s10_x * s02_y - s10_y * s02_x;

        if((s_numer < 0) == denom_is_positive) { return null; }; // no collision
        var t_numer = s32_x * s02_y - s32_y * s02_x;
        if((t_numer < 0) == denom_is_positive) { return null; }; // no collision
        if( ((s_numer > denom) == denom_is_positive) || ((t_numer > denom) == denom_is_positive)) { return null; }; // no collision

        // collision detected
        var t = t_numer / denom;
        return { x: (p0.x + (t * s10_x)), y: (p0.y + (t * s10_y)) };  
    }
*/
    static findIntersectionPoint(opt) {
        var options = Object.assign({
            shapeOne: null,
            shapeTwo: null,
            p0: null,
            p1: null,
            p2: null,
            p3: null
        }, opt || {});

        if(options.shapeOne != null) {
            options.p0 = options.shapeOne.getPointRaw('positionStart');
            options.p1 = options.shapeOne.getPointRaw('positionEnd');
        }
        if(options.shapeTwo != null) {
            options.p2 = options.shapeTwo.getPointRaw('positionStart');
            options.p3 = options.shapeTwo.getPointRaw('positionEnd');
        }

        var s1 = {
            x: options.p1.x - options.p0.x,
            y: options.p1.y - options.p0.y
        }; 
        var s2 = {
            x: options.p3.x - options.p2.x,
            y: options.p3.y - options.p2.y	
        };

        var s = (-s1.y * (options.p0.x - options.p2.x) + s1.x * (options.p0.y - options.p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
        var t = ( s2.x * (options.p0.y - options.p2.y) - s2.y * (options.p0.x - options.p2.x)) / (-s2.x * s1.y + s1.x * s2.y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1){
            // Collision detected
            return {
                x: options.p0.x + (t * s1.x),
                y: options.p0.y + (t * s1.y)
            };
        }

        return null; // No collision
    }
    
    static pointIsOnLine(opt) {
        var options = Object.assign({
            point: null,
            line2: null,
            line1: null
        }, opt || {});

        var dxc = options.point.x - options.line1.x;
        var dyc = options.point.y - options.line1.y;

        var dxl = options.line2.x - options.line1.x;
        var dyl = options.line2.y - options.line1.y;

        var cross = dxc * dyl - dyc * dxl;
        if (cross != 0) {
            return false;
        }

        if (Math.abs(dxl) >= Math.abs(dyl)) {
            return dxl > 0 ? 
                options.line1.x <= options.point.x && options.point.x <= options.line2.x :
                options.line2.x <= options.point.x && options.point.x <= options.line1.x;
        } else {
            return dyl > 0 ? 
                options.line1.y <= options.point.y && options.point.y <= options.line2.y :
                options.line2.y <= options.point.y && options.point.y <= options.line1.y;
        }
    }
};
 
 

class HelperKeyboard {
  	constructor(options) {
		this.options =  Object.assign({
            onKeyDown: function(){},
            onKeyUp: function(){}
		}, options);
	    
        this.kde = this.onKeyDown.bind(this);
        this.kdu = this.onKeyUp.bind(this);
        
	    document.body.addEventListener("keydown", this.kde);
        document.body.addEventListener("keyup", this.kdu);
	}
	
	destroy() {
        document.body.removeEventListener("keydown", this.kde);
        document.body.removeEventListener("keyup", this.kdu);
	}
    
    onKeyDown(event) {
        this.options.onKeyDown(event.key, event);
	}	
    onKeyUp(event) {
        this.options.onKeyUp(event.key, event);
	}	
};
 
 

class HelperMouse {
  	constructor(options) {
		this.options =  Object.assign({
            rootElement: null,
			canvas: null,
            helperSharedData: null,
			onMove: function(){},
            onMouseDown: function(){},
            onMouseUp: function(){},
            onWheel: function(){},
            gridSize: 1
		}, options);
	    
		this.storage = {
			mousePositionRaw: { x:0, y:0 },
			mousePositionOnCanvas: { x:0, y:0 },
			mousePositionOnCanvasDown: null,
			boundingClientRect: { x:0, y:0 },
			mouseOverCanvas: false,
            isMouseDown: false
		};

        this.fnEvents = {
            "mousedown": this.onMouseDown.bind(this),
            "mouseup": this.onMouseUp.bind(this),
    		"mousemove": this.onMouseMove.bind(this),
    		"mouseenter": this.onMouseEnter.bind(this),
    		"mouseleave": this.onMouseLeave.bind(this),
            "mouseout": this.onMouseOut.bind(this),
            "wheel": this.onWheel.bind(this),
            "resize": this.updateBoundingClientRect.bind(this)
        };
		this.updateBoundingClientRect();
		
        var elem = this.options.rootElement;
	    elem.addEventListener("mousedown", this.fnEvents['mousedown']);
        elem.addEventListener("mouseup", this.fnEvents['mouseup']);
		elem.addEventListener("mousemove", this.fnEvents['mousemove']);
		elem.addEventListener("mouseenter", this.fnEvents['mouseenter']);
		elem.addEventListener("mouseleave", this.fnEvents['mouseleave']);
        elem.addEventListener("mouseout", this.fnEvents['mouseout']);
        elem.addEventListener("wheel", this.fnEvents['wheel']);
        window.addEventListener("resize", this.fnEvents['resize']);
	}
	
	destroy() {
        var elem = this.options.rootElement;
		elem.removeEventListener("mousedown", this.fnEvents['mousedown']);
        elem.removeEventListener("mouseup", this.fnEvents['mouseup']);
		elem.removeEventListener("mousemove", this.fnEvents['mousemove']);
		elem.removeEventListener("mouseenter", this.fnEvents['mouseenter']);
		elem.removeEventListener("mouseleave", this.fnEvents['mouseleave']);
        elem.removeEventListener("mouseout", this.fnEvents['mouseout']);
        elem.removeEventListener("wheel", this.fnEvents['wheel']);
        window.removeEventListener("resize", this.fnEvents['resize']);
	}
        
    roundPoint(point) {
        return {
            x: this.round(point.x),
            y: this.round(point.y)
        };
    }
    
    round(x) {
        var gridSize = this.options.helperSharedData.getGridSize();
        if(gridSize == 1) return x;
        return x - (x % gridSize);
    }
    
    onWheel(event) {
        event.preventDefault(); // stop the page scrolling
        this.options.onWheel(event.deltaY);
    }
	
	onMouseDown(event) {
        document.body.classList.add('cursor-pointer');
        this.storage.isMouseDown = true;
		this.updateBoundingClientRect();
		this.calcCrossBrowserMouseCoords(event);
		this.storage.mousePositionOnCanvasDown = this.storage.mousePositionOnCanvasRaw;
        this.options.onMouseDown(this.storage.mousePositionOnCanvas, this.storage.mousePositionOnCanvasRaw);
	}
    
    onMouseUp(event) {
        document.body.classList.remove('cursor-pointer');
        this.storage.isMouseDown = false;
		this.calcCrossBrowserMouseCoords(event);
        this.storage.mousePositionOnCanvasDown = null;
        this.options.onMouseUp(this.storage.mousePositionOnCanvas, this.storage.mousePositionOnCanvasRaw);
	}
	
	onMouseMove(event) {
		this.calcCrossBrowserMouseCoords(event);
        var dist = this.storage.isMouseDown == true ? {  
            x: this.storage.mousePositionOnCanvasDown.x - this.storage.mousePositionOnCanvasRaw.x, 
            y: this.storage.mousePositionOnCanvasDown.y - this.storage.mousePositionOnCanvasRaw.y
        } : { x:0, y:0 };
        this.options.onMove(
            this.storage.mousePositionOnCanvas, 
            dist,
            this.storage.mousePositionOnCanvasDown,
            this.storage.mousePositionOnCanvasRaw
		);
        if(this.storage.isMouseDown == true) {
            this.storage.mousePositionOnCanvasDown = this.storage.mousePositionOnCanvasRaw;
        }
	}
    
    onMouseOut(event) {
        this.options.onMouseOut();
    }
	
	onMouseEnter(event) {
		this.storage.mouseOverCanvas = true;
	}
	
	onMouseLeave(event) {
		this.storage.mouseOverCanvas = false;
	}
	
	calcCrossBrowserMouseCoords(mouseEvent) {
		var result = {
			x: 0,
			y: 0
		};

		if (mouseEvent.pageX || mouseEvent.pageY) {
			result.x = mouseEvent.pageX;
			result.y = mouseEvent.pageY;
		} else if (mouseEvent.layerX || mouseEvent.layerY) {
			result.x = mouseEvent.layerX;
			result.y = mouseEvent.layerY;
		} else if (mouseEvent.clientX || mouseEvent.clientY) {
			result.x = mouseEvent.clientX + elem.scrollLeft + document.documentElement.scrollLeft;
			result.y = mouseEvent.clientY + elem.scrollTop + document.documentElement.scrollTop;
		}
		
		result.x = result.x - this.storage.boundingClientRect.x;
		result.y = result.y - this.storage.boundingClientRect.y;

		if(result.x < 0) result.x = 0;
		if(result.y < 0) result.y = 0;
		if(result.x > this.options.canvas.width) result.x = this.options.canvas.width;
		if(result.y > this.options.canvas.height) result.y = this.options.canvas.height;

        this.storage.mousePositionOnCanvasRaw = JSON.parse(JSON.stringify({ x:result.x, y:result.y }));

		this.storage.mousePositionOnCanvas = this.roundPoint(result);
    }
	
	updateBoundingClientRect() {
		if(this.options.canvas == null) {
			return;
		}
		this.storage.boundingClientRect = this.options.canvas.getBoundingClientRect();
		if(!this.storage.boundingClientRect.x && this.storage.boundingClientRect.left) {
			this.storage.boundingClientRect.x = this.storage.boundingClientRect.left;
			this.storage.boundingClientRect.y = this.storage.boundingClientRect.top;
		}			
		this.storage.boundingClientRect.x += (window.scrollX || window.pageXOffset);
		this.storage.boundingClientRect.y += (window.scrollY || window.pageYOffset);
	}	

};
 
 

class HelperPaint {
  	constructor(options) {
        this.storage = Object.assign({
            helperSharedData: null,
            baseMap: null,
            defaultColor: {
                lineNormal: '#000000',
                lineHover: '#0000FF',
                lineSelected: 'blue',
                fillNormal: '#d8d8d8',
                connection: 'blue'              
            }
		}, options);
	}
    
    createObject(options) {
        return new Promise(function(resolve, reject) {
            this.options = Object.assign({
                type: Ramani.SHAPETYPES.WALL,
                checkPointConnection: false
    		}, options);
            
            var optionsTotal = Object.assign({}, this.storage, this.options);
 
            var ret = null;
            switch(this.options.type) {
                case Ramani.SHAPETYPES.DESTINATION:
                    ret = new RamaniStopPoint(Object.assign(optionsTotal, {
                        checkPointConnection: true
            		}));
                    break;
                case Ramani.SHAPETYPES.SOURCE_DESTINATION:
                    ret = new RamaniStopPoint(Object.assign(optionsTotal, {
                        checkPointConnection: true
            		}));
                    break;                    
                case Ramani.SHAPETYPES.SOURCE:
                    ret = new RamaniStopPoint(Object.assign(optionsTotal, {
                        checkPointConnection: true
            		}));
                    break;     
                case Ramani.SHAPETYPES.TUGGERSTOPPOINT:
                    ret = new RamaniTuggerStopPoint(Object.assign(optionsTotal, {
                        checkPointConnection: true
                    }));
                    break;     
                    
                case Ramani.SHAPETYPES.GATE:
                    ret = new RamaniDoor(optionsTotal);
                    break;
                    
                case Ramani.SHAPETYPES.WALL:
                    ret = new RamaniWall(optionsTotal);
                    break;
                
                case Ramani.SHAPETYPES.CURVE:
                    ret = new RamaniCurve(Object.assign(optionsTotal, {
                        checkPointConnection: true
            		}));
                    break;
                        
                case Ramani.SHAPETYPES.IMAGE:
                case Ramani.SHAPETYPES.CLIPART:
                    ret = new RamaniImage(optionsTotal);
                    if(!optionsTotal.hasOwnProperty('imageBase64') || optionsTotal.imageBase64 == null || optionsTotal.imageBase64 == '') {
                        this.importImage().then(function(img) {
                            ret.setImage(img).then(function() {
                                resolve(ret);
                            }, function() {});
                        }, function() {
                            ret.setImage(null);
                            reject();
                        });
                    } else {
                        ret.parseImage().then(function() {
                            resolve(ret);
                        });
                    }
                    return;
                    break;  
                    
                case Ramani.SHAPETYPES.PATH:
                    ret = new RamaniPath(Object.assign(optionsTotal, {
                        checkPointConnection: true
            		}));
                    break;
                    
                case Ramani.SHAPETYPES.REFLINE:
                    ret = new RamaniRefLine(optionsTotal);
                    break;    

                case Ramani.SHAPETYPES.ACTION_POINT:
                    ret = new RamaniActionPoint(optionsTotal);
                    break;    
                    
                case Ramani.SHAPETYPES.SELECT:
                    ret = new RamaniSelection(optionsTotal);
                    break;        
            };
            if(ret == null){
                reject();    
                return;
            } 
            resolve(ret);
        }.bind(this));
    }
    
    importImage() {
        return new Promise(function(resolve, reject) { 
            var element = document.createElement('input');
                element.setAttribute('type', 'file');
                element.style.display = 'none';

                document.body.appendChild(element);

                element.addEventListener('change', function (evt) {
                    var files = evt.target.files; // FileList object
                    // files is a FileList of File objects. List some properties.
                    var output = [];
                    for (var i = 0, f; f = files[i]; i++) {
                        var reader = new FileReader();

                        // Closure to capture the file information.
                        reader.onload = (function (theFile) {
                            return function (e) {
                                resolve(e.target.result);
                                document.body.removeChild(element);
                            }
                        })(f);
                        reader.readAsDataURL(f);
                    }
                }, false);

                element.click();
        });
    }

};




 

class HelperSharedData {
  	constructor(options) {
		this.options =  Object.assign({
            gridSize: 10 * 0.000264583333, // in px
            factorPXtoM: 0.000264583333 // 1 px = 0.0002645833 meter
		}, options);
        
        this.options.gridSize = Math.round(0.5 / 0.000264583333);
	}
    
    calculateLength(px) {
        return px * this.options.factorPXtoM;
    }
    
    setFactorPXtoM(f) {
        this.options.factorPXtoM = f;
    }
    getFactorPXtoM(f) {
        return this.options.factorPXtoM;
    }
    
    toPX(m) {
        return m / this.options.factorPXtoM;
    }
    toM(px) {
        return px * this.options.factorPXtoM;
    }
    
    getGridSize() {
        return this.options.gridSize;
    }
    
    setGridSize(s) {
        this.options.gridSize = s;
    }
	
	destroy() {
	}
};
 
 

class HelperUndo {
    
  	constructor(baseMap) {
        this.baseMap = baseMap;
        this.history = [];
    }
    
    getHistorySize() {
        return this.history.length;
    }
    
    _checkChangeObject(obj) {
        var row = Object.assign({
            type: 'none', // TYPE: ADD, EDIT, DELETE
            shapeId: null
        }, (obj.type == 'DELETE' || obj.type == 'EDIT') ? {
                params: null
            } : {},
            obj || {}
        );
        
        return row;
    }
    
    addHistoryStep(opt) {
        opt = Object.assign({
            changes: [],
            ask: false
		}, opt || {});
        
        var changes = opt.changes || []; // check changes ...
        
        for(var x=0; x<changes.length; x++) {
            changes[x] = this._checkChangeObject(changes[x]);
        }
        
        opt.changes = changes; // write back
        
        this.history.push(opt);
    }
    
    undo() {
        return new Promise(function(resolve, reject) { 
            if(this.history.length < 1) { 
                reject();
                return; 
            }
            
            var change = this.history.pop();
            var changes = change.changes || []; // check changes ...
            var promises = [];
            
            for(var x=0; x<changes.length; x++) {
                var row = this._checkChangeObject(changes[x]);
                
                if(row.shapeId == null) { continue; }
                
                switch(row.type) {
                    case 'none': break;
                    case 'ADD':
                        var objInd = this.baseMap.getShapeIndexById(row.shapeId);
                        if(objInd != null) {
                            this.baseMap._removeShapeFromMap(objInd, true);
                        }
                        break;
                    case 'EDIT': // edit is not reversed !!!!
                        var obj = this.baseMap.getShapeById(row.shapeId);
                        if(obj != null) {
                            obj.changeParameter(row.params);
                        }
                        break;                        
                    case 'DELETE':
                        if(row.params.hasOwnProperty('display')) {
                            delete row.params.display;
                        }
                        
                        var pr = this.baseMap._createShape(Object.assign({
        					id: row.shapeId
        				}, row.params || {}));
                        promises.push(pr);
                        
                        pr.then(function(inst) {
        					if(!inst.isValid()) { return; }
        					inst.setMode('hover', false);
        					inst.setMode('selected', false);
        					if(inst.getType() == Ramani.SHAPETYPES.IMAGE || inst.getType() == Ramani.SHAPETYPES.CLIPART) {
        						this.baseMap._addShapeToMap(inst, 1, true);
        					} else {
        						this.baseMap._addShapeToMap(inst, undefined, true);	
        					}
        				}.bind(this));
                        break;
                }
            }
            
            if(promises.length == 0) {
                this.baseMap.paint();
                resolve();
            } else {
                Promise.all(promises).then(function() {
                    this.baseMap.paint();
                    resolve();
                }.bind(this), function() {
                    this.baseMap.paint();
                    resolve();
                }.bind(this));
            }
        }.bind(this));
    }
};

class HelperZoomAndMove {
    
  	constructor(options) {
		this.options =  Object.assign({
            canvas: null,
            scale: 1,
            m: { x:0, y:0 }, // mouse pos
            w: { x:0, y:0 }, // world zoom origin
            s: { x:0, y:0 }, // mouse screen pos
            r: { x:0, y:0 }, // mouse real (world) pos
            d: { x:0, y:0 }, // delta between mouse down and current mouse pos on move
            movedDistance: { x:0, y:0 },
            tmp: { x:0, y:0 },
            onChangeScaleByRatio: function(ratio) {}
		}, options);
        
        // 1m == 3779.527559px .. zeige 1m auf 20px
        this.options.scale = 20 / 3779.527559;
    }
    
    toJSON() {
        return {
            m: this.options.m,
            w: this.options.w,
            s: this.options.s,
            r: this.options.r,
            d: this.options.d,
            tmp: this.options.tmp,
            scale: this.options.scale
        };
    }
    
    fromJSON(json) {
        this.options.m = json.m;
        this.options.w = json.w;
        this.options.s = json.s;
        this.options.r = json.r;
        this.options.d = json.d;
        this.options.tmp = json.tmp;
        this.options.scale = json.scale;
    }
    
    getMousePositionOnCanvas() {
        return this.options.m;
    }

    getMousePosition() {
        return this.options.r;
    }
    
    getWorldOrigin() {
        return this.options.w;
    }
    setWorldOrigin(newPoint) {
        this.options.w = newPoint;
    }
    
    getMousePositionDelta() {
        return this.options.d;
    }
    
    getMovedDistance() {
        return this.options.movedDistance;
    }
    
    setScale(newScale) {
        this.options.scale = newScale;
    }
    
    getScale() {
        return this.options.scale;
    }

    resetMouseData() {
        this.options.m = { x:0, y:0 };
        this.options.s = { x:0, y:0 };
        this.options.r = { x:0, y:0 };
        this.options.d = { x:0, y:0 };
    }
    
    setScaleByRatio(ratio, p) { // scale is ratio times bigger now
        var newScale = this.options.scale * (1 / ratio);
        if(p) {
            var pOld = this.zoomedXY(p);
            var pNew =  { // zoomedXY with custom scale
                x: ((p.x - this.options.w.x) * newScale + this.options.s.x),
                y: ((p.y - this.options.w.y) * newScale + this.options.s.y)
            };
            var tmp = { // zoomedInvXY with new scale
                x: (((pNew.x - pOld.x) - this.options.s.x) * (1 / newScale) + this.options.w.x),
                y: (((pNew.y - pOld.y) - this.options.s.y) * (1 / newScale) + this.options.w.y)
            };
            var newW = JSON.parse(JSON.stringify(this.options.w));
                newW.x += tmp.x;
                newW.y += tmp.y;
                
            this.options.onBeforeChangeScaleByRatio(newScale, newW);

            this.options.w.x += tmp.x;
            this.options.w.y += tmp.y;
        }
        this.options.scale = newScale;
        this.options.onChangeScaleByRatio(ratio);
    }
    
    zoom(dir, newMousePos) {
        if (dir < 0) {
           this.options.scale = Math.min(0.05, this.options.scale * 1.1); // zoom in
//            this.options.scale = this.options.scale * 1.1; // zoom in
        } else if (dir > 0) {
//            this.options.scale = this.options.scale * (1 / 1.1); // zoom out is inverse of zoom in
            this.options.scale = Math.max(0.0001, this.options.scale * (1 / 1.1)); // zoom out is inverse of zoom in
        }

        if(newMousePos) {
            this.track(newMousePos);
        }
        this.options.w = this.options.r; // set world origin
        this.options.s = this.options.m; // set screen origin
        this.options.r = this.zoomedInvXY(this.options.m); // recalc!!!!!!! mouse world (real) pos
    }

    track(mouse, posDelta) {
        this.options.m = mouse;
        this.options.tmp = JSON.parse(JSON.stringify(this.options.r));
        this.options.r = this.zoomedInvXY(this.options.m);
        if(posDelta) {
            this.options.d = this.zoomedInvPoint(posDelta);
        } else {
            this.options.d = { x:0, y:0 };
        }
    }
    
    move(opts) {
        if(opts) {
            if(opts.hasOwnProperty('x')) {
                this.options.w.x -= opts.x * (1 / this.options.scale);
            }
            if(opts.hasOwnProperty('y')) {
                this.options.w.y -= opts.y * (1 / this.options.scale);
            }
        } else {
            this.options.movedDistance.x -= this.options.r.x - this.options.tmp.x; // move the world origin by the distance 
            this.options.movedDistance.y -= this.options.r.y - this.options.tmp.y;

            this.options.w.x -= this.options.r.x - this.options.tmp.x; // move the world origin by the distance 
            this.options.w.y -= this.options.r.y - this.options.tmp.y;
            // recaculate mouse world 
            this.options.r = this.zoomedInvXY(this.options.m);
        }
    }
    
    startMove(mouse) {
    }
    
    moveUp(mouse) {
    }
    
    zoomed(number) { // just scale
        return number * this.options.scale;
    }
    
    zoomedPoint(v) { // just scale point
        return {
            x: this.zoomed(v.x),
            y: this.zoomed(v.y),
        };
    }
    
    zoomedInv(number) { // just scale
        return number / this.options.scale;
    }
    
    zoomedInvPoint(v) { // just scale point
        return {
            x: v.x * 1 / this.options.scale,
            y: v.y * 1 / this.options.scale,
        };
    }

    zoomedX(x) { // scale & origin X
        return ((x - this.options.w.x) * this.options.scale + this.options.s.x); // Math.floor(
    }
    
    zoomedY(y) { // scale & origin Y
        return ((y - this.options.w.y) * this.options.scale + this.options.s.y); // Math.floor(
    }
    
    // converts from world coord to screen pixel coord
    zoomedXY(v) { // scale & origin X+Y
        return {
            x: this.zoomedX(v.x),
            y: this.zoomedY(v.y)
        };
    }

    zoomedInvX(x) { // scale & origin INV
        return ((x - this.options.s.x) * (1 / this.options.scale) + this.options.w.x); // Math.floor(
    }
    
    zoomedInvY(y) { // scale & origin INV
        return ((y - this.options.s.y) * (1 / this.options.scale) + this.options.w.y); // Math.floor
    }
    
    // inverse function converts from screen pixel coord to world coord
    zoomedInvXY(v) { // scale & origin INV
        if(v == null) return null;
        return {
            x: this.zoomedInvX(v.x),
            y: this.zoomedInvY(v.y)
        };
    }
};

class RamaniObject {
    constructor(opts) {
        this.storage = Object.assign({
            id: null,
            helperSharedData: null,
            type: Ramani.SHAPETYPES.OBJECT,
            zoomAndMove: null,
            checkPointConnection: false,
            arcSize: 1,
            handleCicleSize: 15,
            defaultLineWidth: 0.5,
            selectedLineWidth: 2.0,
            biggerLineWidth: 3.5,
            positionStart: null,
            positionEnd: null,
            visible: true,
            selectable: true,
            locked: false,
            length: 0,
            displayLength: false,
            mode: {
                'hover': false,
                'selected': true,
                'multiSelect': false
            },
            customName: '',
            currentActionPoint: null,
            color: {
                lineNormal: null,
                lineHover: null,
                lineSelected: null,
                fillNormal: null,
                connection: null          
            },
            defaultColor: {
                lineNormal: '#000000',
                lineHover: '#0000FF',
                lineSelected: 'blue',
                fillNormal: '#d8d8d8',
                connection: 'blue'              
            },
            display: {
                additionalPoints: {
                    connections: []
                }
            },
            hitMapColor: 'rgb(0,0,0)'
        }, opts || {});
        
        if(this.storage.color == null) {
            this.resetColor();
        } else {
            if(this.storage.color.lineNormal == null) {
                this.storage.color.lineNormal = JSON.parse(JSON.stringify(this.storage.defaultColor.lineNormal));
            }
            if(this.storage.color.lineHover == null) {
                this.storage.color.lineHover = JSON.parse(JSON.stringify(this.storage.defaultColor.lineHover));
            }
            if(this.storage.color.lineSelected == null) {
                this.storage.color.lineSelected = JSON.parse(JSON.stringify(this.storage.defaultColor.lineSelected));
            }
            if(this.storage.color.fillNormal == null) {
                this.storage.color.fillNormal = JSON.parse(JSON.stringify(this.storage.defaultColor.fillNormal));
            }
            if(this.storage.color.connection == null) {
                this.storage.color.connection = JSON.parse(JSON.stringify(this.storage.defaultColor.connection));
            }
        }
        
        if(this.storage.id == null) {
            this.storage.id = HelperFunctions.guid();
        }
        
        if(this.storage.positionStart) {
            this.setPoint('positionStart', this._roundPoint(this.storage.positionStart, true));
        }
        if(this.storage.positionEnd) {
            this.setPoint('positionEnd', this._roundPoint(this.storage.positionEnd, true));
        }
        
        if(this.storage.customName == '') {
            this.storage.customName = JSON.parse(JSON.stringify(this.storage.type));
        }
        
        if(this.storage.locked == true) {
            this.storage.currentActionPoint = null;
        }
        
        this.publicKeys = {
            'defaultLineWidth': function(c) { return isNaN(Number(c)) ? 0.5 : Number(c); },
            'customName': function(c) { return c; },
            'visible': function(c) { return c === true; },
            'selectable': function(c) { return c === true; },
            'locked': function(c) { if(c) { this.storage.currentActionPoint = null; } return c === true; },
            'positionStart': function(c) { return c; },
            'positionEnd': function(c) { return c; },
            'id': function(c) { return c; }
        };
        this.customKeys = {
            'lineColorNormal': { set: function(c) { this.storage.color.lineNormal = c; }.bind(this), get: function(c) { return this.storage.color.lineNormal; }.bind(this) },
            'lineColorHover': { set: function(c) { this.storage.color.lineHover = c; }.bind(this), get: function(c) { return this.storage.color.lineHover; }.bind(this) },
            'lineColorSelected': { set: function(c) { this.storage.color.lineSelected = c; }.bind(this), get: function(c) { return this.storage.color.lineSelected; }.bind(this) },
            'fillColorNormal': { set: function(c) { this.storage.color.fillNormal = c; }.bind(this), get: function(c) { return this.storage.color.fillNormal; }.bind(this) },
            'defaultLineColorNormal': { set: function(c) { this.storage.defaultColor.lineNormal = c; }.bind(this), get: function(c) { return this.storage.defaultColor.lineNormal; }.bind(this) },
            'defaultLineColorHover': { set: function(c) { this.storage.defaultColor.lineHover = c; }.bind(this), get: function(c) { return this.storage.defaultColor.lineHover; }.bind(this) },
            'defaultLineColorSelected': { set: function(c) { this.storage.defaultColor.lineSelected = c; }.bind(this), get: function(c) { return this.storage.defaultColor.lineSelected; }.bind(this) },
            'defaultFillColorNormal': { set: function(c) { this.storage.defaultColor.fillNormal = c; }.bind(this), get: function(c) { return this.storage.defaultColor.fillNormal; }.bind(this) }
        };
        this.publicValues = {};
    }
    
    onBeforeChangeScaleByRatio(newScale, newW) {
        this.currentPosOnCanvas = {
            positionStart: this.getPoint('positionStart'),
            positionEnd: this.getPoint('positionEnd')
        };
    }
    
    onChangeScaleByRatio(ratio) {
        this.storage.positionStart = this.storage.zoomAndMove.zoomedInvXY(this.currentPosOnCanvas.positionStart);
        this.storage.positionEnd = this.storage.zoomAndMove.zoomedInvXY(this.currentPosOnCanvas.positionEnd);
        this.updateLength();
    }


    shouldCheckPointConnection() {
        return this.storage.checkPointConnection;
    }
    
    addAdditionalPoint(type, val) {
        if(!this.storage.display.additionalPoints.hasOwnProperty(type)) return;
        this.storage.display.additionalPoints[type].push(val);
    }
    
    getAdditionalPoint(type) {
        if(!this.storage.display.additionalPoints.hasOwnProperty(type)) return [];
        return this.storage.display.additionalPoints[type];
    }
    
    clearAdditionalPoints(type) {
        if(!this.storage.display.additionalPoints.hasOwnProperty(type)) return;
        this.storage.display.additionalPoints[type] = [];
    }
    
    copyColorFrom(inst) {
        this.storage.color = inst.getColor();
        this.storage.defaultColor = inst.getDefaultColor();
    }
    
    setColor(val) {
        this.storage.color.lineNormal = val;
    }
    getColor() {
        return this.storage.color;
    }
    getDefaultColor() {
        return this.storage.defaultColor;
    }
    
    resetColor() {
        this.storage.color = JSON.parse(JSON.stringify(this.storage.defaultColor));
    }
    
    getType() {
        return this.storage.type;
    }
    
    getPointOnPath(p1, p2, x) {
        if(p2.x == p1.x) {
            return {
                x: p1.x,
                y: Math.min(p1.y, p2.y) + (Math.abs(p2.y - p1.y) / 2)
            };
        }
        var m = (p2.y - p1.y) / (p2.x - p1.x);
        var b =  p2.y - m * p2.x;
        var y = m * x + b;
        return {
            x: x,
            y: y
        };
    }
    
    renderPointHandle(ctx, pName, isHitmapPainting) {
        if(this.storage.mode['multiSelect'] != true) {
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
            ctx.moveTo(this.getX(pName) + this.storage.handleCicleSize, this.getY(pName));
            ctx.arc(this.getX(pName), this.getY(pName), this.storage.handleCicleSize, 0, 2 * Math.PI);
            ctx.stroke();
            if(isHitmapPainting === true) {
                ctx.fill();
            }
            ctx.closePath(); 
        }
        if(isHitmapPainting != true && this.storage.display.additionalPoints.connections.length > 0) {
            for(var g=0;g<this.storage.display.additionalPoints.connections.length; g++) {
                var pnt = this.storage.display.additionalPoints.connections[g];
                ctx.beginPath();
                ctx.lineWidth = 0.5;
                ctx.fillStyle = this.storage.color.connection;
                ctx.moveTo(this.storage.zoomAndMove.zoomedX(pnt.x), this.storage.zoomAndMove.zoomedY(pnt.y));
                ctx.arc(this.storage.zoomAndMove.zoomedX(pnt.x), this.storage.zoomAndMove.zoomedY(pnt.y), 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath(); 
            }
        }
    }
    
    changeParameter(name, value) {
        if(typeof name === 'object' && name !== null && !value) {
            var keys = Object.keys(name);
            var res = {};
            for(var x=0; x<keys.length; x++) {
                res[keys[x]] = this.changeParameter(keys[x], name[keys[x]]);
            }
            return res;
        }
        if(this.publicKeys.hasOwnProperty(name)) {
            if(this.storage.hasOwnProperty(name)) {
                this.storage[name] = this.publicKeys[name].apply(this, [value]);
            } else {
                this.publicKeys[name].apply(this, [value]);
            }
            return true;
        } else if(this.customKeys.hasOwnProperty(name)) {
            this.customKeys[name].set.apply(this, [value]);
            return true;
        } else {
            return false;    
        }        
    }
    
    getId() {
        return this.storage.id;
    }
    
    getParams() {
        var p = {};
        var k = Object.keys(this.publicKeys);
        for(var x = 0; x < k.length; x++) {
            if(this.storage.hasOwnProperty(k[x])) {
                p[k[x]] = this.storage[k[x]];
            }
        }
        
        var k = Object.keys(this.customKeys);
        for(var x = 0; x < k.length; x++) {
            p[k[x]] = this.customKeys[k[x]].get()
        }
        
        var d = {};
        var k = Object.keys(this.publicValues);
        for(var x = 0; x < k.length; x++) {
            if(k[x] == 'length') {
                d[k[x]] = this.getLength();
            } else {
                d[k[x]] = this.storage[this.publicValues[k[x]]];
            }
        }
        
        return {
            id: this.getId(),
            type: this.storage.type,
            params: p,
            display: d
        };
    }
    
    toDxfString() {
       return null;
    }
    
    toJSON() {
        var p = {
            type: this.storage.type,
            display: {}
        };
        var k = Object.keys(this.publicKeys);
        for(var x = 0; x < k.length; x++) {
            p[k[x]] = this.storage[k[x]];
        }
        
        p.color = this.storage.color;
        p.defaultColor = this.storage.defaultColor;
        
        var k = Object.keys(this.publicValues);
        for(var x = 0; x < k.length; x++) {
            if(k[x] == 'length') {
                p.display[k[x]] = this.getLength();
            } else {
                p.display[k[x]] = this.storage[this.publicValues[k[x]]];
            }
        }
        
        return p;
    }
    
    getLength() {
        return this.storage.helperSharedData.calculateLength(this.storage.length).toFixed(2);
    }
    
    getLengthRaw() {
        return this.storage.length;
    }
    
    getXRaw(v) {
        return this.getPointRaw(v).x;
    }
    getYRaw(v) {
        return this.getPointRaw(v).y;
    }
    
    getPointRaw(v) {
        if(!this.storage.hasOwnProperty(v) || this.storage[v] == null) return {x:0,y:0};
        return this._roundPoint(this.storage[v], true);
        //return this.storage[v];
    }
    
    getPointAsString(v) {
        return this.getXRaw(v) + '#' + this.getYRaw(v);
    }
    
    getX(v) {
        return this.storage.zoomAndMove.zoomedX(this.getXRaw(v));
    }
    getY(v) {
        return this.storage.zoomAndMove.zoomedY(this.getYRaw(v));
    }
    
    getPoint(v) {
        return this.storage.zoomAndMove.zoomedXY(this.getPointRaw(v));
    }
    
    getArcSize() {
        return this.storage.zoomAndMove.zoomed(this.storage.arcSize);
    }
    
    _pointIsSimilar(p1, p2) {
        return (
            (Math.abs(p1.x - p2.x) <= this.storage.zoomAndMove.zoomedInv(this.storage.arcSize)) && // this.getArcSize()
            (Math.abs(p1.y - p2.y) <= this.storage.zoomAndMove.zoomedInv(this.storage.arcSize))
        );    
    }
    
    _roundPoint(point, raw) {
        return {
            x: this._round(point.x, raw),
            y: this._round(point.y, raw)
        };
    }
    
    _round(x, raw) {
        var gz = this._getGridSize(raw);
        var diff = (x % gz);
        if(diff == 0) return x;
        if(diff >= (gz/2)) {
            return x - diff + gz;    
        }
        return x - diff;
    }
    
    _getGridSize(raw) {
        if(raw === true) return this.storage.helperSharedData.getGridSize();
        return this.storage.zoomAndMove.zoomed(this.storage.helperSharedData.getGridSize()); // Math.round
    }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    setMode(mode, value) {
        if(this.storage.mode.hasOwnProperty(mode)) {
            this.storage.mode[mode] = value === true ? true : false;
        }
        if(mode == 'selected' && value == false) {
            this.clearAdditionalPoints('connections');
        }
    }
    
    getCurrentActionPoint() {
        return this.storage.currentActionPoint;
    }
    
    onClick() {
        if(this.storage.locked == true) { 
            this.storage.currentActionPoint = null;
            return; 
        }

        if(this.storage.mode['multiSelect']) {
            this.storage.currentActionPoint = 'move';
            return;
        }

        var pos = this.storage.zoomAndMove.getMousePosition();
        
        if(this.storage.positionStart != null && this._pointIsSimilar(pos, this.storage.positionStart)) { 
            this.storage.currentActionPoint = 'positionStart';
        } else if(this.storage.positionEnd != null && this._pointIsSimilar(pos, this.storage.positionEnd)) {
            this.storage.currentActionPoint = 'positionEnd';
        } else {
            this.storage.currentActionPoint = 'move';
        }
    }
    
    animate(ctx) {
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }
    }
    
    paint(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
    }
    
    setStartPoint() {
        this.setPoint('positionStart', this.storage.zoomAndMove.getMousePosition());
    }
    
    setEndPoint() {
        this.setPoint('positionEnd', this.storage.zoomAndMove.getMousePosition());
    }
    
    setPoint(point, val) {
        if(!this.storage.hasOwnProperty(point)) return;
        this.storage[point] = this._roundPoint(val, true);
        this.updateLength();
    }
    
    isLocked() {
        return this.storage.locked;
    }
    
    onEndMove() {
        if(this.storage.locked == true) { 
            return; 
        }
        if(this.storage.positionEnd) {
            this.storage.positionEnd = this._roundPoint(this.storage.positionEnd, true);
        }
        if(this.storage.positionStart) {
            this.storage.positionStart = this._roundPoint(this.storage.positionStart, true);    
        }
    }
    
    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        if(this.storage.currentActionPoint == null) {
            return;
        }        
        if(this.storage.currentActionPoint == 'move') {
            var delta = this.storage.zoomAndMove.getMousePositionDelta();
                this.storage.positionStart.x -= delta.x;
                this.storage.positionStart.y -= delta.y;

                this.storage.positionEnd.x -= delta.x;
                this.storage.positionEnd.y -= delta.y;
            /*    
            if(this.storage.display.additionalPoints.hasOwnProperty('connections')) {
                for(var g=0;g<this.storage.display.additionalPoints.connections.length; g++) {
                    var pnt = this.storage.display.additionalPoints.connections[g];
                    pnt.x -= delta.x;
                    pnt.y -= delta.y;
                }
            }
            */
        } else if(this.storage.hasOwnProperty(this.storage.currentActionPoint)) {
            var point = this.storage.zoomAndMove.getMousePosition();
            this.setPoint(this.storage.currentActionPoint, point); 
        }
    }
    
    _printLength(ctx) {
        if(this.storage.displayLength != true) return;
        
        ctx.font = "12px Arial";
        ctx.fillStyle = this.storage.color.lineNormal;
    
        var tx = this.storage.positionStart.x + ((this.storage.positionEnd.x - this.storage.positionStart.x) / 2);
        var ty = this.storage.positionStart.y + ((this.storage.positionEnd.y - this.storage.positionStart.y) / 2);
        if(this.storage.positionStart.y < this.storage.positionEnd.y) {
            if(this.storage.positionStart.x < this.storage.positionEnd.x) {
                ty = ty - 10;
            } else {
                tx = tx - 40;
            }   
        } else {
            ty = ty - 10;
            if(this.storage.positionStart.x <= this.storage.positionEnd.x) {
                tx = tx - 40;
            }                  
        }
        ctx.fillText(this.getLength(), this.storage.zoomAndMove.zoomedX(tx), this.storage.zoomAndMove.zoomedY(ty)); 
    }
    
    updateLength() {
        if(this.storage.positionStart == null || this.storage.positionEnd == null) return;
        this.storage.length = Math.ceil(Math.pow(Math.pow(Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x), 2) + Math.pow(Math.abs(this.storage.positionStart.y - this.storage.positionEnd.y), 2), 0.5)); 
    }
    
    /* HIT MAP ADDON */

    paintHitMap(ctx) {
        if(this.storage.visible != true) return;
        if(this.storage.selectable != true) return;
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        ctx.beginPath();
        ctx.lineWidth = this.storage.arcSize;
        ctx.lineJoin = 'miter'; 
        ctx.strokeStyle = this.getHitMapColor();
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.lineTo(this.getX('positionEnd'), this.getY('positionEnd'));
        ctx.stroke(); 
        ctx.closePath();        

        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.fillStyle = this.getHitMapColor();
            this.renderPointHandle(ctx, 'positionStart', true);
            ctx.fill();
            this.renderPointHandle(ctx, 'positionEnd', true);
            ctx.fill();
            ctx.closePath();  
        }
    }

    getHitMapColor() {
        return this.storage.hitMapColor;
    }
    
};

class RamaniActionPoint extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,    
            currentActionPoint: null,
            actionPayload: {}
        }, opts || {}));
    }
    
    setActionPayload(d) {
        this.storage.actionPayload = d;
    } 
    
    isValid() {
        return this.storage.positionStart != null;
    }
    
    _round(x, raw) {
        return x;
    }
    
    _paintObject(ctx) {
        ctx.lineJoin = 'miter'; 
        var pName = 'positionStart';
        ctx.moveTo(this.getX(pName), this.getY(pName) + this.storage.arcSize);
        ctx.arc(this.getX(pName), this.getY(pName), Math.max(1, this.storage.arcSize), 0, 2 * Math.PI);
        ctx.stroke(); 
        ctx.fill(); 
    }

    animate(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.storage.color.lineNormal;
        ctx.fillStyle = this.storage.color.fillNormal;
        this._paintObject(ctx);
        ctx.closePath();    
    }
    
    paint(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.storage.color.lineNormal;
        ctx.fillStyle = this.storage.color.fillNormal;
        this._paintObject(ctx);
        ctx.closePath();    
    }
    
    paintHitMap(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.getHitMapColor();
        ctx.fillStyle = this.getHitMapColor();
        
        this._paintObject(ctx);
        ctx.closePath();    
    }
    
    onClick() {
        this.storage.baseMap.fireEvent('action','clicked', this.storage.actionPayload);
    }
    
    toDxfString() {
        return null;
    }
    
    toJSON() {
        return null;
    }
};

class RamaniCurve extends RamaniObject {
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            size: 30,
            length: 0,    
            positionControll: null,
            currentActionPoint: 'positionEnd',
            singleDirection: false,
            doppelspur: false,
            displayLength: false,
            speedLimit: null,
            radius: 1.5,
            laneSpacing: 1.60,
            connected: {
                shortenPath: true,
                status: false,
                shapeIdOne: null,
                shapeIdTwo: null,
                connectionPoint: {x:0, y:0},
                shapeIdOneConnection: 'positionEnd',
                shapeIdTwoConnection: 'positionEnd'
            }
        }, opts || {}));
        
        this.publicKeys.speedLimit = function(c) { return c; };
        this.publicKeys.positionControll = function(c) { return c; };
        this.publicKeys.singleDirection = function(c) { return c === true ; };
        this.publicKeys.doppelspur = function(c) { return c === true ; };
        this.publicKeys.displayLength = function(c) { return c === true ; };
        this.publicKeys.radius = function(c) { this._calcCurve(c); return c === true ; };
        this.publicKeys.laneSpacing = function(c) { return c; };

        this.customKeys['colorConnection'] = { set: function(c) { this.storage.color.connection = c; }.bind(this), get: function(c) { return this.storage.color.connection; }.bind(this) };

        this.publicValues.length = 'length';
        
        this.doCalcControllPoint = this.storage.positionControll == null;     
        
        this.updateLength();
    }

    hasDirectionAB() { return true; }
    hasDirectionBA() { return !this.storage.singleDirection; }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionControll == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(this.storage.positionControll.x == null || this.storage.positionControll.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    getCurvePoint(t) {
        return {
            x: (1 - t) * (1 - t) * this.getX('positionStart') + 2 * (1 - t) * t * this.getX('positionControll') + t * t * this.getX('positionEnd'),
            y: (1 - t) * (1 - t) * this.getY('positionStart') + 2 * (1 - t) * t * this.getY('positionControll')+ t * t * this.getY('positionEnd')
        }
    }
    
    onClick() {
        var pos = this.storage.zoomAndMove.getMousePosition();
        
        if(this.storage.connected.status == true) {
            this.storage.currentActionPoint = 'move';
            return;
        }
        
        if(this.storage.positionStart != null && this._pointIsSimilar(pos, this.storage.positionStart)) { 
            this.storage.currentActionPoint = 'positionStart';
        } else if(this.storage.positionEnd != null && this._pointIsSimilar(pos, this.storage.positionEnd)) {
            this.storage.currentActionPoint = 'positionEnd';
        } else if(this.storage.positionControll != null && this._pointIsSimilar(pos, this.storage.positionControll)) {
            this.storage.currentActionPoint = 'positionControll';
        } else {
            this.storage.currentActionPoint = 'move';
        }
    }
    
    _quadraticBezierLength(p0, p1, p2) {
        var ax = p0.x - 2 * p1.x + p2.x;
        var ay = p0.y - 2 * p1.y + p2.y;
        var bx = 2 * p1.x - 2 * p0.x;
        var by = 2 * p1.y - 2 * p0.y;
        var A = 4 * (ax * ax + ay * ay);
        var B = 4 * (ax * bx + ay * by);
        var C = bx * bx + by * by;

        var Sabc = 2 * Math.sqrt(A+B+C);
        var A_2 = Math.sqrt(A);
        var A_32 = 2 * A * A_2;
        var C_2 = 2 * Math.sqrt(C);
        var BA = B / A_2;

        return (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
    }
    
    _getCirclePoint(pos, angle, radius) {
        if(radius == undefined) radius = 5;
        radius = this.storage.zoomAndMove.zoomed(radius);
        return {
            x: pos.x + radius * Math.cos(-angle*Math.PI/180),
            y: pos.y + radius * Math.sin(-angle*Math.PI/180)
        };
    }
    
    _calcAndPrintCirclePoint(ctx, lane, deg, radius) {
        var p = this._getCirclePoint(lane, deg, radius);
        ctx.moveTo(lane.x, lane.y);
        ctx.lineTo(p.x, p.y);
    }
    
    _calcAngleDeg(p1, p2) {
        return (Math.atan2(this.getY(p1) - this.getY(p2), this.getX(p1) - this.getX(p2)) * 180 / Math.PI) - 90;
    }
    
    _paintObject(ctx) {
        ctx.beginPath();

        if(this.storage.mode['selected']) {
            ctx.strokeStyle = this.storage.color.lineSelected; 
            ctx.lineWidth = this.storage.selectedLineWidth;
        } else {
            ctx.strokeStyle = this.storage.color.lineNormal;
            ctx.lineWidth = this.storage.defaultLineWidth;
        }

        if(this.storage.doppelspur == true) {
            ctx.lineWidth = this.storage.biggerLineWidth;
        }

        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.quadraticCurveTo(this.getX('positionControll'), this.getY('positionControll'), this.getX('positionEnd'), this.getY('positionEnd'));
        ctx.stroke();
        ctx.closePath();
        
        if(this.storage.singleDirection == true) {
            var angleDeg = this._calcAngleDeg('positionEnd','positionStart');

            ctx.beginPath();
            this._calcAndPrintCirclePoint(ctx, this.getCurvePoint(0.5), -angleDeg + 45, 10); // \
            this._calcAndPrintCirclePoint(ctx, this.getCurvePoint(0.5), -225 - angleDeg, 10); // /
            ctx.stroke();
            ctx.closePath();
        }
        
        this._printLength(ctx);
    }
    
    paintHitMap(ctx) {
        if(this.storage.selectable != true) return;
        if(this.storage.visible != true) return;
        if(!this.storage.positionEnd || !this.storage.positionStart || !this.storage.positionControll) { return; }
        
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.arcSize; //this.getArcSize();
        ctx.strokeStyle = this.getHitMapColor();
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.quadraticCurveTo(this.getX('positionControll'),this.getY('positionControll'),this.getX('positionEnd'),this.getY('positionEnd'));
        ctx.stroke(); 
        ctx.closePath();
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.fillStyle = this.getHitMapColor();
            this.renderPointHandle(ctx, 'positionStart', true);
            this.renderPointHandle(ctx, 'positionEnd', true);
            this.renderPointHandle(ctx, 'positionControll', true);
            ctx.fill();
            ctx.closePath();  
        }      
    }

    animate(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }       
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.defaultLineWidth;
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.lineWidth = this.storage.selectedLineWidth;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.connected.status == false) {
                if(this.storage.positionStart != null) {
                    this.renderPointHandle(ctx, 'positionStart');
                }
                if(this.storage.positionEnd != null) {
                    this.renderPointHandle(ctx, 'positionEnd');
                }
                if(this.storage.positionControll != null) {
                    this.renderPointHandle(ctx, 'positionControll');
                }
            }
            ctx.stroke();
            ctx.closePath();
        }
        
        if(this.storage.mode['hover']) { 
            ctx.strokeStyle = this.storage.color.lineHover;
        }  
        
        if(this.storage.mode['selected'] || this.storage.mode['hover']) {     
            this._paintObject(ctx);
        }
    }
    
    paint(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
        ctx.strokeStyle = this.storage.color.lineNormal;
        
        this._paintObject(ctx);
    }
    
    onEndMove() {
        if(this.storage.locked == true) { 
            return; 
        }
        super.onEndMove();
        if(this.storage.connected.status == false && this.doCalcControllPoint && this.storage.positionStart && this.storage.positionEnd) {
            this.doCalcControllPoint = false;
            this.storage.positionControll = {
                x: Math.min(this.storage.positionEnd.x, this.storage.positionStart.x) + Math.abs((this.storage.positionEnd.x - this.storage.positionStart.x) * 1/3),
                y: Math.min(this.storage.positionEnd.y, this.storage.positionStart.y)// + Math.abs((this.storage.positionEnd.y - this.storage.positionStart.y) * 1/3)
            } 
            this.storage.positionControll = this._roundPoint(this.storage.positionControll, true);
        }
    }
    
    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        
        if(this.storage.connected.status == true) {
            this.storage.currentActionPoint = 'move';    
        }        

        if(this.storage.currentActionPoint == null) {
            return;
        }        
        if(this.storage.currentActionPoint == 'move') {
            var delta = this.storage.zoomAndMove.getMousePositionDelta();
            this.storage.positionStart.x -= delta.x;
            this.storage.positionStart.y -= delta.y;

            this.storage.positionEnd.x -= delta.x;
            this.storage.positionEnd.y -= delta.y;

            this.storage.positionControll.x -= delta.x;
            this.storage.positionControll.y -= delta.y;
        } else if(this.storage.hasOwnProperty(this.storage.currentActionPoint)) {
            var point = this.storage.zoomAndMove.getMousePosition();
            this.setPoint(this.storage.currentActionPoint, point); 
            if(this.doCalcControllPoint) {
                this.storage.positionControll = this._roundPoint({
                    x: Math.min(this.storage.positionEnd.x, this.storage.positionStart.x) + Math.abs((this.storage.positionEnd.x - this.storage.positionStart.x) * 1/3),
                    y: Math.min(this.storage.positionEnd.y, this.storage.positionStart.y)// + Math.abs((this.storage.positionEnd.y - this.storage.positionStart.y) * 1/3)
                }, true);
            }
        }
        
        /*
        if(
            (this.storage.currentActionPoint == 'positionEnd' || this.storage.currentActionPoint == 'positionStart') &&
            (this.storage.positionStart.x > this.storage.positionEnd.x || this.storage.positionStart.y > this.storage.positionEnd.y)
        ) {
            var tmp = this.storage.positionStart;
            this.storage.positionStart = this.storage.positionEnd;
            this.storage.positionEnd = tmp;
            if(this.storage.currentActionPoint == 'positionEnd') {
                this.storage.currentActionPoint = 'positionStart';
            } else {
                this.storage.currentActionPoint = 'positionEnd';
            }
        }
        */
    
        this.updateLength();    
    }
    
    updateLength() {
        if(this.storage.positionEnd && this.storage.positionStart && this.storage.positionControll) { 
            this.storage.length = Math.round(this._quadraticBezierLength(this.storage.positionStart, this.storage.positionControll, this.storage.positionEnd));         
        }
    }
    
    toDxfString() {
        let s = `0\nPOLYLINE\n`;
        s += `8\n${this.getId()}\n`;
        s += `66\n1\n70\n0\n`;

        for(var t=0; t<1; t=t+0.01) {
            var p = this.getCurvePoint(t);
            s += `0\nVERTEX\n`;
            s += `8\n${this.getId()}\n`;
            s += `70\n0\n`;
            s += `10\n${p.x}\n20\n${p.y * -1}\n`;
        }
        
        s += `0\nSEQEND\n`;
        return s;
    }
    
    _calcCurve(radius, undoChanges) {
        return new Promise(function(resolve, reject) {
            var shapeOne = (typeof this.storage.connected.shapeIdOne === 'object') ? this.storage.connected.shapeIdOne : this.storage.baseMap.getShapeById(this.storage.connected.shapeIdOne);
            var shapeTwo = (typeof this.storage.connected.shapeIdTwo === 'object') ? this.storage.connected.shapeIdTwo : this.storage.baseMap.getShapeById(this.storage.connected.shapeIdTwo);

            var p1 = this.storage.connected.connectionPoint;
            var p2 = shapeOne.getPointRaw(this.storage.connected.shapeIdOneConnection);
            var p3 = shapeTwo.getPointRaw(this.storage.connected.shapeIdTwoConnection);

            this.setPoint('positionControll', p1);
            this.doCalcControllPoint = false;

            function calcAngle(center, p1, p2) {
                const transformedP1 = HelperFunctions.createPoint(p1.x - center.x, p1.y - center.y);
                const transformedP2 = HelperFunctions.createPoint(p2.x - center.x, p2.y - center.y);
                const angleToP1 = Math.atan2(transformedP1.y, transformedP1.x);
                const angleToP2 = Math.atan2(transformedP2.y, transformedP2.x);
                var radians = (angleToP2 - angleToP1);
                if (radians < 0) {
                    radians += (2 * Math.PI);
                }
                if (radians > Math.PI) {
                    radians = 2 * Math.PI - radians;
                }
                return 360 * radians / (2 * Math.PI);
            }

            //var alpha = Math.atan2(p3.y - p1.y, p3.x - p1.x) - Math.atan2(p2.y - p1.y, p2.x - p1.x);
            var alpha = calcAngle(p1, p2, p3);
            if(alpha > 180) {
                this.storage.connected.status = false;
                reject();
                return [null, null];
            }
/*
            var s = 2 * radius * Math.sin((180 - alpha) / 2); // s is the distance betreen the lines shapeone and shapetwo
            var c = (s / 2) / Math.sin(alpha / 2); // c is the length we have to cut the lines 
                c = Math.max(radius,c);
            var pathToCut = this.storage.helperSharedData.toPX(c); // c in px
*/
            var pathToCut = this.storage.helperSharedData.toPX(radius); // looks like this fits better for painting ....
            var fnGetNewCoordianteAfterDistance = function(po1, po2, dist) {
                if(dist == 0) return po2;
                var d = Math.pow((Math.pow((po2.x - po1.x), 2) + Math.pow((po2.y - po1.y), 2)), 0.5);
                
                var newCord = {
                    x: (po1.x + ((dist / d) * (po2.x - po1.x))),
                    y: (po1.y + ((dist / d) * (po2.y - po1.y)))
                };
                // round value ... sometimes small number makes the difference
                newCord.x = newCord.x < 0 ? Math.floor(newCord.x) : Math.ceil(newCord.x);
                newCord.y = newCord.y < 0 ? Math.floor(newCord.y) : Math.ceil(newCord.y);
                    
                return newCord;
            }.bind(this);
            
            var p2New = fnGetNewCoordianteAfterDistance(p1, p2, pathToCut);
            var p3New = fnGetNewCoordianteAfterDistance(p1, p3, pathToCut);

            this.setPoint('positionStart', p2New);
            this.setPoint('positionEnd', p3New);

            shapeOne.setPoint(this.storage.connected.shapeIdOneConnection == 'positionEnd' ? 'positionStart': 'positionEnd', p2New);
            shapeTwo.setPoint(this.storage.connected.shapeIdTwoConnection == 'positionEnd' ? 'positionStart': 'positionEnd', p3New);
            
            this.storage.connected.p2p1 = [p2New, p1];
            this.storage.connected.p3p1 = [p3New, p1];
            
            if(this.storage.connected.shortenPath == false) {
                this.storage.baseMap._createShape({
                    type: Ramani.SHAPETYPES.PATH
                }).then(function(inst) {
                    inst.copyColorFrom(shapeOne);
                    inst.setPoint('positionStart', p2New);
                    inst.setPoint('positionEnd', p1);
                    inst.setMode('hover', false);
                    inst.setMode('selected', false);
                    inst.setMode('multiSelect', false);
                    this.storage.baseMap._addShapeToMap(inst, undefined, true);
                    if(undoChanges) {
                        undoChanges.push({
    					    type: 'ADD',
    					    shapeId: inst.getId()
    				    });
                    }
                    return this.storage.baseMap._createShape({
                        type: Ramani.SHAPETYPES.PATH
                    });
                }.bind(this)).then(function(inst) {
                    inst.copyColorFrom(shapeOne);
                    inst.setPoint('positionStart', p3New);
                    inst.setPoint('positionEnd', p1);
                    inst.setMode('hover', false);
                    inst.setMode('selected', false);
                    inst.setMode('multiSelect', false);
                    this.storage.baseMap._addShapeToMap(inst, undefined, true);
                    if(undoChanges) {
                        undoChanges.push({
        					type: 'ADD',
        					shapeId: inst.getId()
        				});
                    }
                    this.storage.baseMap.paint();
                    resolve(this);
                }.bind(this))
            } else {
                resolve(this);
            }
        }.bind(this));
    }
    
    getConnectionData() {
        return this.storage.connected;
    }
    
    isConnected() {
        return this.storage.connected.status;
    }
    
    setConnected(bool) {
        //this.storage.connected.status = bool;
    }
    
    connectCurve(opts, undoChanges) {
        this.storage.connected = Object.assign(this.storage.connected, opts || {}, {
            status: true
        });

        this.storage.connected.status = false;
        
        var ps = (typeof this.storage.connected.shapeIdOne === 'object') ? this.storage.connected.shapeIdOne : this.storage.baseMap.getShapeById(this.storage.connected.shapeIdOne);
        this.storage.color = ps.getColor();
        this.storage.defaultColor = ps.getDefaultColor();

        return this._calcCurve(this.storage.radius, undoChanges);
    }
};

class RamaniDoor extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            currentActionPoint: 'positionEnd',
            speedLimit: null,
            stopTimeInSeconds: 0 
        }, opts || {}));
        
        this.calc = {};
        
        this.publicKeys.speedLimit = function(c) { return c; };
        this.publicKeys.stopTimeInSeconds = function(c) { return c; };
    }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    _getCirclePoint(pos, angle) {
        var radius = this._getGridSize();
        return {
            x: pos.x + radius * Math.cos(-angle * Math.PI / 180),
            y: pos.y + radius * Math.sin(-angle * Math.PI / 180)
        };
    }
    
    _paintObject(ctx) {
        if(!this.isValid()) { return; }
        ctx.beginPath();
        var posStart = this.getPoint('positionStart');
        var posEnd = this.getPoint('positionEnd');
        
        ctx.stokeStyle = this.storage.mode['selected'] ? this.storage.color.lineSelected : (this.storage.mode['hover'] ? this.storage.color.lineHover:this.storage.color.lineNormal );
        ctx.lineWidth = this.storage.biggerLineWidth * 2;

        ctx.moveTo(posStart.x, posStart.y);
        ctx.lineTo(posEnd.x, posEnd.y);
        ctx.stroke();
        ctx.closePath();
    }
    
    _paintObject2(ctx) {
        if(!this.isValid()) { return; }
        
        var posStart = this.getPoint('positionStart');
        var posEnd = this.getPoint('positionEnd');
        var ident = posStart.x + '#' + posStart.y + ':' + posEnd.x + '#' + posEnd.y;
        if(this.calc.hasOwnProperty(ident)) {
            var angleDeg = this.calc[ident].angleDeg;
            var leftLane = this.calc[ident].leftLane;
            var rightLane = this.calc[ident].rightLane;
            var middleLane = this.calc[ident].middleLane;
        } else {
            var angleDeg = (Math.atan2(posEnd.y - posStart.y, posEnd.x - posStart.x) * 180 / Math.PI) - 90;
            // circle around start point, there is always a left and right side starting the route.
            var leftLane = {
                start: this._getCirclePoint(posStart, 180 - angleDeg),
                end: this._getCirclePoint(posEnd, 180 - angleDeg),
            };
            var rightLane = {
                start: this._getCirclePoint(posStart, 0 - angleDeg),
                end: this._getCirclePoint(posEnd, 0 - angleDeg)
            };
            var middleLane = {
                start: this._getCirclePoint(posStart, 90 - angleDeg),
                end: this._getCirclePoint(posEnd, -90 - angleDeg)
            };
            
            this.calc = {};
            this.calc[ident] = {
                angleDeg: angleDeg,
                leftLane: leftLane,
                rightLane: rightLane,
                middleLane: middleLane    
            };
        }
                
        ctx.beginPath();
        ctx.lineWidth = this.storage.defaultLineWidth; 
        ctx.setLineDash([0, 0]);
        ctx.strokeStyle = this.storage.mode['selected'] ? this.storage.color.lineSelected : (this.storage.mode['hover'] ? this.storage.color.lineHover:this.storage.color.lineNormal );

        //  -|
        ctx.moveTo(leftLane.start.x, leftLane.start.y);
        ctx.lineTo(rightLane.start.x, rightLane.start.y);
        
        ctx.moveTo(posStart.x, posStart.y);
        ctx.lineTo(middleLane.start.x, middleLane.start.y);


        // |-
        ctx.moveTo(leftLane.end.x, leftLane.end.y);
        ctx.lineTo(rightLane.end.x, rightLane.end.y);
        
        ctx.moveTo(posEnd.x, posEnd.y);
        ctx.lineTo(middleLane.end.x, middleLane.end.y);
        
        ctx.stroke();

        ctx.closePath();
        
        // ======
        ctx.beginPath();
        //ctx.save();
        ctx.lineWidth = this.storage.defaultLineWidth; 
        ctx.strokeStyle = "#a8a8a8";
        ctx.setLineDash([this.storage.zoomAndMove.zoomed(8), this.storage.zoomAndMove.zoomed(4)]);
        ctx.moveTo(leftLane.start.x, leftLane.start.y);
        ctx.lineTo(leftLane.end.x, leftLane.end.y);
    //    ctx.stroke();
        ctx.moveTo(rightLane.start.x, rightLane.start.y);
        ctx.lineTo(rightLane.end.x, rightLane.end.y);
        ctx.stroke();
        
        ctx.closePath();
    }
    
    animate(ctx) {
        if(!this.isValid()) { return; }
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }
        
        this._paintObject(ctx);
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            //ctx.save();
            ctx.lineJoin = 'miter'; 
            ctx.lineWidth = this.storage.defaultLineWidth;
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
                this.renderPointHandle(ctx, 'positionStart');
            }
            if(this.storage.positionEnd != null) {
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            //ctx.restore();
            ctx.closePath();
        }
    }
    
    paint(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        this._paintObject(ctx);
    }
    
    toDxfString() {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = `0\nLINE\n`;
        s += `8\nD${this.getX('positionStart')}${this.getY('positionStart')}\n`;
        s += `10\n${this.getX('positionEnd')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
        s += `11\n${this.getX('positionStart')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;
        return s;
    }
}    

 class RamaniGrid extends RamaniObject {
    constructor(opts) {
        super(Object.assign({
            positionStart: { x:0, y: 0},
            positionEnd: { x:0, y: 0},
            stepSize: 2, // skipp x grid lines to paint
            backgroundColor: '#e6ebee',
            lineColor: '#dfdedc',
            lineDash: []
        }, opts || {}));
    }
    
    animate(ctx) {
    }
    
    isValid() {
        return true;
    }
    
    paint(ctx) {       
        if(this.storage.visible != true) return;
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(1);
        ctx.rect(this.storage.positionStart.x, this.storage.positionStart.y, this.storage.positionEnd.x, this.storage.positionEnd.y);
        ctx.fillStyle = this.storage.backgroundColor;
        ctx.fill();
        
        ctx.strokeStyle = this.storage.lineColor;
        ctx.setLineDash(this.storage.lineDash);
        
        var p1 = this.storage.zoomAndMove.zoomedXY({
            x: this.storage.positionEnd.x - (this.storage.positionEnd.x % this._getGridSize(true)),
            y: this.storage.positionEnd.y - (this.storage.positionEnd.y % this._getGridSize(true))
        });
        
        while(p1.x < this.storage.positionEnd.x) {
            p1.x += this._getGridSize();
        }
        while(p1.y < this.storage.positionEnd.y) {
            p1.y += this._getGridSize();
        }
        
        // start lines |
        for(var x=p1.x; x>0; x = x - this._getGridSize() * this.storage.stepSize) {
            if(x > this.storage.positionEnd.x) continue;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.storage.positionEnd.y);
        }       
        // lines -
        for(var y=p1.y; y>0; y = y - this._getGridSize() * this.storage.stepSize) {
            if(y > this.storage.positionEnd.y) continue;
            ctx.moveTo(0, y);
            ctx.lineTo(this.storage.positionEnd.x, y);
        }     
        
        ctx.stroke(); 
        ctx.closePath();
    }
    
    paintHitMap(ctx) { }
    
    setStartPoint(point) {
        this.storage.positionStart = point;
    }
    
    setEndPoint(point) {
        this.storage.positionEnd = point;
    }
}
class RamaniImage extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 10,
            currentActionPoint: 'positionEnd',
            image: {
                width: 0,
                height: 0,
                img: null
            },
            imageBase64: null,
            imageRatio: 1,
            opacity: 1,
            selectable: false,
            mode: {
                'hover': false,
                'selected': true,
                'multiSelect': false
            }
        }, opts || {}));

        if(this.storage.positionEnd && this.storage.positionStart) {
            this.storage.image.width = Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x);
            this.storage.image.height = this.storage.image.width / this.storage.imageRatio;
        }
        
        this.publicKeys.opacity = function(c) { 
            var c = Number(c);
            if(isNaN(c)) {
                return 1;
            }
            if(c > 1) { c = 1; }
            else if(c < 0) { c = 0; }
            return c; 
        };
    }

    onChangeScaleByRatio(ratio) {
        super.onChangeScaleByRatio(ratio);
        this.storage.image.width = Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x);
        this.storage.image.height = this.storage.image.width / this.storage.imageRatio;
    }
    
    _round(x, raw) { // disable grid for image
        return x;
    }
    
    getArcSize() { return 10; }
    
    toJSON() {
        var p = RamaniObject.prototype.toJSON.call(this);
        p.imageBase64 = this.storage.imageBase64;
        p.imageRatio = this.storage.imageRatio;
        return p;
    }
    
    setImage(imageData) {
        this.storage.imageBase64 = imageData;
        return new Promise(function(resolve, reject) {
            if(imageData != null) {
                var imageObj = new Image();
                imageObj.onload = function() {
                    this.storage.image.img = imageObj;
                    this.storage.image.width = this.storage.zoomAndMove.zoomedInv(imageObj.width);
                    this.storage.image.height = this.storage.zoomAndMove.zoomedInv(imageObj.height);
                    this.storage.imageRatio =  imageObj.width / imageObj.height;
                    this.storage.positionEnd = {
                        x: this.storage.positionStart.x + this.storage.image.width,
                        y: this.storage.positionStart.y + this.storage.image.height
                    };
                    resolve();
                }.bind(this);
                imageObj.src = imageData;
            } else {
                reject();
            }
        }.bind(this));
    }
    
    parseImage() {
        return new Promise(function(resolve, reject) {
            if(this.storage.imageBase64 != null && this.storage.image.img == null) {
                var imageObj = new Image();
                imageObj.onload = function() {
                    this.storage.image.img = imageObj;
                    resolve();
                }.bind(this);
                imageObj.src = this.storage.imageBase64;            
            } else {
                resolve();
            }
        }.bind(this));
    }
    
    isValid() {
        return this.storage.imageBase64 != null;
    }
    
    _paintObject(ctx) {
        if(this.storage.imageBase64 != null && this.storage.image.img == null) {
            var imageObj = new Image();
            imageObj.onload = function() {
                this.storage.image.img = imageObj;
                this.storage.baseMap.paint();
            }.bind(this);
            imageObj.src = this.storage.imageBase64;            
        }
        if(this.storage.imageBase64 == null || this.storage.imageBase64 == '') return;      
        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = this.storage.opacity;
        if(this.storage.image.img != null) {
            ctx.drawImage(this.storage.image.img, this.getX('positionStart'), this.getY('positionStart'), this.storage.zoomAndMove.zoomed(this.storage.image.width), this.storage.zoomAndMove.zoomed(this.storage.image.height));
        }
        ctx.closePath();
        ctx.restore();
    }
        
    animate(ctx) {
        if(this.storage.visible != true) return;
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }
        
        if(this.storage.mode['selected']) { 
            this._paintObject(ctx);
        }        

        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.save();
            ctx.lineJoin = 'miter'; 
            ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(1);
            ctx.strokeStyle = this.storage.mode['selected'] ? this.storage.color.lineSelected : this.storage.color.lineHover;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
                this.renderPointHandle(ctx, 'positionStart');
            }
            ctx.stroke(); 
            if(this.storage.positionEnd != null) {
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            ctx.restore();
            ctx.closePath();
        }
    }
    
    paint(ctx) {
        if(this.storage.visible != true) return;    
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }    
        this._paintObject(ctx);
    }
    
    paintHitMap(ctx) {
        if(this.storage.visible != true) return;
        if(this.storage.selectable != true) return;
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.getArcSize();
        ctx.fillStyle = this.getHitMapColor();
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.fillRect(this.getX('positionStart'), this.getY('positionStart'), this.storage.zoomAndMove.zoomed(this.storage.image.width), this.storage.zoomAndMove.zoomed(this.storage.image.height));
        ctx.stroke(); 
        ctx.closePath();  
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.fillStyle = this.getHitMapColor();
            this.renderPointHandle(ctx, 'positionStart', true);
            this.renderPointHandle(ctx, 'positionEnd', true);
            ctx.fill();
            ctx.closePath();  
        }      
    }
    
    setEndPoint(point) {
        if(this.storage.visible != true) return;    
        var point = this.storage.zoomAndMove.getMousePosition();
        this.storage.image.width = Math.abs(this.storage.positionEnd.x - point.x);
        this.storage.image.height = Math.abs(this.storage.positionEnd.y - point.y);
        this.storage.positionEnd = this._roundPoint(point, true);
    }

    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        if(this.storage.currentActionPoint == null) {
            return;
        }        
        if(this.storage.currentActionPoint == 'move') {
            var delta = this.storage.zoomAndMove.getMousePositionDelta();
            this.storage.positionStart.x -= delta.x;
            this.storage.positionStart.y -= delta.y;

            this.storage.positionEnd.x -= delta.x;
            this.storage.positionEnd.y -= delta.y;
        } else if(this.storage.hasOwnProperty(this.storage.currentActionPoint)) {
            var point = this.storage.zoomAndMove.getMousePosition();
            this.storage[this.storage.currentActionPoint] = this._roundPoint(point, true); 
            
            this.storage.image.width = Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x);
            this.storage.image.height = this.storage.image.width / this.storage.imageRatio;
            
            if(this.storage.currentActionPoint == 'positionEnd') {
                this.storage.positionStart.x = this.storage.positionEnd.x - this.storage.image.width;
                this.storage.positionStart.y = this.storage.positionEnd.y - this.storage.image.height;
            } else {
                this.storage.positionEnd.x = this.storage.positionStart.x + this.storage.image.width;
                this.storage.positionEnd.y = this.storage.positionStart.y + this.storage.image.height;
            }
        }
    }
}
class RamaniPath extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            positionStart: null,
            positionEnd: null,
            length: 0,
            hover: {
                all: false
            },
            mode: {
                'hover': true,
                'selected': true,
                'multiSelect': false
            },
            currentActionPoint: 'positionEnd',
            singleDirection: false,
            doppelspur: false,
            displayLength: false,
            speedLimit: null,
            useLineDash: false,
            laneSpacing: 1.60
        }, opts || {}));
        
        this.publicKeys.speedLimit = function(c) { return c; };
        this.publicKeys.singleDirection = function(c) { return c === true ; };
        this.publicKeys.doppelspur = function(c) { return c === true ; };
        this.publicKeys.displayLength = function(c) { return c === true ; };
        this.publicKeys.laneSpacing = function(c) { return c; };
        
        this.customKeys['colorConnection'] = { set: function(c) { this.storage.color.connection = c; }.bind(this), get: function(c) { return this.storage.color.connection; }.bind(this) };
        
        this.publicValues.length = 'length';

        this.updateLength();
    }
    
    hasDirectionAB() { return true; }
    hasDirectionBA() { return !this.storage.singleDirection; }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    _getCirclePoint(pos, angle, radius) {
        if(radius == undefined) radius = this.storage.zoomAndMove.zoomed(5);
        return {
            x: pos.x + radius * Math.cos(-angle*Math.PI/180),
            y: pos.y + radius * Math.sin(-angle*Math.PI/180)
        };
    }
    
    _calcAndPrintCirclePoint(ctx, lane, deg, radius) {
        var p = this._getCirclePoint(lane, deg, radius);
        ctx.moveTo(lane.x, lane.y);
        ctx.lineTo(p.x, p.y);
    }
    
    _paintObject(ctx) {
        ctx.beginPath();
        
        var posStart = this.getPoint('positionStart');
        var posEnd = this.getPoint('positionEnd');

        if(this.storage.mode['selected']) {
            ctx.strokeStyle = this.storage.color.lineSelected; 
            ctx.lineWidth = this.storage.selectedLineWidth;
        } else {
            ctx.strokeStyle = this.storage.color.lineNormal;
            ctx.lineWidth = this.storage.defaultLineWidth;
        }

        if(this.storage.doppelspur == true) {
            ctx.lineWidth = this.storage.biggerLineWidth;
        }
        if(this.storage.useLineDash || this.storage.mode['selected']) {
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(6),this.storage.zoomAndMove.zoomed(3)]);
        }
        ctx.moveTo(posStart.x, posStart.y);
        ctx.lineTo(posEnd.x, posEnd.y);
        ctx.stroke();
        ctx.closePath();

        if(this.storage.singleDirection == true) {
            var angleDeg = (Math.atan2(posEnd.y - posStart.y, posEnd.x - posStart.x) * 180 / Math.PI) - 90;

            ctx.beginPath();
            var dist = 10;
            var p = this.getPointOnPath(posStart, posEnd, posStart.x + ((posEnd.x - posStart.x) / 2 - dist));
            this._calcAndPrintCirclePoint(ctx, p, -angleDeg + 45, dist); // \
            this._calcAndPrintCirclePoint(ctx, p, -225 - angleDeg, dist); // /
            ctx.stroke();
            ctx.closePath();
        }
        
        this._printLength(ctx);
    }
    
    animate(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;        
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }

        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.lineJoin = 'miter'; 
            ctx.lineWidth = this.storage.selectedLineWidth;
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
            //    console.debug('positionStart', this.storage.positionStart);
                this.renderPointHandle(ctx, 'positionStart');
            }
            if(this.storage.positionEnd != null) {
            //    console.debug('positionEnd', this.storage.positionStart);
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            ctx.closePath();
            
            ctx.beginPath();
            ctx.lineWidth = this.storage.defaultLineWidth; 
            if(this.storage.doppelspur == true) {
                ctx.lineWidth = this.storage.biggerLineWidth;
            }
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            
            this._paintObject(ctx);
            
            ctx.stroke();
            ctx.closePath();
        }
        
        if(this.storage.mode['hover']) {
            ctx.beginPath();
            ctx.lineWidth = this.storage.defaultLineWidth;
            if(this.storage.doppelspur == true) {
                ctx.lineWidth = this.storage.biggerLineWidth;
            }
            ctx.strokeStyle = this.storage.color.lineHover;
            ctx.lineJoin = 'round';
            this._paintObject(ctx);
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    paint(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;        
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.beginPath();
        ctx.lineJoin = 'round'; 
        ctx.lineWidth = this.storage.defaultLineWidth;
        if(this.storage.doppelspur == true) {
            ctx.lineWidth = this.storage.biggerLineWidth;
        }
        ctx.strokeStyle = this.storage.color.lineNormal;
        this._paintObject(ctx);
        ctx.stroke(); 
        ctx.closePath();        
    }
    
    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        super.move();

        /* let user decide
        if(
            this.storage.positionStart.x > this.storage.positionEnd.x ||
            (this.storage.positionStart.x == this.storage.positionEnd.x && this.storage.positionStart.y < this.storage.positionEnd.y)
        ) {
            var tmp = this.storage.positionStart;
            this.storage.positionStart = this.storage.positionEnd;
            this.storage.positionEnd = tmp;
            if(this.storage.currentActionPoint == 'positionEnd') {
                this.storage.currentActionPoint = 'positionStart';
            } else if(this.storage.currentActionPoint == 'positionStart') {
                this.storage.currentActionPoint = 'positionEnd';
            }
        }
        */

        this.updateLength();
    }
    
    toDxfString() {
       //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
       let s = `0\nLINE\n`;
       s += `8\nL${this.getId()}\n`;
       s += `10\n${this.getXRaw('positionEnd')}\n20\n${this.getYRaw('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getXRaw('positionStart')}\n21\n${this.getYRaw('positionStart') * -1}\n31\n0\n`;
       return s;
    }
};
class RamaniRefLine extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            positionStart: null,
            positionEnd: null,
            length: 1,
            hover: {
                all: false
            },
            mode: {
                'hover': true,
                'selected': true,
                'multiSelect': false
            },
            currentActionPoint: 'positionEnd',
            displayLength: true,
            color: {
                lineNormal: 'purple',
                lineHover: 'purple',
                lineSelected: 'purple',
                fillNormal: 'purple'              
            },
            distance: 1
        }, opts || {}));
        
        this.publicKeys.distance = function(c) { 
            var ratio = c / this.storage.distance; // save ratio before edit
            //this.calcNewEndPoint(c);
            this.storage.zoomAndMove.setScaleByRatio(ratio, this.storage.positionStart);
            return c; 
        };

        this.publicValues.length = 'length';
        this.publicKeys.displayLength = function(c) { return c === true ; };
        
        this.updateLength();
    }
    
    calcNewEndPoint(distance) {
        var distanceInPX = this.storage.helperSharedData.toPX(distance);
        if(this.storage.positionStart.x == this.storage.positionEnd.x) {
            this.storage.positionEnd = {
                x: p1.x,
                y: this.storage.positionStart.y + distanceInPX
            };
        }
        
        var angle = (Math.atan2(this.storage.positionEnd.y - this.storage.positionStart.y, this.storage.positionEnd.x - this.storage.positionStart.x) * 180 / Math.PI);

        this.storage.positionEnd = {
            x: this.storage.positionStart.x + distanceInPX * Math.cos(angle * (Math.PI / 180)),
            y: this.storage.positionStart.y + distanceInPX * Math.sin(angle * (Math.PI / 180))
        };
        
        this.updateLength();
    }
    
    _round(x, raw) { // disable grid for refline
        return x;
    }
    
    getDistance() {
        return this.storage.distance;
    }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    _paintObject(ctx) {
        ctx.setLineDash([]);
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.lineTo(this.getX('positionEnd'), this.getY('positionEnd'));
        
        this._printLength(ctx);
    }
    
    animate(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }

        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.lineJoin = 'miter'; 
            ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(1);
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
                this.renderPointHandle(ctx, 'positionStart');
            }
            if(this.storage.positionEnd != null) {
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            ctx.closePath();
            
            ctx.beginPath();
            ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            
            this._paintObject(ctx);
            
            ctx.stroke();
            ctx.closePath();
        }
        
        if(this.storage.mode['hover']) {
            ctx.beginPath();
            ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
            ctx.strokeStyle = this.storage.color.lineHover;
            this._paintObject(ctx);
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        super.move();
        this.updateLength();
    }
    
    updateLength() {
        super.updateLength();
        this.storage.distance = this.getLength();
    }
    
    paint(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
        ctx.strokeStyle = this.storage.color.lineNormal;
        this._paintObject(ctx);
        ctx.stroke(); 
        ctx.closePath();   
    }
    
    toDxfString() {
       //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
       let s = `0\nLINE\n`;
       s += `8\nL${this.getId()}\n`;
       s += `10\n${this.getXRaw('positionEnd')}\n20\n${this.getYRaw('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getXRaw('positionStart')}\n21\n${this.getYRaw('positionStart') * -1}\n31\n0\n`;
       return s;
    }
};

class RamaniSelection extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            positionStart: null,
            positionEnd: null,
            length: 0,
            hover: {
                all: false
            },
            mode: {
                'hover': true,
                'selected': true,
                'multiSelect': false
            },
            currentActionPoint: 'positionEnd'
        }, opts || {}));
    }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    _paintObject(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.storage.color.lineNormal;
        ctx.lineWidth = this.storage.defaultLineWidth;
        ctx.setLineDash([6,3]);
        ctx.strokeRect(this.getX('positionStart'), this.getY('positionStart'), this.getX('positionEnd') - this.getX('positionStart'), this.getY('positionEnd') - this.getY('positionStart'));
        ctx.closePath();
    }
    
    animate(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;        
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }

        this._paintObject(ctx);
    }
    
    paint(ctx) {
    }
};
class RamaniTuggerStopPoint extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,    
            currentActionPoint: 'move',
            customName: 'H',
            shapeStyle: 'arc'
        }, opts || {}));
        
        this.userKeys = this.storage.userKeys || {};
        this.customKeys['colorConnection'] = { set: function(c) { this.storage.color.connection = c; }.bind(this), get: function(c) { return this.storage.color.connection; }.bind(this) };

        this.storage.positionStart = this._roundPoint(this.storage.positionStart, true);

        if(this.storage.positionEnd == null) {
            this.storage.positionEnd = JSON.parse(JSON.stringify(this.storage.positionStart));

            this.storage.positionStart.x -= this.storage.helperSharedData.getGridSize();
            this.storage.positionStart.y += this.storage.helperSharedData.getGridSize();
            this.storage.positionEnd.x += this.storage.helperSharedData.getGridSize();
            this.storage.positionEnd.y -= this.storage.helperSharedData.getGridSize();
        }
    }
    
    onClick() {
        if(this.storage.locked == true) { 
            this.storage.currentActionPoint = null;
            return; 
        }

        this.storage.currentActionPoint = 'move';
    }
    
    changeParameter(name, value) {
        var r = super.changeParameter(name, value);
        if((name+'').indexOf('userKeys.') > -1) {
            var t = name.split('.');
            this.userKeys[t[1]] = value;
            return true;
        } else if((name+'').indexOf('userKeys') > -1) {
            this.userKeys = value;
            return true;
        }
        return r;
    }
    
    getParams() {
        var p = super.getParams();
        p.userKeys = this.userKeys;
        return p;
    }
    
    toJSON() {
        var p = super.toJSON();
        p.userKeys = this.userKeys;
        return p;
    }
        
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        return Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x) > 5;
    }
    
    _paintObject(ctx) {
        if(!this.isValid()) { return; }
        
        var p = {
            x: this.getX('positionStart') + ((this.getX('positionEnd') - this.getX('positionStart')) / 2),
            y: this.getY('positionStart') + ((this.getY('positionEnd') - this.getY('positionStart')) / 2)
        };
        ctx.beginPath();
        if(this.storage.shapeStyle == 'rect') {
            ctx.fillRect(this.getX('positionStart'), this.getY('positionStart'), this.getX('positionEnd') - this.getX('positionStart'), this.getY('positionEnd') - this.getY('positionStart'));
            ctx.rect(this.getX('positionStart'), this.getY('positionStart'), this.getX('positionEnd') - this.getX('positionStart'), this.getY('positionEnd') - this.getY('positionStart'));
        } else if(this.storage.shapeStyle == 'arc') {
            ctx.arc(
                p.x, 
                p.y, 
                this._getGridSize(),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.stroke();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.fillStyle = this.storage.mode['selected'] ? this.storage.color.lineSelected : this.storage.color.lineHover;
        ctx.lineWidth = this.storage.mode['selected'] ? this.storage.selectedLineWidth : this.storage.defaultLineWidth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = (12 - this.storage.zoomAndMove.zoomed(14)) + 'px Arial';
        ctx.fillText(this.storage.customName, 
            this.getX('positionStart') + ((this.getX('positionEnd') - this.getX('positionStart')) / 2), 
            Math.min(this.getY('positionStart'),this.getY('positionEnd')) - 10
        );  
        ctx.fill();
        ctx.closePath();
    }
    
    _colorByMode(selected,normal,hover) {
        var c = this.storage.color[normal];
        if(this.storage.mode['selected']) {
            c = this.storage.color[selected];
        } else if(this.storage.mode['hover']) {
            c = this.storage.color[hover];
        }
        return c;
    }

    animate(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;
        
    //    if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }        
        
        ctx.beginPath();
        ctx.strokeStyle = this._colorByMode('lineSelected','lineNormal','lineHover');
        ctx.fillStyle = this._colorByMode('lineSelected','fillNormal','lineHover');
        ctx.lineWidth = this.storage.mode['selected'] ? this.storage.selectedLineWidth : this.storage.defaultLineWidth;

        this._paintObject(ctx);
        
        ctx.closePath();
    }
    
    paint(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;        
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.beginPath();
        ctx.strokeStyle = this.storage.color.lineNormal;
        ctx.fillStyle = this.storage.color.fillNormal;
        ctx.lineWidth = this.storage.defaultLineWidth;

        this._paintObject(ctx);

        ctx.closePath();
    }
    
    paintHitMap(ctx) {
        if(this.storage.visible != true) return;
        if(this.storage.selectable != true) return;
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.arcSize;
        ctx.fillStyle = this.getHitMapColor();
        ctx.strokeStyle = this.getHitMapColor();
        this._paintObject(ctx); 
    }
    
    setStartPoint() {
        super.setStartPoint();
        var point = this.storage.zoomAndMove.getMousePosition();
        this.storage.positionEnd = this._roundPoint({
            x: point.x + this.storage.size,
            y: point.y + this.storage.size
        }, true);
    }

    toDxfString() {
       //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
       let s = `0\nLINE\n`; // \
       s += `8\nS_r1_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // /
       s += `8\nS_r2_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // |-
       s += `8\nS_r3_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionStart')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // _
       s += `8\nS_r4_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;

       s += `0\nLINE\n`; // -|
       s += `8\nS_r5_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionEnd')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // -
       s += `8\nS_r6_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionEnd')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionStart')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;

       return s;
    }
};

class RamaniStopPoint extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,    
            isTuggerStopPoint: false,
            currentActionPoint: 'positionEnd'
        }, opts || {}));
        
        this.customKeys['colorConnection'] = { set: function(c) { this.storage.color.connection = c; }.bind(this), get: function(c) { return this.storage.color.connection; }.bind(this) };
        this.publicKeys.isTuggerStopPoint = function(c) { return c; };
        this.userKeys = this.storage.userKeys || {};
    }
    
    changeParameter(name, value) {
        var r = super.changeParameter(name, value);
        if((name+'').indexOf('userKeys.') > -1) {
            var t = name.split('.');
            this.userKeys[t[1]] = value;
            return true;
        } else if((name+'').indexOf('userKeys') > -1) {
            this.userKeys = value;
            return true;
        }
        return r;
    }
    
    getParams() {
        var p = super.getParams();
        p.userKeys = this.userKeys;
        return p;
    }
    
    toJSON() {
        var p = super.toJSON();
        p.userKeys = this.userKeys;
        return p;
    }
        
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        return Math.abs(this.storage.positionStart.x - this.storage.positionEnd.x) > 5;
    }
    
    _paintObject(ctx) {
        if(!this.isValid()) { return; }
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        if(this.storage.isTuggerStopPoint) {
            var maxX = Math.max(this.getX('positionEnd'), this.getX('positionStart'));
            var minX = Math.min(this.getX('positionEnd'), this.getX('positionStart'));
            var minY = Math.min(this.getY('positionEnd'), this.getY('positionStart'));
            var maxY = Math.max(this.getY('positionEnd'), this.getY('positionStart'));
            ctx.lineTo(minX + ((maxX - minX) / 2), minY);
            ctx.lineTo(this.getX('positionEnd'), maxY);
        } else {
            ctx.fillRect(this.getX('positionStart'), this.getY('positionStart'), this.getX('positionEnd') - this.getX('positionStart'), this.getY('positionEnd') - this.getY('positionStart'));
            ctx.rect(this.getX('positionStart'), this.getY('positionStart'), this.getX('positionEnd') - this.getX('positionStart'), this.getY('positionEnd') - this.getY('positionStart'));
        }
        ctx.stroke();
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = this.storage.mode['selected'] ? this.storage.color.lineSelected : this.storage.color.lineHover;
        ctx.lineWidth = this.storage.mode['selected'] ? this.storage.selectedLineWidth : this.storage.defaultLineWidth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = (12 - this.storage.zoomAndMove.zoomed(14)) + 'px Arial';
        ctx.fillText(this.storage.customName, 
            this.getX('positionStart') + ((this.getX('positionEnd') - this.getX('positionStart')) / 2), 
            this.getY('positionStart') + ((this.getY('positionEnd') - this.getY('positionStart')) / 2)
        );  
        ctx.fill();
        ctx.closePath();
    }

    animate(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;
        
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }        
        
        ctx.beginPath();
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
        ctx.strokeStyle = this.storage.mode['selected'] ?this.storage.color.lineSelected : this.storage.color.lineHover;
        ctx.fillStyle = this.storage.color.fillNormal;
        this._paintObject(ctx);
        ctx.closePath();
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.lineWidth = this.storage.selectedLineWidth;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
                this.renderPointHandle(ctx, 'positionStart');
            }
            if(this.storage.positionEnd != null) {
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    paint(ctx) {
        if(!this.isValid()) { return; }
        if(this.storage.visible != true) return;        
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.beginPath();
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
        ctx.strokeStyle = this.storage.color.lineNormal;
        ctx.fillStyle = this.storage.color.fillNormal;
        this._paintObject(ctx);
        ctx.closePath();
    }
    
    paintHitMap(ctx) {
        if(this.storage.visible != true) return;
        if(this.storage.selectable != true) return;    
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.getArcSize();
        ctx.fillStyle = this.getHitMapColor();
        this._paintObject(ctx); 
        
        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.fillStyle = this.getHitMapColor();
            this.renderPointHandle(ctx, 'positionStart', true);
            this.renderPointHandle(ctx, 'positionEnd', true);
            ctx.fill();
            ctx.closePath();  
        }      
    }
    
    setStartPoint() {
        super.setStartPoint();
        var point = this.storage.zoomAndMove.getMousePosition();
        this.storage.positionEnd = this._roundPoint({
            x: point.x + this.storage.size,
            y: point.y + this.storage.size
        }, true);
    }
    
    toDxfString() {
       //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
       let s = `0\nLINE\n`; // \
       s += `8\nS_r1_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // /
       s += `8\nS_r2_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // |-
       s += `8\nS_r3_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionStart')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // _
       s += `8\nS_r4_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionStart')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionEnd') * -1}\n31\n0\n`;

       s += `0\nLINE\n`; // -|
       s += `8\nS_r5_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionEnd')}\n20\n${this.getY('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionEnd')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;
       
       s += `0\nLINE\n`; // -
       s += `8\nS_r6_${this.getX('positionStart')}${this.getY('positionStart')}\n`;
       s += `10\n${this.getX('positionEnd')}\n20\n${this.getY('positionStart') * -1}\n30\n0\n`;
       s += `11\n${this.getX('positionStart')}\n21\n${this.getY('positionStart') * -1}\n31\n0\n`;

       return s;
    }
};

class RamaniWall extends RamaniObject{
    constructor(opts) {
        super(Object.assign({
            arcSize: 20,
            positionStart: null,
            positionEnd: null,
            length: 0,
            hover: {
                all: false
            },
            mode: {
                'hover': true,
                'selected': true,
                'multiSelect': false
            },
            currentActionPoint: 'positionEnd',
            displayLength: true
        }, opts || {}));
        
        this.publicValues.length = 'length';
        this.publicKeys.displayLength = function(c) { return c === true ; };
        
        this.updateLength();
    }
    
    isValid() {
        if(this.storage.positionStart == null) return false;
        if(this.storage.positionEnd == null) return false;
        if(this.storage.positionStart.x == null || this.storage.positionStart.y == null) return false;
        if(this.storage.positionEnd.x == null || this.storage.positionEnd.y == null) return false;
        if(Math.abs(this.storage.positionEnd.x - this.storage.positionStart.x) < 5 && Math.abs(this.storage.positionEnd.y - this.storage.positionStart.y) < 5) return false;
        return true;
    }
    
    _paintObject(ctx) {
        ctx.setLineDash([]);
        ctx.moveTo(this.getX('positionStart'), this.getY('positionStart'));
        ctx.lineTo(this.getX('positionEnd'), this.getY('positionEnd'));
    }
    
    animate(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;
        if(!this.storage.mode['selected'] && !this.storage.mode['hover']) { return; }

        if(this.storage.mode['selected']) {
            ctx.beginPath();
            ctx.lineJoin = 'miter'; 
            ctx.lineWidth = this.storage.defaultLineWidth;
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            if(this.storage.positionStart != null) {
                this.renderPointHandle(ctx, 'positionStart');
            }
            if(this.storage.positionEnd != null) {
                this.renderPointHandle(ctx, 'positionEnd');
            }
            ctx.stroke();
            ctx.closePath();
            
            ctx.beginPath();
            ctx.lineWidth = this.storage.selectedLineWidth;
            ctx.strokeStyle = this.storage.color.lineSelected;
            ctx.setLineDash([this.storage.zoomAndMove.zoomed(5), this.storage.zoomAndMove.zoomed(3)]);
            
            this._paintObject(ctx);
            
            if(this.storage.displayLength == true) {
                this._printLength(ctx);
            }
            
            ctx.stroke();
            ctx.closePath();
        }
        
        if(this.storage.mode['hover']) {
            ctx.beginPath();
            ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
            ctx.strokeStyle = this.storage.color.lineHover;
            this._paintObject(ctx);
            
            if(this.storage.displayLength == true) {
                this._printLength(ctx);
            }
            
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    move() {
        if(this.storage.locked == true) { 
            return; 
        }
        super.move();
        this.updateLength();
    }
    
    paint(ctx) {
        if(!this.isValid()) return;
        if(this.storage.visible != true) return;
        if(this.storage.mode['selected']) { return; }
        if(this.storage.mode['hover']) { return; }
        
        ctx.beginPath();
        ctx.lineJoin = 'miter'; 
        ctx.lineWidth = this.storage.defaultLineWidth; //this.storage.zoomAndMove.zoomed(3);
        ctx.strokeStyle = this.storage.color.lineNormal;
        this._paintObject(ctx);
        
        if(this.storage.displayLength == true) {
            this._printLength(ctx);
        }
        
        ctx.stroke(); 
        ctx.closePath();        
    }
    
    toDxfString() {
       //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
       let s = `0\nLINE\n`;
       s += `8\nL${this.getId()}\n`;
       s += `10\n${this.getXRaw('positionEnd')}\n20\n${this.getYRaw('positionEnd') * -1}\n30\n0\n`;
       s += `11\n${this.getXRaw('positionStart')}\n21\n${this.getYRaw('positionStart') * -1}\n31\n0\n`;
       return s;
    }
};
