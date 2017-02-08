var graphy = function(dom, data) {
    // CONSTANT variable
    var meta = {
        CVS_WIDTH       : 500,
        CVS_HEIGHT      : 500,
        VERTICAL_NAME   : 'y',
        HORIZONTAL_NAME : 'x',
        MAX_X_UNIT      : 5,
        MIN_X_UNIT      : -5,
        MAX_Y_UNIT      : 5,
        MIN_Y_UNIT      : -5,
        INTERVAL_UNIT   : 1,
        MARGIN_PX       : 10,
        PADDING_PX      : 15,
        ARROW_SZ_PX     : 5,
        POINT_RAD_PX    : 2,
        MAIN_COLOR      : "#000",
        POLY_SEGMENT    : 0.1,
        ID              : 'graphy.js_' + Date.now(),
        DIVISION_X      : null,
        DIVISION_Y      : null,
        ORIGIN_X        : null,
        ORIGIN_Y        : null,
    };

    if (data != null) {
        if (data.id) meta.ID = data.id;
        if (data.verticalName) meta.VERTICAL_NAME = data.verticalName;
        if (data.horizontalName) meta.HORIZONTAL_NAME = data.horizontalName;
        if (data.height) meta.CVS_HEIGHT = data.height;
        if (data.width) meta.CVS_WIDTH = data.width;
        if (data.xMax) meta.MAX_X_UNIT = parseInt(data.xMax);
        if (data.xMin) meta.MIN_X_UNIT = parseInt(data.xMin);
        if (data.yMax) meta.MAX_Y_UNIT = parseInt(data.yMax);
        if (data.yMin) meta.MIN_Y_UNIT = parseInt(data.yMin);
        if (data.interval) meta.INTERVAL_UNIT = data.interval;

        // Primary check for data
        if (meta.MAX_X_UNIT < meta.MIN_X_UNIT) {
            console.log("Error: Wrong input for x boundaries");
            return;
        }

        if (meta.MAX_Y_UNIT < meta.MIN_Y_UNIT) {
            console.log("Error: Wrong input for y boundaries");
            return;
        }
    }

    // Canvas Setup
    var canvas = graphySetEmptyCanvas(meta, dom);
    var context = canvas.getContext("2d");
    init();

    /**
     * Initialize Axes
     * @return {[type]} [description]
     */
    function init() {
        // Setup graph metrics
        meta.DIVISION_X = (meta.CVS_WIDTH - 2 * meta.MARGIN_PX - 2 * meta.PADDING_PX) / (meta.MAX_X_UNIT - meta.MIN_X_UNIT);
        meta.DIVISION_Y = (meta.CVS_HEIGHT - 2 * meta.MARGIN_PX - 2 * meta.PADDING_PX) / (meta.MAX_Y_UNIT - meta.MIN_Y_UNIT);
        if (meta.MAX_Y_UNIT > 0 && meta.MIN_Y_UNIT < 0) {
            meta.ORIGIN_Y = meta.MARGIN_PX + meta.PADDING_PX + meta.DIVISION_Y * meta.MAX_Y_UNIT;
        }
        if (meta.MAX_X_UNIT > 0 && meta.MIN_X_UNIT < 0) {
            meta.ORIGIN_X = meta.MARGIN_PX + meta.PADDING_PX + meta.DIVISION_X * Math.abs(meta.MIN_X_UNIT);
        }

        // Draw Axes if necessary
        if (meta.ORIGIN_Y) {
            graphyDrawSolidLine(context, meta.MARGIN_PX, meta.ORIGIN_Y, meta.CVS_WIDTH - meta.MARGIN_PX, meta.ORIGIN_Y, meta.MAIN_COLOR);

            // Draw the arrow head
            graphyDrawSolidLine(context, 
                meta.CVS_WIDTH - meta.MARGIN_PX, meta.ORIGIN_Y, meta.CVS_WIDTH - meta.MARGIN_PX - meta.ARROW_SZ_PX, meta.ORIGIN_Y - meta.ARROW_SZ_PX);
            graphyDrawSolidLine(context, 
                meta.CVS_WIDTH - meta.MARGIN_PX, meta.ORIGIN_Y, meta.CVS_WIDTH - meta.MARGIN_PX - meta.ARROW_SZ_PX, meta.ORIGIN_Y + meta.ARROW_SZ_PX);
            context.fillText(
                meta.HORIZONTAL_NAME, meta.CVS_WIDTH - meta.MARGIN_PX, meta.ORIGIN_Y - meta.MARGIN_PX
                );
        }
        if (meta.ORIGIN_X) {
            graphyDrawSolidLine(context, meta.ORIGIN_X, meta.MARGIN_PX, meta.ORIGIN_X, meta.CVS_HEIGHT - meta.MARGIN_PX, meta.MAIN_COLOR);

            // Draw the arrow head
            graphyDrawSolidLine(context, meta.ORIGIN_X, meta.MARGIN_PX, meta.ORIGIN_X - meta.ARROW_SZ_PX, meta.MARGIN_PX + meta.ARROW_SZ_PX, meta.MAIN_COLOR);
            graphyDrawSolidLine(context, meta.ORIGIN_X, meta.MARGIN_PX, meta.ORIGIN_X + meta.ARROW_SZ_PX, meta.MARGIN_PX + meta.ARROW_SZ_PX, meta.MAIN_COLOR);
            context.fillText(
                meta.VERTICAL_NAME, meta.ORIGIN_X + meta.MARGIN_PX, meta.MARGIN_PX
                );
        }
        context.fillText(0, meta.ORIGIN_X + 5, meta.ORIGIN_Y + 15);

        // Draw the intervals
        for (var i = meta.MIN_X_UNIT; i <= meta.MAX_X_UNIT; i += meta.INTERVAL_UNIT) {
            if (i != 0) {
                var _x = meta.MARGIN_PX + meta.PADDING_PX + (i - meta.MIN_X_UNIT) * meta.DIVISION_X;
                graphyDrawSolidLine(context, _x, meta.ORIGIN_Y + 5, _x, meta.ORIGIN_Y - 5, meta.MAIN_COLOR);
                context.fillText(i, _x, meta.ORIGIN_Y + 15);
            }
        }
        for (var i = meta.MAX_Y_UNIT; i >= meta.MIN_Y_UNIT; i -= meta.INTERVAL_UNIT) {
            if (i != 0) {
                var _y = meta.MARGIN_PX + meta.PADDING_PX + (meta.MAX_Y_UNIT - i) * meta.DIVISION_Y;
                graphyDrawSolidLine(context, meta.ORIGIN_X - 5, _y, meta.ORIGIN_X + 5, _y, meta.MAIN_COLOR);
                context.fillText(i, meta.ORIGIN_X + 5, _y + 5);
            }
        }
    }

    // Public Object APIs
    return {
        plotPoint: function(x, y, shape) {
            if (x != null && y != null) {
                var _x = graphyUnitToPixel(x, 'x', meta);
                var _y = graphyUnitToPixel(y, 'y', meta);
                if (shape === 'cross') {
                    graphyPlotPointCircle(context, _x, _y, meta.MAIN_COLOR);
                } else {
                    graphyPlotPointCross(context, _x, _y);
                }
            }
        },
        drawPoly: function(para, rangeX) {
            if (para != null) {
                var startX = meta.MIN_X_UNIT;
                var endX = meta.MAX_X_UNIT;
                if (rangeX) {
                    if (rangeX[0] && startX < rangeX[0]) {
                        startX = rangeX[0];
                    }
                    if (rangeX[1] && endX > rangeX[1]) {
                        endX = rangeX[1];
                    }
                }

                // Linear polynomials
                if (para.length === 2) {
                    var startY = para[0] * startX + para[1];
                    var endY = para[0] * endX + para[1];

                    var _x1 = graphyUnitToPixel(startX, 'x', meta);
                    var _x2 = graphyUnitToPixel(endX, 'x', meta);
                    var _y1 = graphyUnitToPixel(startY, 'y', meta);
                    var _y2 = graphyUnitToPixel(endY, 'y', meta);
                    graphyDrawSolidLine(context, _x1, _y1, _x2, _y2, meta.MAIN_COLOR);
                } else if (para.length > 2) {
                    var segment = data.polynomials[i].segment ?
                        parseFloat(data.polynomials[i]) : meta.POLY_SEGMENT;
                    graphyDrawPoly(context, startX, endX, para, segment);
                }
            }
        }
    }
}