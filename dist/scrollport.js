/* Scrollport.js 1.0.0 — Plugin for something more interesting then usual scroll to. Author: Sergey Dmitriev (serdmi.com). Licensed MIT. */
(function() {
  (function($) {
    var Scrollport, ScrollportLink;
    Scrollport = (function() {
      Scrollport.defaults = {
        mode: 'usual',
        interrupt: null,
        interrupt_user: true,
        interrupt_scrollport: true,
        container: $(window),
        delta: {
          top: 0,
          left: 0
        },
        on_start: null,
        on_stop: null,
        on_interrupt: null,
        on_finish: null
      };

      function Scrollport($container, a, b, c) {
        var args, container_offset, init_options;
        args = this._normalize_args($container, a, b, c);
        this.$container = args.$container;
        this.target = args.target;
        init_options = args.init_options;
        this._is_window = !this.$container[0].nodeName || $.inArray(this.$container[0].nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) !== -1;
        if (this._is_window) {
          this.$container = $(this.$container[0].contentWindow || window);
          init_options.container = this.$container;
        }
        if (this.$container.is($(window))) {
          this._$container_for_scroll = $('body, html');
        } else {
          this._$container_for_scroll = this.$container;
        }
        init_options = this._normalize_options(init_options);
        this.options = $.extend(true, {}, this.constructor.defaults, init_options);
        this.options = this._normalize_mode_options(this.options);
        if (this.target == null) {
          $.extend(true, this.constructor.defaults, init_options);
          this._set_status('cancel');
          return this;
        }
        if (this._is_in_motion()) {
          if (this.constructor.last_scrollport.options.interrupt_scrollport) {
            this.constructor.last_scrollport.stop('interrupt');
          } else {
            this._set_status('cancel');
            return this;
          }
        }
        this.final_position = this._get_final_position(this.target);
        if (this.final_position.top_distance + this.final_position.left_distance === 0) {
          this._set_status('cancel');
          return this;
        }
        container_offset = this._$container_for_scroll.offset();
        this.scroll_position = {
          top: this.$container.scrollTop(),
          left: this.$container.scrollLeft()
        };
        this.constructor.last_scrollport = this;
        return this._do_scroll(this.final_position);
      }

      Scrollport.prototype._normalize_args = function($container, a, b, c) {
        var init_options, target;
        init_options = {};
        target = null;
        if (c != null) {
          init_options = c;
          target = {
            top: parseFloat(a),
            left: parseFloat(b)
          };
        } else if (b != null) {
          if (!isNaN(parseFloat(b)) && isFinite(b)) {
            target = {
              top: parseFloat(a),
              left: parseFloat(b)
            };
          } else {
            init_options = b;
            if (!isNaN(parseFloat(a)) && isFinite(a)) {
              target = {
                top: parseFloat(a)
              };
            } else {
              target = a;
            }
          }
        } else if (a != null) {
          if (!isNaN(parseFloat(a)) && isFinite(a)) {
            target = {
              top: parseFloat(a)
            };
          } else if ((typeof a === 'object') && !(a instanceof jQuery)) {
            init_options = a;
          } else {
            target = a;
          }
        }
        if ($container == null) {
          if (init_options.container != null) {
            $container = init_options.container;
          } else {
            $container = $(window);
          }
        }
        init_options.container = $container;
        return {
          $container: $container,
          target: target,
          init_options: init_options
        };
      };

      Scrollport.last_scrollport = false;

      Scrollport.prototype.status = 'init';

      Scrollport.prototype._is_window = function(el) {
        return !el.nodeName || $.inArray(el.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) !== -1;
      };

      Scrollport.prototype._get_final_position = function(target) {
        var $target, container_height, container_left, container_offset, container_scroll_height, container_scroll_width, container_top, container_width, left, left_distance, scroll_left, scroll_top, target_left, target_offset, target_top, top, top_distance;
        scroll_top = this.$container.scrollTop();
        scroll_left = this.$container.scrollLeft();
        if (!(target instanceof jQuery) && !(typeof target === 'object')) {
          $target = $(target);
        } else if (target instanceof jQuery) {
          $target = target;
        }
        container_offset = this._$container_for_scroll.offset();
        container_top = container_offset.top;
        container_left = container_offset.left;
        container_scroll_height = this._$container_for_scroll[0].scrollHeight;
        container_scroll_width = this._$container_for_scroll[0].scrollWidth;
        container_height = this.$container.innerHeight();
        container_width = this.$container.innerWidth();
        if ($target != null) {
          target_offset = $target.offset();
          target_top = target_offset.top - this.options.delta.top;
          target_left = target_offset.left - this.options.delta.left;
        } else {
          if (target.top != null) {
            target_top = target.top - this.options.delta.top;
          } else {
            target_top = scroll_top;
          }
          if (target.left != null) {
            target_left = target.left - this.options.delta.left;
          } else {
            target_left = scroll_left;
          }
        }
        if (container_scroll_width <= container_width) {
          left = 0;
          left_distance = 0;
        } else {
          left = target_left + (!this._is_window ? scroll_left : 0) - container_left;
          if (left > container_scroll_width - container_width) {
            left = container_scroll_width - container_width;
          }
          left_distance = left - scroll_left;
        }
        if (container_scroll_height <= container_height) {
          top = 0;
          top_distance = 0;
        } else {
          top = target_top + (!this._is_window ? scroll_top : 0) - container_top;
          if (top > container_scroll_height - container_height) {
            top = container_scroll_height - container_height;
          }
          top_distance = top - scroll_top;
        }
        return {
          top: top,
          left: left,
          top_distance: top_distance,
          left_distance: left_distance
        };
      };

      Scrollport.prototype._get_distance_betwin_points = function(x1, y1, x2, y2) {
        var x_distance, y_distance;
        y_distance = y2 - y1;
        x_distance = x2 - x1;
        return Math.sqrt(y_distance * y_distance + x_distance * x_distance);
      };

      Scrollport.prototype._get_point_betwin_points = function(x1, y1, x2, y2, distance) {
        var full_distance, k, x_distance, y_distance;
        y_distance = y2 - y1;
        x_distance = x2 - x1;
        full_distance = Math.sqrt(y_distance * y_distance + x_distance * x_distance);
        if (distance < 0) {
          distance = full_distance + distance;
        }
        k = distance / full_distance;
        return {
          left: x1 + x_distance * k,
          top: y1 + y_distance * k
        };
      };

      Scrollport.prototype._modes = {
        usual: {
          defaults: {
            easing: 'swing',
            duration: 700
          },
          do_scroll: function(scrollport_api, final_position) {
            return scrollport_api._$container_for_scroll.stop(true).animate({
              scrollTop: final_position.top,
              scrollLeft: final_position.left
            }, scrollport_api.options.duration, scrollport_api.options.easing, function() {
              if (!scrollport_api._$container_for_scroll.last().is(this)) {
                return;
              }
              return scrollport_api.stop('finish');
            });
          },
          stop_scroll: function(scrollport_api, status) {
            scrollport_api._$container_for_scroll.stop(true);
            scrollport_api._set_status(status);
            return scrollport_api._call_end_callbacks();
          }
        },
        roll: {
          defaults: {
            easing: 'swing',
            speed: 2500,
            max_duration: 700,
            min_duration: 300
          },
          do_scroll: function(scrollport_api, final_position) {
            var distance, duration;
            distance = Math.sqrt(final_position.top_distance * final_position.top_distance + final_position.left_distance * final_position.left_distance);
            duration = distance / scrollport_api.options.speed * 1000;
            if (scrollport_api.options.max_duration && duration < scrollport_api.options.min_duration) {
              duration = scrollport_api.options.min_duration;
            }
            if (scrollport_api.options.min_duration && duration > scrollport_api.options.max_duration) {
              duration = scrollport_api.options.max_duration;
            }
            scrollport_api._$container_for_scroll.stop(true).animate({
              scrollTop: final_position.top,
              scrollLeft: final_position.left
            }, duration, scrollport_api.options.easing, function() {
              if (!scrollport_api._$container_for_scroll.last().is(this)) {
                return;
              }
              return scrollport_api.stop('finish');
            });
            return scrollport_api;
          },
          stop_scroll: function(scrollport_api, status) {
            scrollport_api._$container_for_scroll.stop(true);
            scrollport_api._set_status(status);
            return scrollport_api._call_end_callbacks();
          }
        },
        hard: {
          defaults: {
            easing: 'swing',
            distance: 5,
            duration: 100
          },
          do_scroll: function(scrollport_api, final_position) {
            var hard_point;
            hard_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, -scrollport_api.options.distance);
            scrollport_api._$container_for_scroll.scrollTop(hard_point.top).scrollLeft(hard_point.left);
            scrollport_api._$container_for_scroll.stop(true).animate({
              scrollTop: final_position.top,
              scrollLeft: final_position.left
            }, scrollport_api.options.duration, scrollport_api.options.easing, function() {
              if (!scrollport_api._$container_for_scroll.last().is(this)) {
                return;
              }
              return scrollport_api.stop('finish');
            });
            return scrollport_api;
          },
          stop_scroll: function(scrollport_api, status) {
            scrollport_api._$container_for_scroll.stop(true);
            scrollport_api._set_status(status);
            return scrollport_api._call_end_callbacks();
          }
        },
        soft: {
          defaults: {
            easing: null,
            easing_before: 'swing',
            easing_after: 'swing',
            distance: null,
            distance_before: 200,
            distance_after: 200,
            duration: null,
            duration_before: 200,
            duration_after: 400,
            speed: null,
            waiting: 100
          },
          do_scroll: function(scrollport_api, final_position) {
            var $overlay, after_point, before_point, distance;
            distance = Math.sqrt(final_position.top_distance * final_position.top_distance + final_position.left_distance * final_position.left_distance);
            if (distance < (scrollport_api.options.distance_before + scrollport_api.options.distance_before) * 1.5) {
              if (scrollport_api.target.top != null) {
                if (scrollport_api.target.left != null) {
                  return new Scrollport(scrollport_api.$container, scrollport_api.target.top, scrollport_api.target.left, $.extend(true, {}, scrollport_api.options, {
                    mode: 'roll',
                    speed: scrollport_api.options.speed
                  }));
                } else {
                  return new Scrollport(scrollport_api.$container, scrollport_api.target.top, $.extend(true, {}, scrollport_api.options, {
                    mode: 'roll',
                    speed: scrollport_api.options.speed
                  }));
                }
              } else {
                return new Scrollport(scrollport_api.$container, scrollport_api.target, $.extend(true, {}, scrollport_api.options, {
                  mode: 'roll',
                  speed: scrollport_api.options.speed
                }));
              }
            }
            before_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, scrollport_api.options.distance_before);
            after_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, -scrollport_api.options.distance_after);
            $overlay = scrollport_api._get_or_create_overlay();
            $overlay.stop(true).show().animate({
              opacity: 1
            }, scrollport_api.options.duration_before);
            scrollport_api._$container_for_scroll.stop(true).animate({
              scrollTop: before_point.top,
              scrollLeft: before_point.left
            }, scrollport_api.options.duration_before, scrollport_api.options.easing_before, function() {
              if (!scrollport_api._$container_for_scroll.last().is(this)) {
                return;
              }
              scrollport_api._$container_for_scroll.scrollTop(after_point.top).scrollLeft(after_point.left);
              return $overlay.animate({
                opacity: 1
              }, scrollport_api.options.waiting, function() {
                $overlay.stop(true).animate({
                  opacity: 0
                }, scrollport_api.options.duration_after, function() {
                  return $overlay.hide();
                });
                return scrollport_api._$container_for_scroll.stop(true).animate({
                  scrollTop: final_position.top,
                  scrollLeft: final_position.left
                }, scrollport_api.options.duration_after, scrollport_api.options.easing_after, function() {
                  if (!scrollport_api._$container_for_scroll.last().is(this)) {
                    return;
                  }
                  return scrollport_api.stop('finish');
                });
              });
            });
            return scrollport_api;
          },
          stop_scroll: function(scrollport_api, status) {
            var $overlay, duration, opacity;
            $overlay = scrollport_api._get_or_create_overlay();
            if ($overlay.css('display') === 'none') {
              scrollport_api._set_status(status);
              scrollport_api._call_end_callbacks();
              return;
            }
            opacity = parseFloat($overlay.css('opacity'));
            duration = scrollport_api.options.duration_after * opacity;
            scrollport_api._$container_for_scroll.stop(true);
            scrollport_api._set_status(status);
            scrollport_api._call_end_callbacks();
            return $overlay.stop(true).animate({
              opacity: 0
            }, duration, function() {
              return $overlay.hide();
            });
          }
        }
      };

      Scrollport.prototype.stop = function(status) {
        this._modes[this.options.mode].stop_scroll(this, status);
        return this._$container_for_scroll.off('mousewheel.scrollport DOMMouseScroll.scrollport');
      };

      Scrollport.prototype._do_scroll = function(final_position) {
        var scrollport_api;
        scrollport_api = this;
        this._$container_for_scroll.on('mousewheel.scrollport DOMMouseScroll.scrollport', function(e) {
          if (scrollport_api.options.interrupt_user) {
            scrollport_api._$container_for_scroll.off('mousewheel.scrollport DOMMouseScroll.scrollport');
            return scrollport_api.stop('interrupt');
          } else {
            return e.preventDefault();
          }
        });
        this._set_status('motion');
        if (this.options.on_start != null) {
          this.options.on_start.call(this._$container_for_scroll, this);
        }
        return this._modes[this.options.mode].do_scroll(this, final_position);
      };

      Scrollport.prototype._set_status = function(status) {
        return this.status = status;
      };

      Scrollport.prototype._is_in_motion = function() {
        return !!this.constructor.last_scrollport && (this.constructor.last_scrollport.status === 'motion');
      };

      Scrollport.prototype._call_end_callbacks = function() {
        if (this.options.on_stop != null) {
          this.options.on_stop.call(this._$container_for_scroll, this);
        }
        if ((this.options.on_finish != null) && this.status === 'finish') {
          this.options.on_finish.call(this._$container_for_scroll, this);
        }
        if ((this.options.on_interrupt != null) && this.status === 'interrupt') {
          return this.options.on_interrupt.call(this._$container_for_scroll, this);
        }
      };

      Scrollport.prototype._get_or_create_overlay = function() {
        if ((this.constructor._$overlay != null) && $('.scrollport-overlay').length) {
          return this.constructor._$overlay.css({
            width: this._$container_for_scroll[0].scrollWidth,
            height: this._$container_for_scroll[0].scrollHeight
          });
        }
        this.constructor._$overlay = $('<div>').attr('class', 'scrollport-overlay').hide().appendTo(this._$container_for_scroll.first()).css({
          backgroundColor: '#ffffff',
          width: this._$container_for_scroll[0].scrollWidth,
          height: this._$container_for_scroll[0].scrollHeight,
          top: '0',
          left: '0',
          position: 'absolute',
          opacity: 0
        });
        return this.constructor._$overlay;
      };

      Scrollport.prototype._normalize_options = function(options) {
        if (options.delta != null) {
          if (typeof options.delta === 'object') {
            if (options.delta.top != null) {
              options.delta.top = parseFloat(options.delta.top);
            } else {
              options.delta.top = 0;
            }
            if (options.delta.left != null) {
              options.delta.left = parseFloat(options.delta.left);
            } else {
              options.delta.left = 0;
            }
          } else {
            options.delta = {
              top: options.delta,
              left: 0
            };
          }
        }
        if (options.interrupt != null) {
          options.interrupt_user = options.interrupt;
          options.interrupt_scrollport = options.interrupt;
        }
        return options;
      };

      Scrollport.prototype._normalize_mode_options = function(options) {
        options = $.extend(true, {}, this._modes[this.options.mode].defaults, options);
        if (options.mode === 'soft') {
          if (options.distance != null) {
            options.distance_before = options.distance;
            options.distance_after = options.distance;
          }
          if (options.duration != null) {
            options.duration_before = options.duration;
            options.duration_after = options.duration;
          }
          if (options.easing != null) {
            options.easing_before = options.easing;
            options.easing_after = options.easing;
          }
          if (options.speed == null) {
            options.speed = (options.distance_before + options.distance_after) / (options.duration_before + options.duration_after) * 1000;
          }
        }
        return options;
      };

      return Scrollport;

    })();
    ScrollportLink = (function() {
      function ScrollportLink($link, a, b, c, d) {
        var args, attr_value, attrs, has_target, index, scrollport_link_api, scrollport_options;
        scrollport_link_api = this;
        args = this._normalize_args(a, b, c, d);
        this.$link = $link;
        this.target = args.target;
        this.$container = args.$container;
        scrollport_options = args.scrollport_options;
        if (this.target == null) {
          attrs = ['data-scrollport', 'href', 'data-href'];
          has_target = false;
          index = 0;
          while (!has_target && index < attrs.length) {
            attr_value = this.$link.attr(attrs[index]);
            if ((attr_value != null) && attr_value !== '') {
              has_target = true;
            }
            index++;
          }
          if (!has_target) {
            return;
          }
          this.target = $(attr_value);
        }
        this.$link.on('click', function(e) {
          e.preventDefault();
          if (this.target.top != null) {
            if (this.target.left != null) {
              return new Scrollport(scrollport_link_api.$container, scrollport_link_api.target.top, scrollport_link_api.target.left, scrollport_options);
            } else {
              return new Scrollport(scrollport_link_api.$container, scrollport_link_api.target.top, scrollport_options);
            }
          } else {
            return new Scrollport(scrollport_link_api.$container, scrollport_link_api.target, scrollport_options);
          }
        });
      }

      ScrollportLink.prototype._normalize_args = function(a, b, c, d) {
        var $container, scrollport_options, target;
        $container = null;
        scrollport_options = {};
        target = null;
        if (d != null) {
          scrollport_options = d;
          $container = c;
          target = {
            top: a,
            left: b
          };
        } else if (c != null) {
          if (c instanceof jQuery) {
            $container = c;
            target = {
              top: a,
              left: b
            };
          } else {
            scrollport_options = c;
            if (b instanceof jQuery) {
              $container = b;
              if (!isNaN(parseFloat(a)) && isFinite(a)) {
                target = {
                  top: a
                };
              } else {
                target = a;
              }
            } else {
              target = {
                top: a,
                left: b
              };
            }
          }
        } else if (b != null) {
          if (!isNaN(parseFloat(b)) && isFinite(b)) {
            target = {
              top: a,
              left: b
            };
          } else if (b instanceof jQuery) {
            $container = b;
            if (!isNaN(parseFloat(a)) && isFinite(a)) {
              target = {
                top: a
              };
            } else {
              target = a;
            }
          } else {
            scrollport_options = b;
            if (!isNaN(parseFloat(a)) && isFinite(a)) {
              target = {
                top: a
              };
            } else {
              target = a;
            }
          }
        } else if (a != null) {
          if (!isNaN(parseFloat(a)) && isFinite(a)) {
            target = {
              top: a
            };
          } else if ((typeof a === 'object') && !(a instanceof jQuery)) {
            scrollport_options = a;
          } else {
            target = a;
          }
        }
        return {
          $container: $container,
          target: target,
          scrollport_options: scrollport_options
        };
      };

      return ScrollportLink;

    })();
    $.scrollport = function(a, b, c) {
      return new Scrollport(null, a, b, c);
    };
    $.fn.scrollport = function(a, b, c) {
      new Scrollport(this.first(), a, b, c);
      return this;
    };
    $.fn.scrollport_link = function(a, b, c, d) {
      return this.each(function() {
        return new ScrollportLink($(this), a, b, c, d);
      });
    };
    return $(function() {
      return $('[data-scrollport]').scrollport_link();
    });
  })(jQuery);

}).call(this);
