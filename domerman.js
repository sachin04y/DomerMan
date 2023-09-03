(function () {
	var root = this;

	// Save the previous value of the '_dm' variable.
	var previous_dm = root._dm;
	function _dm(set, ref = false) {
		if (set) {
			if (window === this) {
				return new _dm(set, ref);
			}
			this.node = ('string' == typeof set) ? ((ref) ? (ref.querySelectorAll(set)) : (document.querySelectorAll(set))) : ((undefined === set.length) ? [set] : set);
			return this;
		} else {
			if (window === this) {
				return new _dm(set);
			}
			return this;
		}
	}
	root._dm = _dm;

	_dm.noConflict = function () {
		root._dm = previous_dm;
		return this;
	};
	_dm.prototype = {
		removeClass: function () {
			for (var i = 0; i < this.node.length; i++) {
				for (var j = 0; j < arguments.length; j++) {
					this.node[i].classList.remove(arguments[j]);
				}
			}
			return this;
		},
		addClass: function () {
			for (var i = 0; i < this.node.length; i++) {
				for (var j = 0; j < arguments.length; j++) {
					this.node[i].classList.add(arguments[j]);
				}
			}
			return this;
		},
		prop: function (attr, val) {
			for (var i = 0; i < this.node.length; i++) {
				if (val) {
					this.node[i].setAttribute(attr, val);
				} else {
					return this.node[i].getAttribute(attr);
				}
			}
			return this;
		},
		hasClass: function (c, cb) {
			for (var i = 0; i < this.node.length; i++) {
				if (this.node[i].classList.contains(c)) {
					cb(this.node[i], true);
					return this.node[i];
				} else {
					cb(this.node[i], false);
				}
			};
		},
		forAll: function (cb) {
			for (var i = 0; i < this.node.length; i++) {
				cb(this.node[i], i);
			}
		},
		switchClass: function (c) {
			for (var i = 0; i < this.node.length; i++) {
				if (this.node[i].classList.contains(c)) {
					this.node[i].classList.remove(c);
				} else {
					this.node[i].classList.add(c);
				}
			}
			return this;
		},
		click: function (cb = false) {
			for (var i = 0; i < this.node.length; i++) {
				if (cb && cb instanceof Function) {
					this.node[i].addEventListener('click', function (_evt) { cb.call(this, _evt) });
				} else {
					this.node[i].click();
				}
			}
		},
		parent: function () {
			for (var i = 0; i < this.node.length; i++) {
				this.node[i] = this.node[i].parentElement;
			}
			return this;
		},
		next: function () {
			for (var i = 0; i < this.node.length; i++) {
				(this.node[i].nextElementSibling) && (this.node[i] = this.node[i].nextElementSibling);
			}
			return this;
		},
		prev: function () {
			for (var i = 0; i < this.node.length; i++) {
				(this.node[i].previousElementSibling) && (this.node[i] = this.node[i].previousElementSibling);
			}
			return this;
		},
		where: function (conditions, cb) {
			for (var i = 0; i < this.node.length; i++) {
				try {
					if (eval("this.node[i].getAttribute('" + conditions[0] + "')" + conditions[2] + "'" + conditions[1] + "'")) {
						cb(this.node[i]);
					}
				} catch (e) {
					console.error(e);
				}
			}
			return this;
		},
		walker: function (walkerFunc, depth = 0) {

			for (var i = 0; i < this.node.length; i++) {
				
				//use closure to use 'depth' 0 for every iteration;
				(function (node, depth) {

					(walkerFunc) && (walkerFunc instanceof Function) &&	(walkerFunc(node, depth));

					if (node.hasChildNodes()) {
						depth ++;
						_dm(node.children).forAll((_node) => {
							_dm(_node).walker(walker, depth);
						});
					}
				})(this.node[i], depth);

			}

			return this;
		},
		removeNode: function() {
			for (var i = 0; i < this.node.length; i++) {
				(this.node[i].parentNode) && (this.node[i].parentNode.removeChild(this.node[i]) );
			}
		},
		emptyDomNode: function () {
			for (var i = 0; i < this.node.length; i++) {
				while (this.node[i].children) {
					_dm().removeNode(this.node[i].firstElementChild);
				}
			}
		},
		withKey: function (paramAttr, modifier) {
			__nodes = {}, __preferredKey = '';
			for (var i = 0; i < this.node.length; i++) {
				__preferredKey = _dm(this.node[i]).prop(paramAttr).split(' ').join('-');
				(modifier) && (modifier instanceof Function) && (__preferredKey = modifier(__preferredKey));
				__nodes[__preferredKey] = this.node[i];
			}
			return __nodes;
		},
		whenInViewbox: function (callback = false) {
			if ('IntersectionObserver' in window) {
				
				let config = {
					root: null,
					rootMargin: '500px',
					threshold: 0
				};
				
				if (arguments[1] && typeof arguments[1] === 'object') {
					var prop;
					for (prop in arguments[1]) {
						if (config.hasOwnProperty(prop)) {
							config[prop] = arguments[1][prop];
						}
					}
				}
				let observer = new IntersectionObserver((changes, observer) => {
					changes.forEach(change => {
						if (change.intersectionRatio > 0) {
							if (callback && callback instanceof Function) {
								callback(change.target);
								observer.unobserve(change.target);
							}
						}
					});
				}, config);
				for (i = 0; i < this.node.length; i++) {
					observer.observe(this.node[i]);
				}
			} else {
				// IntersectionObserver NOT Supported
				if (callback && callback instanceof Function) {
					this.node.forEach(node => callback(node));
				}
			}
			return this;
		},
		importModule: function (modUrl = null, type = 'script') {
			if ('' !== modUrl && null !== modUrl && undefined !== modUrl) {
				if ('stylesheet' == type || 'css' == type || 'style' == type) {
					tagName = 'link';
					sourceAttrName = 'href';
					rel = 'stylesheet';
					type = 'text/css';
				}
				if ('js' == type || 'script' == type) {
					tagName = 'script';
					sourceAttrName = 'src';
					rel = '';
					type = 'text/javascript';
				}
				return new Promise(resolve => {
					node = document.createElement(tagName);
					node.setAttribute(sourceAttrName, modUrl);
					node.setAttribute('rel', rel);
					node.setAttribute('type', type);
					document.getElementsByTagName("head")[0].appendChild(node);
					node.onload = function () {
						resolve(true);
					};
				});
			} else {
				console.error('ImportModule expects a link to the module.');
			}
		},
		imgLazify: function () {
			
			var config = {
				className: 'wkio-lazify',  	//means image nodes are passed.
				srcAttr: 'data-src',
				removeClass: 'true',
				afterClass:'wk-lazify-loaded',
				bgImg:false,
			};
			
			if (arguments[0] && typeof arguments[0] === 'object') {
				var prop;
				for (prop in arguments[0]) {
					if (config.hasOwnProperty(prop)) {
						config[prop] = arguments[0][prop];
					}
				}
			}
			
			this.node.forEach(node => {
				src = '';
				allImgs = ('IMG' != node.nodeName && ! config.bgImg) ? (node.querySelectorAll('.' + config.className)) : [node];
				allImgs.forEach((img) => {
					var imgLoad = new Image();
					if (img.getAttribute(config.srcAttr) && '' != img.getAttribute(config.srcAttr)) {
						imgLoad.src = img.getAttribute(config.srcAttr);
						imgLoad.onload = () => {
							if( 'IMG' == img.nodeName ){
								img.src = img.getAttribute(config.srcAttr);
							}
							_dm(img).addClass(config.afterClass);
							('true'== config.removeClass ) && _dm(img).removeClass(config.className);
						}
					}
				});
			});
		},
	}
}).call(this);
