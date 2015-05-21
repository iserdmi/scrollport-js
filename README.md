# Scrollport.js

Scrollport.js - not your boring plugin for scrolling animation. See [demo](http://serdmi.com/demo/scrollport/) for possible uses.

Plug-in can not only animate the scroll, but also to assign references by clicking on which to begin the animation.

## Use
```js
  $.scrollport( target [, options ] );
  $.scrollport( target [, container ] [, options ] );

  $.scrollport( top, [, options ] );
  $.scrollport( top, [, container ] [, options ] );

  $.scrollport( top, left, [, options ] );
  $.scrollport( top, left, [, container ] [, options ] );

  container.scrollport( target [, options ] );
  container.scrollport( top [, options ] );
  container.scrollport( top, left [, options ] );
```
* ** `target` **
Either the object dzheykveri or selector element, which will be scrolling.

* ** `container` ** default `$(window)`
Object dzheykveri inside which will be scrolling.

* ** `top` **
Number of pixels from the top edge of the `container`. The specified point will be scrolling.

* ** `left` **
Number of pixels from the left edge of the `container`. The specified point will be scrolling.

* ** `options` **
Settings responsible for scroll mode, scroll details and callbacks.

## Settings

The plugin has four modes depending on the selected mode will be added to the individual settings. The following are options which can be set regardless of the selected mode.

* ** `mode` ** default `usual`
Profile name: `usual`, `roll`, `hard` or `soft`.

* ** `interrupt_user` ** default `true`
If during operation the plug the user make a forced scrolling, the movement caused by the plugin will stop.

* ** `interrupt_scrollport` ** default `true`
If during the plugin it will initiate a new movement, the former stops. When set to `false` caused over the existing movement will not be performed.

* ** `interrupt` **
Set to `true` or `false`, setting the same value for the options `interrupt_user` and `interrupt_scrollport`

* ** `container` **
Dzheykveri element inside which will be scrolling. As you can see, the container can be set not only as an argument in a call to the plugin, but the pass option settings. The result will be the same.

* ** `delta` ** default `{top: 0, left: 0}`
The value of `top` determines how many pixels from the top should be "do not reach" to `target`. The value of `left` determines the number of pixels on the left. If you pass the optional number, it will be assumed that you pass `{top: your_number, left: 0} '.

* ** `on_start` **
The function that will be called at the start of the movement. The argument passed to the function API. `this` will contain a `container`.

* ** `on_interrupt` **
The function to be called when the plugin is interrupted user scrolls. The argument passed to the function API. `this` will contain a `container`.

* ** `on_finish` **
The function that will be called upon successful completion of the scroll. That is, if the action was not interrupted by the user. The argument passed to the function API. `this` will contain a `container`.

* ** `on_stop` **
The function that will be called at the end of the movement, regardless of whether it was from interruption or completing the scroll path. The argument passed to the function API. `this` will contain a `container`.

### Usual mode

Scrolls to that location, within a specified period of time.

* ** `duration` ** default `700`
Time in milliseconds the scroll shoud take.

* ** `easing` ** default `swing`

### Roll mode

Scrolls to a specified location at a predetermined speed.

* ** `speed` ** default `2500`
The number of pixels that must be scrolled in 1 second (1000 ms).

* ** `max_duration` ** default `700`
Maximum allowed scroll time, if the distance to the target is large. You can define the maximum number of milliseconds that you are willing to wait. To disable restrictions pass the value `false`.

* ** `min_duration` ** default `300`
Minimum allowed scroll time, if the distance is too short, to avoid feeling too sharp move, you can specify the time, less than that, it is impossible to approach the target.

* ** `easing` ** default `swing`

### Hard mode

Instantly it moves us a few pixels to the target and then gently scrolls to the place.

* ** `distance` ** default `5`
The distance in pixels that remains the goal after a momentary movement.

* ** `duration` ** default `50`
Time during which the rest of the way will be passed.

* ** `easing` ** default `swing`

### Soft mode

Slowly begins to move toward the goal, the content appears on top of the white layer is gradually becoming not transparent. When the layer becomes completely opaque, scroll quickly moved close to the target. Then, slowly reach your during the White layer gradually disappears.

To change any settings or CSS, in their style, set the desired properties of the element with the class `scrollport-overlay`.

* ** `distance_before` ** default `200`
Distance the scrolling before the layer becomes opaque.

* ** `distance_after` ** default `200`
It distances the scroll after layer will begin to disappear.

* ** `distance` **
It allows you to set the value for both properties at once `distance_before` and `distance_after`.

* ** `duration_before` ** default `200`
Time for which the scroll goes the distance specified in the `distance_before`.

* ** `duration_after` ** default `400`
Time for which the scroll goes the distance specified in the `distance_after`.

* ** `duration` **
It allows you to set the value for both properties at once `duration_before` and `duration_after`.

* ** `easing_before` ** default `swing`
Ising, which scroll goes the distance specified in the `distance_before`.

* ** `easing_after` ** default `swing`
Ising, which scroll goes the distance specified in the `distance_after`.

* ** `waiting` ** default `100`
The time during which the layer will remain opaque.

* ** `easing` **
It allows you to set the value for both properties at once `easing_before` and `easing_after`.

* ** `speed` **
If the target is too close, the scrolling will be carried out with the use of fashion `roll`. The option `speed` can pass the speed with which the scroll gets to the goal.

## Changing default settings

```js
  $.scrollport( options );
```

## Scrollport Links

Clicking on the link will be created by the plugin. All references to the attribute `data-scrollport` will be automatically assigned to be a scrollport anchor. If you do not pass any one of the values ​​`target`, `top` or `left`, then `target` will automatically attribute value `data-scrollport` or `href`, or `data-href`.

```js
  link.scrollport_link( [ target ] [, options ] );
  link.scrollport_link( [ target ] [, container ] [, options ] );

  link.scrollport_link( top, [, options ] );
  link.scrollport_link( top, [, container ] [, options ] );

  link.scrollport_link( top, left, [, options ] );
  link.scrollport_link( top, left, [, container ] [, options ] );
```
* ** `link` **
Object target, which will link to a scrollport anchor.

## API

API access can be obtained as follows:
```js
  // When the initialization of the plugin.
  api = $.scrollport( ... );

  // API passed to the function of any callback.
  $.scrollport( ..., {
    on_finish: function( api ) {
      ...
    }
  });
```

* ** `api.options` **
Options passed to the initialization, combined with the default settings.

* ** `api.status` **
At the time of initialization status `init`. If the failure occurred during initialization or initialization value it will be abolished `cancel`. During the movement of `motion`. After the interruption of `interrupt`. Upon successful completion, `finish`.

* ** `api.container` **
Dzheykveri object passed as the `container` initialization.

* ** `api.target` **
If the goal was transferred selector or object dzheykveri, `api.target` will contain targeted element. If the goal were the coordinates, the object will be `api.target` type `{top: ..., left: ...}`

## Examples

```js
  // In the "usual" to move the scroll to top of the page.
  $.scrollport( 'body' );

  // In the "soft" to move the scroll 500 pixels from the top of the page
  $.scrollport( 500, { mode: 'soft' } );

  // In the "hard" to move the scroll element with id "my_container" to a point 100 pixels to the right of the beginning of the container, and 40 pixels below.
  $( '#my_container' ).scrollport( 100, 100, { 
    mode: 'hard'
    delta: 60
  } );
 
  // In the "usual" to move the scroll to the item page id "my_element". At the end of the motion to withdraw the status skrollporta console.
  $.scrollport( '#my_element', { 
    on_stop: function( api ) {
      console.log( api.status );
    }
  } );
```

## Where can I get it?
You can take through the bower:
`$ bower install scrollport-js`

You can through npm:
`$ npm install scrollport-js`

You can even get it via CDN. Link to the latest version. If you will need some other version, change "1.0.4" in reference to the desired value:
```
https://cdn.rawgit.com/iserdmi/scrollport-js/1.0.4/dist/scrollport.min.js
```

Only in extreme cases [download it directly](https://github.com/iserdmi/scrollport-js/archive/master.zip).