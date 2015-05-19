do ($=jQuery) ->  
  class Scrollport
    @defaults:
      mode: 'usual'
      interrupt: null
      interrupt_user: true
      interrupt_scrollport: true
      container: $(window)
      delta:
        top: 0
        left: 0
      on_start: null
      on_stop: null
      on_interrupt: null
      on_finish: null

    constructor: ($container, a, b, c) ->
      args = @_normalize_args $container, a, b, c
      @$container = args.$container
      @target = args.target
      init_options = args.init_options
      @_is_window = !@$container[0].nodeName || $.inArray(@$container[0].nodeName.toLowerCase(), ['iframe','#document','html','body']) != -1
      if @_is_window
        @$container = $(@$container[0].contentWindow || window)
        init_options.container = @$container
      if @$container.is($(window))
        @_$container_for_scroll = $('body, html')
      else
        @_$container_for_scroll = @$container
      init_options = @_normalize_options(init_options)
      @options = $.extend(true, {}, @constructor.defaults, init_options)
      @options = @_normalize_mode_options(@options)
      if not @target?
        $.extend(true, @constructor.defaults, init_options)
        @_set_status 'cancel'
        return @
      if @_is_in_motion()
        if @constructor.last_scrollport.options.interrupt_scrollport
          @constructor.last_scrollport.stop('interrupt')
        else
          @_set_status 'cancel'
          return @
      @final_position = @_get_final_position(@target)
      if @final_position.top_distance + @final_position.left_distance == 0
        @_set_status 'cancel'
        return @      
      container_offset = @_$container_for_scroll.offset()
      @scroll_position = 
        top: @$container.scrollTop()
        left: @$container.scrollLeft()
      @constructor.last_scrollport = @
      return @_do_scroll @final_position

    _normalize_args: ($container, a, b, c) ->
      init_options = {}
      target = null      
      if c?
        init_options = c
        target = 
          top: parseFloat(a)
          left: parseFloat(b)
      else if b?        
        if !isNaN(parseFloat(b)) and isFinite(b)
          target =
            top: parseFloat(a)
            left: parseFloat(b)
        else
          init_options = b
          if !isNaN(parseFloat(a)) and isFinite(a)
            target =
              top: parseFloat(a)
          else
            target = a
      else if a?
        if !isNaN(parseFloat(a)) and isFinite(a)
          target =
            top: parseFloat(a)
        else if (typeof a == 'object') and not (a instanceof jQuery)
          init_options = a
        else
          target = a
      if not $container?
        if init_options.container?
          $container = init_options.container
        else
          $container = $(window)
      init_options.container = $container
      return {} =
        $container: $container
        target: target
        init_options: init_options

    @last_scrollport: false

    status: 'init'

    _is_window: (el) ->
      return !el.nodeName || $.inArray(el.nodeName.toLowerCase(), ['iframe','#document','html','body']) != -1

    _get_final_position: (target) ->
      scroll_top = @$container.scrollTop()
      scroll_left = @$container.scrollLeft()
      if not (target instanceof jQuery) and not (typeof target == 'object')
        $target = $(target)
      else if (target instanceof jQuery)
        $target = target
      container_offset = @_$container_for_scroll.offset()
      container_top = container_offset.top
      container_left = container_offset.left      
      container_scroll_height = @_$container_for_scroll[0].scrollHeight
      container_scroll_width = @_$container_for_scroll[0].scrollWidth
      container_height = @$container.innerHeight()
      container_width = @$container.innerWidth()
      if $target?
        target_offset = $target.offset()
        target_top = target_offset.top - @options.delta.top
        target_left = target_offset.left - @options.delta.left
      else
        if target.top?
          target_top = target.top - @options.delta.top
        else
          target_top = scroll_top
        if target.left?
          target_left = target.left - @options.delta.left
        else
          target_left = scroll_left
      if container_scroll_width <= container_width
        left = 0
        left_distance = 0
      else
        left = target_left + (if not @_is_window then scroll_left else 0) - container_left
        if left > container_scroll_width - container_width
          left = container_scroll_width - container_width
        left_distance = left - scroll_left
      if container_scroll_height <= container_height
        top = 0
        top_distance = 0
      else
        top = target_top + (if not @_is_window then scroll_top else 0) - container_top
        if top > container_scroll_height - container_height
          top = container_scroll_height - container_height
        top_distance = top - scroll_top
      return {} =
        top: top
        left: left
        top_distance: top_distance
        left_distance: left_distance

    _get_distance_betwin_points: (x1, y1, x2, y2) ->
      y_distance = (y2 - y1)
      x_distance = (x2 - x1)
      return Math.sqrt(y_distance * y_distance + x_distance * x_distance)

    _get_point_betwin_points: (x1, y1, x2, y2, distance) ->
      y_distance = (y2 - y1)
      x_distance = (x2 - x1)

      full_distance = Math.sqrt(y_distance * y_distance + x_distance * x_distance)
      if distance < 0
        distance = full_distance + distance
      k = distance / full_distance
      return {} =
        left: x1 + x_distance * k
        top: y1 + y_distance * k

    _modes:
      usual:
        defaults:
          easing: 'swing'
          duration: 700

        do_scroll: (scrollport_api, final_position) ->
          scrollport_api._$container_for_scroll.stop(true).animate {scrollTop: final_position.top, scrollLeft: final_position.left}, scrollport_api.options.duration, scrollport_api.options.easing, ->
            if not scrollport_api._$container_for_scroll.last().is @
              return
            scrollport_api.stop('finish')

        stop_scroll: (scrollport_api, status) ->
          scrollport_api._$container_for_scroll.stop(true)
          scrollport_api._set_status status
          scrollport_api._call_end_callbacks()

      roll:
        defaults:
          easing: 'swing'
          speed: 2500
          max_duration: 700
          min_duration: 300

        do_scroll: (scrollport_api, final_position) ->
          distance = Math.sqrt(final_position.top_distance * final_position.top_distance + final_position.left_distance * final_position.left_distance)
          duration = distance / scrollport_api.options.speed * 1000
          if scrollport_api.options.max_duration and duration < scrollport_api.options.min_duration
            duration = scrollport_api.options.min_duration
          if scrollport_api.options.min_duration and duration > scrollport_api.options.max_duration
            duration = scrollport_api.options.max_duration
          scrollport_api._$container_for_scroll.stop(true).animate {scrollTop: final_position.top, scrollLeft: final_position.left}, duration, scrollport_api.options.easing, ->
            if not scrollport_api._$container_for_scroll.last().is @
              return
            scrollport_api.stop('finish')
          return scrollport_api

        stop_scroll: (scrollport_api, status) ->   
          scrollport_api._$container_for_scroll.stop(true)
          scrollport_api._set_status status
          scrollport_api._call_end_callbacks()

      hard:
        defaults:
          easing: 'swing'        
          distance: 5
          duration: 100

        do_scroll: (scrollport_api, final_position) ->   
          hard_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, - scrollport_api.options.distance)
          scrollport_api._$container_for_scroll.scrollTop(hard_point.top).scrollLeft(hard_point.left)
          scrollport_api._$container_for_scroll.stop(true).animate {scrollTop: final_position.top, scrollLeft: final_position.left}, scrollport_api.options.duration, scrollport_api.options.easing, ->
            if not scrollport_api._$container_for_scroll.last().is @
              return
            scrollport_api.stop('finish')
          return scrollport_api

        stop_scroll: (scrollport_api, status) ->
          scrollport_api._$container_for_scroll.stop(true)
          scrollport_api._set_status status
          scrollport_api._call_end_callbacks()

      soft:
        defaults:
          easing: null
          easing_before: 'swing'
          easing_after: 'swing'
          distance: null
          distance_before: 200
          distance_after: 200
          duration: null
          duration_before: 200
          duration_after: 400
          speed: null
          waiting: 100

        do_scroll: (scrollport_api, final_position) -> 
          distance = Math.sqrt(final_position.top_distance * final_position.top_distance + final_position.left_distance * final_position.left_distance)
          if distance < (scrollport_api.options.distance_before + scrollport_api.options.distance_before) * 1.5
            if scrollport_api.target.top?
              if scrollport_api.target.left?
                return new Scrollport scrollport_api.$container, scrollport_api.target.top, scrollport_api.target.left, $.extend(true, {}, scrollport_api.options, {mode: 'roll', speed: scrollport_api.options.speed})
              else
                return new Scrollport scrollport_api.$container, scrollport_api.target.top, $.extend(true, {}, scrollport_api.options, {mode: 'roll', speed: scrollport_api.options.speed})
            else
              return new Scrollport scrollport_api.$container, scrollport_api.target, $.extend(true, {}, scrollport_api.options, {mode: 'roll', speed: scrollport_api.options.speed})
          before_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, scrollport_api.options.distance_before)
          after_point = scrollport_api._get_point_betwin_points(scrollport_api.scroll_position.left, scrollport_api.scroll_position.top, final_position.left, final_position.top, - scrollport_api.options.distance_after)
          $overlay = scrollport_api._get_or_create_overlay()
          $overlay.stop(true).show().animate {opacity: 1}, scrollport_api.options.duration_before
          scrollport_api._$container_for_scroll.stop(true).animate {scrollTop: before_point.top, scrollLeft: before_point.left}, scrollport_api.options.duration_before, scrollport_api.options.easing_before, ->
            if not scrollport_api._$container_for_scroll.last().is @
              return
            scrollport_api._$container_for_scroll.scrollTop(after_point.top).scrollLeft(after_point.left)
            $overlay.animate {opacity: 1}, scrollport_api.options.waiting, ->
              $overlay.stop(true).animate {opacity: 0}, scrollport_api.options.duration_after, ->              
                $overlay.hide()
              scrollport_api._$container_for_scroll.stop(true).animate {scrollTop: final_position.top, scrollLeft: final_position.left}, scrollport_api.options.duration_after, scrollport_api.options.easing_after, ->
                if not scrollport_api._$container_for_scroll.last().is @
                  return
                scrollport_api.stop('finish')
          return scrollport_api

        stop_scroll: (scrollport_api, status) ->
          $overlay = scrollport_api._get_or_create_overlay()
          if $overlay.css('display') == 'none'
            scrollport_api._set_status status
            scrollport_api._call_end_callbacks()
            return            
          opacity = parseFloat($overlay.css('opacity'))
          duration = scrollport_api.options.duration_after * opacity
          scrollport_api._$container_for_scroll.stop(true)
          scrollport_api._set_status status
          scrollport_api._call_end_callbacks()            
          $overlay.stop(true).animate {opacity: 0}, duration, ->
            $overlay.hide()            

    stop: (status) ->
      @_modes[@options.mode].stop_scroll(@, status)
      @_$container_for_scroll.off 'mousewheel.scrollport DOMMouseScroll.scrollport'

    _do_scroll: (final_position) ->
      scrollport_api = @      
      @_$container_for_scroll.on 'mousewheel.scrollport DOMMouseScroll.scrollport', (e) ->        
        if scrollport_api.options.interrupt_user
          scrollport_api._$container_for_scroll.off 'mousewheel.scrollport DOMMouseScroll.scrollport'
          scrollport_api.stop('interrupt')
        else
          e.preventDefault()
      @_set_status 'motion'
      @options.on_start.call(@_$container_for_scroll, @) if @options.on_start?
      return @_modes[@options.mode].do_scroll(@, final_position)

    _set_status: (status) ->
      @status = status

    _is_in_motion: ->
      return !!@constructor.last_scrollport and (@constructor.last_scrollport.status == 'motion')

    _call_end_callbacks: ->
      @options.on_stop.call(@_$container_for_scroll, @) if @options.on_stop?
      @options.on_finish.call(@_$container_for_scroll, @) if @options.on_finish? and @status == 'finish'
      @options.on_interrupt.call(@_$container_for_scroll, @) if @options.on_interrupt? and @status == 'interrupt'

    _get_or_create_overlay: ->
      if @constructor._$overlay? and $('.scrollport-overlay').length
        return @constructor._$overlay.css
          width: @_$container_for_scroll[0].scrollWidth
          height: @_$container_for_scroll[0].scrollHeight
      @constructor._$overlay = $('<div>').attr('class', 'scrollport-overlay').hide().appendTo(@_$container_for_scroll.first()).css
        backgroundColor: '#ffffff'
        width: @_$container_for_scroll[0].scrollWidth
        height: @_$container_for_scroll[0].scrollHeight
        top: '0'
        left: '0'
        position: 'absolute'
        opacity: 0
      return @constructor._$overlay

    _normalize_options: (options) ->
      if options.delta?
        if (typeof options.delta == 'object')
          if options.delta.top?
            options.delta.top = parseFloat(options.delta.top)
          else
            options.delta.top = 0
          if options.delta.left?
            options.delta.left = parseFloat(options.delta.left)
          else
            options.delta.left = 0
        else
          options.delta =
            top: options.delta
            left: 0
      if options.interrupt?
        options.interrupt_user = options.interrupt
        options.interrupt_scrollport = options.interrupt
      return options

    _normalize_mode_options: (options) ->
      options = $.extend(true, {}, @_modes[@options.mode].defaults, options)
      if options.mode == 'soft'          
        if options.distance?
          options.distance_before = options.distance
          options.distance_after = options.distance
        if options.duration?
          options.duration_before = options.duration
          options.duration_after = options.duration
        if options.easing?
          options.easing_before = options.easing
          options.easing_after = options.easing
        if not options.speed?
          options.speed = (options.distance_before + options.distance_after) / (options.duration_before + options.duration_after) * 1000
      return options

  class ScrollportLink
    constructor: ($link, a, b, c, d) ->
      scrollport_link_api = @
      args = @_normalize_args a, b, c, d
      @$link = $link
      @target = args.target
      @$container = args.$container
      scrollport_options = args.scrollport_options
      if not @target?
        attrs = ['data-scrollport', 'href', 'data-href']
        has_target = false
        index = 0
        while not has_target and index < attrs.length
          attr_value = @$link.attr attrs[index]
          if attr_value? and attr_value != ''
            has_target = true
          index++
        if not has_target
          return
        @target = $(attr_value)
      @$link.on 'click', (e) ->
        e.preventDefault()
        if @target.top?
          if @target.left?
            new Scrollport(scrollport_link_api.$container, scrollport_link_api.target.top, scrollport_link_api.target.left, scrollport_options)
          else
            new Scrollport(scrollport_link_api.$container, scrollport_link_api.target.top, scrollport_options)
        else
          new Scrollport(scrollport_link_api.$container, scrollport_link_api.target, scrollport_options)

    _normalize_args: (a, b, c, d) ->
      $container = null
      scrollport_options = {}
      target = null
      if d?
        scrollport_options = d
        $container = c
        target = 
          top: a
          left: b
      else if c?
        if c instanceof jQuery
          $container = c
          target = 
            top: a
            left: b
        else
          scrollport_options = c
          if b instanceof jQuery
            $container = b
            if !isNaN(parseFloat(a)) and isFinite(a)
              target = 
                top: a
            else
              target = a
          else
            target =
              top: a
              left: b
      else if b?
        if !isNaN(parseFloat(b)) and isFinite(b)
          target =
            top: a
            left: b
        else if b instanceof jQuery
          $container = b
          if !isNaN(parseFloat(a)) and isFinite(a)
            target = 
              top: a
          else
            target = a
        else
          scrollport_options = b
          if !isNaN(parseFloat(a)) and isFinite(a)
            target = 
              top: a
          else
            target = a
      else if a?
        if !isNaN(parseFloat(a)) and isFinite(a)
          target =
            top: a
        else if (typeof a == 'object') and not (a instanceof jQuery)
          scrollport_options = a
        else
          target = a
      return {} =
        $container: $container
        target: target
        scrollport_options: scrollport_options

  $.scrollport = (a, b, c) ->
    return new Scrollport null, a, b, c

  $.fn.scrollport = (a, b, c) ->
    new Scrollport this.first(), a, b, c
    return this

  $.fn.scrollport_link = (a, b, c, d) ->
    return this.each ->
      new ScrollportLink $(this), a, b, c, d

  $ ->
    $('[data-scrollport]').scrollport_link()