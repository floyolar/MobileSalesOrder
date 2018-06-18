var documentData = null;

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
        });
});

function refreshDocument(data) {
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
}

function setLoadingState(newValue) {
    console.log("new loading state: " + !!newValue);
    if (!!newValue) {
        $(".loader").show();
        $(".document-head").hide();
        // $(".paging").hide();
    } else {
        $(".loader").hide();
        $(".document-head").show();
        // $(".paging").show();

    }
}