// vim: ts=2 sw=2
;(function (global, factory) {
  "use strict"
  if (typeof module === "object" && module != null && module.exports) {
    module.exports = factory(global, require('d3'));
  } else if (typeof define === "function" && define.amd) {
    define(['d3'], factory);
  } else {
    if ( ! global.d3 ) throw new Error("d3-timeline requires d3");
    global.d3.timeline = timeline;
  }
})(typeof window !== "undefined" ? window : this, function (global, d3) {
  return function() {
    var DISPLAY_TYPES = ["circle", "rect"];

    var hover = function () {},
        mouseover = function () {},
        mouseout = function () {},
        click = function () {},
        scroll = function () {},
        labelFunction = function(label) { return label; },
        navigateLeft = function () {},
        navigateRight = function () {},
        identifyPointBy = undefined,
        orient = "bottom",
        presetWidth = null,
        height = null,
        rowSeparatorsColor = null,
        backgroundColor = null,
        tickFormat = { format: d3.timeFormat("%I %p"),
          tickTime: d3.timeHour,
          tickInterval: 1,
          tickSize: 6,
          tickValues: null
        },
        colorCycle = d3.scaleOrdinal(d3.schemeCategory20),
        colorPropertyName = null,
        display = "rect",
        beginning = 0,
        labelMargin = 0,
        ending = 0,
        presetMargin = {left: 30, right:30, top: 30, bottom:30},
        stacked = false,
        rotateTicks = false,
        timeIsRelative = false,
        fullLengthBackgrounds = false,
        itemHeight = 20,
        itemMargin = 5,
        navMargin = 60,
        showTimeAxis = true,
        showAxisTop = false,
        timeAxisTick = false,
        timeAxisTickFormat = {stroke: "stroke-dasharray", spacing: "4 10"},
        showBorderFormat = {marginTop: 25, marginBottom: 0, width: 1, color: colorCycle},
        showAxisHeaderBackground = false,
        showAxisNav = false,
        showAxisCalendarYear = false,
        axisBgColor = "white",
        chartData = {}
      ;

    var renderTimeAxis = function(g, xAxis, yPosition, margin) {

      if(showAxisHeaderBackground){ renderAxisHeaderBackground(g, 0, 0); }

      if(showAxisNav){ renderTimeAxisNav(g, margin) };

      var axis = g.select("g.axis")
        .attr("transform", "translate(" + 0 + "," + yPosition + ")")
        .call(xAxis);
    };

    var renderTimeAxisCalendarYear = function (nav) {
      var calendarLabel = beginning.getFullYear();

      if (beginning.getFullYear() != ending.getFullYear()) {
        calendarLabel = beginning.getFullYear() + "-" + ending.getFullYear()
      }

      nav.select('text.calendar-year')
        .attr("transform", "translate(" + 20 + ", 0)")
        .attr("x", 0)
        .attr("y", 14)
        .text(calendarLabel)
      ;
    };
    var renderTimeAxisNav = function (g, margin) {
      var timelineBlocks = 6;
      var leftNavMargin = (margin.left - navMargin);
      var incrementValue = (width - margin.left)/timelineBlocks;
      var rightNavMargin = (width - margin.right - incrementValue + navMargin);

      var nav = g.select('g.axis')
        .attr("transform", "translate(0, 20)")
      ;

      if (showAxisCalendarYear) { renderTimeAxisCalendarYear(nav) };

      nav.select("text.chevron")
        .attr("x", 0)
        .attr("y", 14)
        .attr("class", "chevron")
        .text("<")
        .on("click", function () {
          return navigateLeft(beginning, chartData);
        })
      ;

      nav.select("text.chevron")
        .attr("transform", "translate(" + rightNavMargin + ", 0)")
        .attr("x", 0)
        .attr("y", 14)
        .text(">")
        .on("click", function () {
          return navigateRight(ending, chartData);
        })
      ;
    };

    var renderAxisHeaderBackground = function (g, xAxis, yAxis) {
      g.select("rect.row-green-bar")
        .attr("x", xAxis)
        .attr("width", width)
        .attr("y", yAxis)
        .attr("height", itemHeight)
        .attr("fill", axisBgColor);
    };

    var renderTimeAxisTick = function(g, xAxis, maxStack, margin) {
      g.select("g.axis")
        .attr("transform", "translate(" + 0 + "," + (margin.top + (itemHeight + itemMargin) * maxStack) + ")")
        .attr(timeAxisTickFormat.stroke, timeAxisTickFormat.spacing)
        .call(xAxis.tickFormat("").tickSize(-(margin.top + (itemHeight + itemMargin) * (maxStack - 1) + 3), 0, 0));
    };

    var appendBackgroundBar = function (margin, yAxisMapping, index, g, data, datum) {
      var greenbarYAxis = ((itemHeight + itemMargin) * yAxisMapping[index]) + margin.top;
      g.selectAll("svg").data(data).enter()
        .insert("rect")
        .attr("class", "row-green-bar")
        .attr("x", fullLengthBackgrounds ? 0 : margin.left)
        .attr("width", fullLengthBackgrounds ? width : (width - margin.right - margin.left))
        .attr("y", greenbarYAxis)
        .attr("height", itemHeight)
        .attr("fill", backgroundColor instanceof Function ? backgroundColor(datum, index) : backgroundColor)
      ;
    };

    function init (__parent) {
      var gParent = __parent

      //
      // The container for timelines
      //
      gParent.append('g')
        .attr('class', 'timelines')

      if (rowSeparatorsColor) {
        gParent.append("svg:line")
          .attr("class", "row-separator")
      }

      if (showTimeAxis) {

        var axis = gParent.append("g")
          .attr("class", "axis")

        if (showAxisHeaderBackground) {
          gParent.insert("rect")
            .attr("class", "row-green-bar")
        }

        if (showAxisNav) {
          var nav = gParent.append('g')
              .attr("class", "axis")
              .attr("transform", "translate(0, 0)")
            ;

          if (showAxisCalendarYear) {
            nav.append("text")
              .attr("class", "calendar-year")
              .attr("transform", "translate(0, 0)")
              .attr("x", 0)
              .attr("y", 0)
          }

          nav.append("text")
            .attr("class", "chevron")
            .attr("transform", "translate(0, 0)")
            .attr("x", 0)
            .attr("y", 0)
            .text("<")
            .on("click", function () {
              return navigateLeft(beginning, chartData);
            })
          ;

          nav.append("text")
            .attr("transform", "translate(0, 0)")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "chevron")
            .text(">")
            .on("click", function () {
              return navigateRight(ending, chartData);
            })
          ;

        }
      }

    }

    function render (gParent, chartData) {
      console.log("Rendering", chartData)
      var existing = gParent.select('g')
      var g = existing.node() && existing || gParent.append("g");
      var gParentSize = gParent.node().getBoundingClientRect();

      var width = presetWidth || gParentSize.width;

      //
      // Calculate longest label to add to left margin
      //
      var longestLabel = chartData.reduce(function (longest, d) {
        return longest.length > d.label.length ? longest : d.label
      }, "")

      var longestLabelLength;

      gParent.append('text')
        .attr('class', 'timeline-label')
        .text(longestLabel)
        .call(function (textSelection, y, z) {
          var text = textSelection.node()
          longestLabelLength = text.getComputedTextLength()
          text.remove()
        })

      var margin = Object.assign({}, presetMargin, {
        left: Math.max(
          presetMargin.left,
          longestLabelLength
        )
      })

      var yAxisMapping = {},
        maxStack = 1,
        minTime = 0,
        maxTime = 0;

      //
      // Calculate time window and stack size
      //
      // check if the user wants relative time
      // if so, substract the first timestamp from each subsequent timestamps
      if(timeIsRelative){
        chartData.forEach(function (datum, index) {
          datum.times.forEach(function (time, j) {
            if(index === 0 && j === 0){
              originTime = time.starting_time;               //Store the timestamp that will serve as origin
              time.starting_time = 0;                        //Set the origin
              time.ending_time = time.ending_time - originTime;     //Store the relative time (millis)
            }else{
              time.starting_time = time.starting_time - originTime;
              time.ending_time = time.ending_time - originTime;
            }
          });
        });
      }

      // check how many stacks we're gonna need
      // do this here so that we can draw the axis before the graph
      if (stacked || ending === 0 || beginning === 0) {
        chartData.forEach(function (datum, index) {

          // create y mapping for stacked graph
          if (stacked && Object.keys(yAxisMapping).indexOf(index) == -1) {
            yAxisMapping[index] = maxStack;
            maxStack++;
          }

          // figure out beginning and ending times if they are unspecified
          datum.times.forEach(function (time, i) {
            if(beginning === 0)
              if (time.starting_time < minTime || (minTime === 0 && timeIsRelative === false))
                minTime = time.starting_time;
            if(ending === 0)
              if (time.ending_time > maxTime)
                maxTime = time.ending_time;
          });
        });

        if (ending === 0) {
          ending = maxTime;
        }
        if (beginning === 0) {
          beginning = minTime;
        }
      }
      // Done calculating time window and stack size.
      //

      var scaleFactor = (1/(ending - beginning)) * (width - margin.left - margin.right);

      //
      // First draw the timelines themselves
      //
      var timelines = gParent.select('g.timelines').selectAll('g.timeline')
        .data(chartData, function (d) { return d.label })

      var newTimelines = timelines.enter()
        .append('g')
          .attr('class', 'timeline')

      newTimelines.append('text')
        .attr('class', 'timeline-label')

      newTimelines.each(function (datum, index) {
        var timelineElem = this

        if ( typeof(datum.icon) !== "undefined" ) {
          timelineElem.append('image')
            .attr("class", "timeline-label-image")
            .attr("transform", "translate(0, 0)")
            .attr("xlink:href", datum.icon)
        }
      })

      timelines.merge(newTimelines).each(function (datum, index) {
        var timelineElem = d3.select(this)
        var data = datum.times;
        var hasLabel = (typeof(datum.label) != "undefined");

        //
        // Render timeline label
        //
        var fullItemHeight = itemHeight + itemMargin;
        var labelRowsDown  = margin.top + (fullItemHeight/2) + fullItemHeight * (yAxisMapping[index] || 1);

        timelineElem.select('text.timeline-label')
          .on("click", function (d, i) { click(d, index, datum); })
          .text(hasLabel ? labelFunction(datum.label) : datum.id)
          .attr("transform", "translate(" + labelMargin + "," + labelRowsDown + ")")
        ;

        // issue warning about using id per data set. Ids should be individual to data elements
        if (typeof(datum.id) != "undefined") {
          console.warn("d3Timeline Warning: Ids per dataset is deprecated in favor of a 'class' key. Ids are now per data element.");
        }

        if (backgroundColor) { appendBackgroundBar(margin, yAxisMapping, index, g, data, datum); }

        function setPointPositionAndSize (elem) {
          return elem
            .attr("x", getXPos)
            .attr("y", getStackPosition)
            .attr("width", function (d, i) {
              return (d.ending_time - d.starting_time) * scaleFactor;
            })
            .attr("cy", function(d, i) {
                return getStackPosition(d, i) + itemHeight/2;
            })
            .attr("cx", getXPos)
            .attr("height", itemHeight)
        }

        var pointClass = datum.class ? "timelineSeries_"+datum.class : "timelineSeries_"+index

        var points = timelineElem.selectAll("."+pointClass).data(data, identifyPointBy)

        points
          .transition()
          .call(setPointPositionAndSize)

        points.exit()
          .transition()
            .duration(500)
            .attr("r", 0)
            .remove()

        points.enter()
          .append(function(d, i) {
            return document.createElementNS(d3.namespaces.svg, ("display" in d) ? d.display : display);
          })
          .call(setPointPositionAndSize)
          .style("fill", function(d, i){
            var dColorPropName;
            if (d.color) return d.color;
            if( colorPropertyName ){
              dColorPropName = d[colorPropertyName];
              if ( dColorPropName ) {
                return colorCycle( dColorPropName );
              } else {
                return colorCycle( datum[colorPropertyName] );
              }
            }
            return colorCycle(index);
          })
          .on("mousemove", function (d, i) {
            hover(d, index, datum);
          })
          .on("mouseover", function (d, i) {
            mouseover(d, i, datum);
          })
          .on("mouseout", function (d, i) {
            mouseout(d, i, datum);
          })
          .on("click", function (d, i) {
            click(d, index, datum);
          })
          .attr("class", function (d, i) {
            return pointClass;
          })
          .attr("id", function(d, i) {
            // use deprecated id field
            if (datum.id && !d.id) {
              return 'timelineItem_'+datum.id;
            }

            return d.id ? d.id : "timelineItem_"+index+"_"+i;
          })
          .attr("r", 0)
          .transition()
            .duration(1000)
            .attr("r", itemHeight / 2)
        ;

        timelineElem.select('image')
          .attr("class", "timeline-label-image")
          .attr("transform", "translate("+ 0 +","+ (margin.top + (itemHeight + itemMargin) * yAxisMapping[index])+")")
          .attr("width", margin.left)
          .attr("height", itemHeight)

        function getStackPosition(d, i) {
          if (stacked) {
            return margin.top + (itemHeight + itemMargin) * yAxisMapping[index];
          }
          return margin.top;
        }
        function getStackTextPosition(d, i) {
          if (stacked) {
            return margin.top + (itemHeight + itemMargin) * yAxisMapping[index] + itemHeight * 0.75;
          }
          return margin.top + itemHeight * 0.75;
        }
      });

      //
      // Now take care of singletons
      //
      // Set up YAxis
      //
      if (rowSeparatorsColor) {
        var lineYAxis = ( itemHeight + itemMargin / 2 + margin.top + (itemHeight + itemMargin) * yAxisMapping[index]);
        gParent.select("svg:line")
          .transition()
          .attr("x1", 0 + margin.left)
          .attr("x2", width - margin.right)
          .attr("y1", lineYAxis)
          .attr("y2", lineYAxis)
          .attr("stroke-width", 1)
          .attr("stroke", rowSeparatorsColor);
      }

      //
      // Set up X Axis
      //
      var xScale = d3.scaleTime()
        .domain([beginning, ending])
        .range([margin.left, width - margin.right]);

      var xAxis = d3.axisBottom(xScale)
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);

      if (tickFormat.tickValues != null) {
        xAxis.tickValues(tickFormat.tickValues);
      } else {
        xAxis.ticks(tickFormat.numTicks || tickFormat.tickTime.every(tickFormat.tickInterval));
      }

      //
      // Draw chart axis
      //
      var belowLastItem = (margin.top + (itemHeight + itemMargin) * maxStack);
      var aboveFirstItem = margin.top;
      var timeAxisYPosition = showAxisTop ? aboveFirstItem : belowLastItem;

      if (showTimeAxis) { renderTimeAxis(gParent, xAxis, timeAxisYPosition, margin); }
      if (timeAxisTick) { renderTimeAxisTick(gParent, xAxis, maxStack, margin); }

      if (rotateTicks) {
        g.selectAll(".tick text")
          .attr("transform", function(d) {
            return "rotate(" + rotateTicks + ")translate("
              + (this.getBBox().width / 2 + 10) + "," // TODO: change this 10
              + this.getBBox().height / 2 + ")";
          });
      }

      if (width > gParentSize.width) {
        var move = function() {
          var x = Math.min(0, Math.max(gParentSize.width - width, d3.event.translate[0]));
          zoom.translate([x, 0]);
          gParent.attr("transform", "translate(" + x + ",0)");
          scroll(x*scaleFactor, xScale);
        };

        var zoom = d3.behavior.zoom().x(xScale).on("zoom", move);

        gParent
          .attr("class", "scrollable")
          .call(zoom);
      }

      setHeight();

      //
      // Helpers
      //
      function getXPos(d, i) {
        return margin.left + (d.starting_time - beginning) * scaleFactor;
      }

      function setWidth (oldWidth, gParentSize) {
        var gNode = g.node()

        if ( ! oldWidth && ! gParentSize.width ) {
          try {
            return gNode.getAttribute("width");
            if ( ! newWidth ) {
              throw "width of the timeline is not set. As of Firefox 27, timeline().with(x) needs to be explicitly set in order to render";
            }
          } catch (err) {
            console.log( err );
          }
        }
        else if ( ! (oldWidth && gParentSize.width) ) {
          try {
            return gNode.getAttribute("width");
          } catch (err) {
            console.log( err );
          }
        }

        // if both are set, do nothing
        return oldWidth
      }

      function setHeight() {
        var gNode = g.node()

        if (!height && !gNode.getAttribute("height")) {
          if (itemHeight) {

            height = 0;

            // Combine heights of all children
            var children = gNode.parentElement.children;
            for (var i=0; i < children.length; i++) {
              var childSize = children[i].getBoundingClientRect();
              height += childSize.height;
            }

            // Add top margin offset
            var gParentSize = gParent.node().getBoundingClientRect();
            // debugger
            height += children[0].getBoundingClientRect().top - gParentSize.top;
            // height += children[0].getBoundingClientRect().top;
            height += margin.top;

            // set bounding rectangle height
            gParent.node().setAttribute("height", height);
          } else {
            throw "height of the timeline is not set";
          }
        } else {
          if (!height) {
            height = gNode.getAttribute("height");
          } else {
            gNode.setAttribute("height", height);
          }
        }
      }
    }

    // SETTINGS
    var timeline = {}

    timeline.init = init
    timeline.render = render

    timeline.margin = function (p) {
      if (!arguments.length) return presetMargin;
      presetMargin = p;
      return timeline;
    };

    timeline.orient = function (orientation) {
      if (!arguments.length) return orient;
      orient = orientation;
      return timeline;
    };

    timeline.itemHeight = function (h) {
      if (!arguments.length) return itemHeight;
      itemHeight = h;
      return timeline;
    };

    timeline.itemMargin = function (h) {
      if (!arguments.length) return itemMargin;
      itemMargin = h;
      return timeline;
    };

    timeline.navMargin = function (h) {
      if (!arguments.length) return navMargin;
      navMargin = h;
      return timeline;
    };

    timeline.height = function (h) {
      if (!arguments.length) return height;
      height = h;
      return timeline;
    };

    timeline.width = function (w) {
      if (!arguments.length) return presetWidth;
      presetWidth = w;
      return timeline;
    };

    timeline.display = function (displayType) {
      if (!arguments.length || (DISPLAY_TYPES.indexOf(displayType) == -1)) return display;
      display = displayType;
      return timeline;
    };

    timeline.labelFormat = function(f) {
      if (!arguments.length) return labelFunction;
      labelFunction = f;
      return timeline;
    };

    timeline.tickFormat = function (format) {
      if (!arguments.length) return tickFormat;
      tickFormat = format;
      return timeline;
    };

    timeline.hover = function (hoverFunc) {
      if (!arguments.length) return hover;
      hover = hoverFunc;
      return timeline;
    };

    timeline.mouseover = function (mouseoverFunc) {
      if (!arguments.length) return mouseover;
      mouseover = mouseoverFunc;
      return timeline;
    };

    timeline.mouseout = function (mouseoutFunc) {
      if (!arguments.length) return mouseout;
      mouseout = mouseoutFunc;
      return timeline;
    };

    timeline.click = function (clickFunc) {
      if (!arguments.length) return click;
      click = clickFunc;
      return timeline;
    };

    timeline.scroll = function (scrollFunc) {
      if (!arguments.length) return scroll;
      scroll = scrollFunc;
      return timeline;
    };

    timeline.colors = function (colorFormat) {
      if (!arguments.length) return colorCycle;
      colorCycle = colorFormat;
      return timeline;
    };

    timeline.beginning = function (b) {
      if (!arguments.length) return beginning;
      beginning = b;
      return timeline;
    };

    timeline.ending = function (e) {
      if (!arguments.length) return ending;
      ending = e;
      return timeline;
    };

    timeline.identifyPointBy = function (fn) {
      if (!arguments.length) return identifyPointBy;
      identifyPointBy = fn;
      return timeline;
    };

    timeline.labelMargin = function (m) {
      if (!arguments.length) return labelMargin;
      labelMargin = m;
      return timeline;
    };

    timeline.rotateTicks = function (degrees) {
      if (!arguments.length) return rotateTicks;
      rotateTicks = degrees;
      return timeline;
    };

    timeline.stack = function () {
      stacked = !stacked;
      return timeline;
    };

    timeline.relativeTime = function() {
      timeIsRelative = !timeIsRelative;
      return timeline;
    };

    timeline.showBorderFormat = function(borderFormat) {
      if (!arguments.length) return showBorderFormat;
      showBorderFormat = borderFormat;
      return timeline;
    };

    timeline.colorProperty = function(colorProp) {
      if (!arguments.length) return colorPropertyName;
      colorPropertyName = colorProp;
      return timeline;
    };

    timeline.rowSeparators = function (color) {
      if (!arguments.length) return rowSeparatorsColor;
      rowSeparatorsColor = color;
      return timeline;

    };

    timeline.background = function (color) {
      if (!arguments.length) return backgroundColor;
      backgroundColor = color;
      return timeline;
    };

    timeline.showTimeAxis = function () {
      showTimeAxis = !showTimeAxis;
      return timeline;
    };

    timeline.showAxisTop = function () {
      showAxisTop = !showAxisTop;
      return timeline;
    };

    timeline.showAxisCalendarYear = function () {
      showAxisCalendarYear = !showAxisCalendarYear;
      return timeline;
    };

    timeline.showTimeAxisTick = function () {
      timeAxisTick = !timeAxisTick;
      return timeline;
    };

    timeline.fullLengthBackgrounds = function () {
      fullLengthBackgrounds = !fullLengthBackgrounds;
      return timeline;
    };

    timeline.showTimeAxisTickFormat = function(format) {
      if (!arguments.length) return timeAxisTickFormat;
      timeAxisTickFormat = format;
      return timeline;
    };

    timeline.showAxisHeaderBackground = function(bgColor) {
      showAxisHeaderBackground = !showAxisHeaderBackground;
      if(bgColor) { (axisBgColor = bgColor) };
      return timeline;
    };

    timeline.navigate = function (navigateBackwards, navigateForwards) {
      if (!arguments.length) return [navigateLeft, navigateRight];
      navigateLeft = navigateBackwards;
      navigateRight = navigateForwards;
      showAxisNav = !showAxisNav;
      return timeline;
    };

    return timeline;
  };

});
