var documentData = null;
var sign_data = '';
var is_signed = false;
var _resize = null;
$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("DocEntry")) {
        alert("Fehler! Keine Parameter!");
        window.history.back();
        return;
    }
    var docEntry = decodeURI(urlParams.get("DocEntry"));
    setLoadingState(true);

    remote("GET", "/b1s/v1/Orders(" + docEntry + ")", function onError() {
            setLoadingState(false);
        },
        function onSuccess(jsonResult) {
            setLoadingState(false);
            documentData = jsonResult;
            refreshDocument(documentData);
            $("#export-canvas").prop("download", "Unterschrift_Angebot_" + documentData.DocNum + "_" + documentData.CardName + "_" + new Date().toLocaleDateString("de-DE") + ".jpg");
            sign_data = documentData.U_SIGN;
            is_signed = (documentData.U_ISSIGNED === 'Y');
            _resize();
        });
    prepareSignCavas();

});

function prepareSignCavas() {

    var canvas = document.getElementById('sign-canvas');

    if (canvas.getContext)
        var ctx = canvas.getContext('2d');
    var img = new Image;
    img.onload = function () {
        ctx.drawImage(img, 0, 0); // Or at whatever offset you like
    };

    function resizeCanvas() {
        var offset = getOffset(canvas);
        canvas.width = window.innerWidth - offset.left * 2;
        canvas.height = canvas.width * 9 / 16;
        var prev_data = sign_data;//localStorage.getItem('sign-data');
        if (prev_data && prev_data !== "") {
            img.src = prev_data;
        }
        drawDate();
    }

    resizeCanvas();
    _resize = resizeCanvas;
    window.addEventListener("resize", function onResize() {
        resizeCanvas();
    });


    drawDate();

    canvas.addEventListener("mousemove", draw, false);

    canvas.addEventListener("mouseup", function mouseUp(event) {
        mouseState = 0;
        temp_save_sign();
    }, false);
    canvas.addEventListener("mousedown", touchStart, false);
    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchmove", draw, false);
    canvas.addEventListener("touchend", function () {
        temp_save_sign();
    });


    function temp_save_sign() {
        //localStorage.setItem("sign-data", LZString.compress(canvas.toDataURL()));
        //localStorage.setItem("sign-data", canvas.toDataURL());
        sign_data = canvas.toDataURL();
    }

    var lastX = null;
    var lastY = null;

    var mouseState = 0;

    function drawDate() {
        if (!ctx) {
            return;
        }
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.font = "18px Arial";
        ctx.fillText(new Date().toLocaleDateString("de-DE"), canvas.width - 100, canvas.height - 28);
        //ctx.fillText("test", canvas.width - 100, canvas.height - 28);
        ctx.fillStyle = "rgb(255,255,255)";

    }

    function draw(event) {
        event.preventDefault();
        var offset = getOffset(canvas);
        var x = null;
        var y = null;
        if (event.touches) {
            x = event.touches[0].pageX - offset.left;
            y = event.touches[0].pageY - offset.top;
        }
        else {
            if (mouseState === 0) {
                return;
            }
            x = event.pageX - offset.left;
            y = event.pageY - offset.top;
        }
        //ctx.fillRect(x, y, 5, 5);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.closePath();
        lastX = x;
        lastY = y;
    }

    function touchStart(event) {
        var offset = getOffset(canvas);

        if (event.touches) {
            var x = event.touches[0].pageX - offset.left;
            var y = event.touches[0].pageY - offset.top;
            lastX = x;
            lastY = y;
        }
        else {
            mouseState = 1;
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            lastX = x;
            lastY = y;
        }
    }

    $("#reset-canvas").on("click", function resetCanvas(event) {
        event.preventDefault();
        if (confirm("Sind Sie sicher, dass Sie diese Unterschrift löschen möchten?")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawDate();
            localStorage.setItem("sign-data", '');
        }
    });
    $("#save-canvas").on("click", function saveCanvas(event) {
        event.preventDefault();
        var jpegData = canvas.toDataURL('image/jpeg');
        remote("PATCH", "/b1s/v1/Orders(" + documentData.DocEntry + ")", function onError() {

            },
            function onSuccess(result) {

            }, {
                U_SIGN: jpegData,
                U_ISSIGNED: "Y"
            });
    });

    $("#export-canvas").on("click", function exportAsJpeg(event) {
//        event.preventDefault();
        var jpegData = canvas.toDataURL('image/jpeg');
        this.href = jpegData;
    })


}

function refreshDocument(data) {
    // update document head

    $("input.iag-form-data").each(function (index, obj) {
        console.log(obj);
        if (!obj.dataset.field) {
            console.warn("Element got class 'iag-form-data' but has no 'data-field' attribute!");
            return;
        }
        if (!documentData[obj.dataset.field]) {
            console.warn("Document got no key named: " + obj.dataset.field);
            obj.value = "";
            return;
        }
        obj.value = documentData[obj.dataset.field];
    });

    // update document lines
    fillData("#document-lines-content", "#sales-order-line-template", documentData.DocumentLines, function callback() {
        fillData("#document-lines-content", "#sales-order-total-line-template", [documentData], function callback() {
        }, true);
    });


}

function setLoadingState(newValue) {
    console.log("new loading state: " + !!newValue);
    if (!!newValue) {
        $(".loader").show();
        $(".document-head").hide();
        $(".document-lines").hide();
        // $(".paging").hide();
    } else {
        $(".loader").hide();
        $(".document-head").show();
        $(".document-lines").show();
        // $(".paging").show();

    }
}