$(function() {
    navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
    document.fullscreenEnabled =
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.documentElement.webkitRequestFullScreen;
    var context,
        start_btn = $(".app-start"),
        content_div = $(".app .row .col-sm");
    var insertText = updateText("");

    function applyRandomFilter() {
        var filters = [
            "blur",
            "inverse",
            "convolve",
            "convoblur",
            "convolve2",
            "blackandwhite",
            "noir",
            "bluefill",
            "displacement"
        ];
        var num = parseInt(Math.random() * filters.length);
        $("#face-video").css(
            "webkitFilter",
            "url(#" + filters[num] + ")",
            "mozFilter",
            "url(#" + filters[num] + ")",
            "filter",
            "url(#" + filters[num] + ")"
        );
    }

    function removeFilter() {
        $("#face-video").css("webkitFilter", "", "mozFilter", "", "filter", "");
    }

    function requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }

    function updateText() {
        var oldMessage = "";
        function msg(newMessage) {
            if (newMessage != oldMessage) {
                oldMessage = newMessage;
                content_div.find("p").html(newMessage);
            }
        }
        return msg;
    }

    function getFaceBounds(bounds) {
        var _bounds = {};
        _bounds.height = (bounds.height() / 100) * 40;
        _bounds.left = (bounds.width() / 100) * 20;
        _bounds.right = bounds.width() - (bounds.width() / 100) * 20;
        return _bounds;
    }

    function checkBounds(rect) {
        var bounds = getFaceBounds($("#face-video"));
        // console.log(bounds, rect);
        if (bounds.height >= rect.height) {
            insertText("Align face Come closer");
            // console.log("Come closer");
        } else if (rect.x + rect.width >= bounds.right) {
            insertText("Align face Move left");
            // console.log("Move left");
        } else if (rect.x <= bounds.left) {
            insertText("Align face Move right");
            // console.log("Move right");
        } else {
            insertText("Ready");
            // console.log("Ready");
        }
    }

    function drawOval(ctx, x, y, w, h, style) {
        var kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w, // x-end
            ye = y + h, // y-end
            xm = x + w / 2, // x-middle
            ym = y + h / 2; // y-middle

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.quadraticCurveTo(x, y, xm, y);
        ctx.quadraticCurveTo(xe, y, xe, ym);
        ctx.quadraticCurveTo(xe, ye, xm, ye);
        ctx.quadraticCurveTo(x, ye, x, ym);
        if (style) ctx.strokeStyle = style;
        ctx.stroke();
        ctx.restore();
    }

    function trackCamera() {
        var tracker = new tracking.ObjectTracker("face");
        tracker.setInitialScale(1);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);
        tracking.track($("#face-video").get(0), tracker, {camera: true});
        // var _text = $.throttle(250, true, insertText);
        // _text("Align face");
        insertText("Align face");
        var bounds = getFaceBounds($("#face-video"));
        console.log(
            bounds.left,
            bounds.height / 4,
            bounds.right - bounds.left,
            $("#face-video").height() - bounds.height / 2
        );
        drawOval(
            context,
            bounds.left,
            bounds.height / 4,
            bounds.right - bounds.left,
            $("#face-video").height() - bounds.height / 2,
            "green"
        );
        tracker.on("track", function(event) {
            if (event.data.length > 0) {
                event.data.forEach(function(rect) {
                    var _test = $.throttle(250, true, checkBounds);
                    _test(rect);
                    // $.debounce(250, true, checkBounds(rect));
                    // context.strokeStyle = "#a64ceb";
                    // context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    // context.font = "11px Helvetica";
                    // context.fillStyle = "#fff";
                    // context.fillText(
                    //     "x: " + rect.x + "px",
                    //     rect.x + rect.width + 5,
                    //     rect.y + 11
                    // );
                    // context.fillText(
                    //     "y: " + rect.y + "px",
                    //     rect.x + rect.width + 5,
                    //     rect.y + 22
                    // );
                });
            } else {
                //no face detected
                // fires to often!
            }
        });
    }

    function launchCamera() {
        console.log("launch camera");
        start_btn.remove();
        // content_div.append(
        //     "<video id='face-video' width='448' height='336' preload autoplay loop muted></video>"
        // );
        content_div.append(
            "<video id='face-video' width='320' height='240' preload autoplay loop muted></video>"
        );
        content_div.append(
            "<canvas id='face-canvas' width='320' height='240'></canvas>"
        );
        context = $("#face-canvas")
            .get(0)
            .getContext("2d");
        content_div.append("<p></p>");
        content_div.append(
            "<button class='btn btn-lg btn-primary' id='filter-btn' type='submit'>Apply random filter</button>"
        );
        content_div.append(
            "<button class='btn btn-lg btn-primary' id='filter-remove-btn' type='submit'>Remove filter</button>"
        );
        content_div.contents().wrapAll("<div class='face-container'>");
        $("#face-video").css(
            "transform",
            "scale(-1, 1)",
            "-webkit-transform",
            "scale(-1, 1)"
        );
        trackCamera();
        if (document.fullscreenEnabled) {
            requestFullscreen($(".face-container").get(0));
        }
        $("#filter-btn").on("click touchstart", function() {
            applyRandomFilter();
        });
        $("#filter-remove-btn").on("click touchstart", function() {
            removeFilter();
        });
        // navigator.getUserMedia(
        //     {video: true},
        //     function(stream) {
        //         if ($("#face-video").attr("mozSrcObject") !== undefined) {
        //             $("#face-video").attr("mozSrcObject", stream);
        //         } else {
        //             $("#face-video").attr(
        //                 "src",
        //                 (window.URL && window.URL.createObjectURL(stream)) ||
        //                     stream
        //             );
        //         }
        //         $("#face-video, #face-canvas").css(
        //             "transform",
        //             "scale(-1, 1)",
        //             "-webkit-transform",
        //             "scale(-1, 1)"
        //         );
        //         // $("#face-video")
        //         //     .get(0)
        //         //     .play();
        //         trackCamera();
        //     },
        //     function(error) {
        //         console.error("An error occurred: [CODE " + error.code + "]");
        //     }
        // );
    }

    function init() {
        if (navigator.getUserMedia) {
            console.log("init app");
            start_btn.on("click touchstart", function() {
                launchCamera();
            });
        } else {
            // doesnt support getUserMedia
            start_btn.remove();
            content_div.append(
                "<div>Unfortunatley your browser isn't supported, please try upgrading<div/>"
            );
        }
    }

    init();
});
