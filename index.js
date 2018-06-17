'use strict';
const service = "";
var lastClicked = '';
var lastSortOrder = 'asc';
var next_page_link = '';
var prev_page_link = '';
function setLoadingState(newValue){
    console.log("new loading state: " + !!newValue)
    if(!!newValue){
        $(".loader").show();
        $("#overview-body").hide();
        $(".paging").hide();
    }else{
        $(".loader").hide();
        $("#overview-body").show();
        $(".paging").show();

    }
}

function autoLogin(error_callback, success_callback) {
    const url = service + "/b1s/v1/Login";
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({"CompanyDB": "SBODEMODE", "UserName": "manager", "Password": "manager"}),
        error: function (err) {
            console.error(err);
            if (error_callback)
                error_callback(err);
        },
        success: function (response) {
            localStorage.setItem("session-raw", JSON.stringify(response));
            localStorage.setItem("session", response.SessionId);
            if (success_callback)
                success_callback();
        }
    });
}

function remote(method, path, error, success) {
    document.cookie = "B1SESSION=" + localStorage.getItem("session") + "; ROUTEID=.node0";
    var req = new XMLHttpRequest();
    req.open(method, service + path, true); // force XMLHttpRequest2
    //req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('postman-token', localStorage.getItem("session"));
    //req.withCredentials = true; // pass along cookies
    req.onerror = error;
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var result = JSON.parse(req.responseText);
            console.log(result);
            success(result);
        }
    };
    req.send();
}

function updateTable(additional_filters, requestUrl){
    setLoadingState(true);

    if(!additional_filters)
        additional_filters = '';
    if(!requestUrl)
        requestUrl = "/b1s/v1/Orders?$filter=DocumentStatus eq 'bost_Open'&$select=DocEntry,DocNum,DocDate,CardCode,CardName,DocTotal";

    remote("GET", requestUrl + additional_filters,
        function onError(e) {
            console.error(e);
           setLoadingState(false);

        },
        function onSuccess(result) {
            setLoadingState(false);
            prev_page_link = requestUrl + additional_filters;
            next_page_link = result["odata.nextLink"];

            fillData("#overview-body", '#sales-order-overview-row', result.value);
        });
}

function hookPagingEvents() {
    $("#next_page").on("click", function(event){
        updateTable(null, next_page_link);
    });
    $("#prev_page").on("click", function(event){
        updateTable(null, prev_page_link);
    });
}

function hookArrowEvents(){
    $("a.iag-arrow").on("click", function (event) {
        $(event.target.parentNode.parentNode).filter()
    });
}

$(document).ready(function () {
    hookHeaderEvents(updateTable);
    hookPagingEvents(updateTable);
    hookArrowEvents();
    autoLogin(function onError() {

        },
        function onSuccess() {
            updateTable();
        });


});

function hookHeaderEvents(callback){

    _.each(document.querySelectorAll("th.table-sortable"), function (x){
        //$(x).append(" <i class='fa fa-sort'></i>");
        $(x).on("click", function(event) {onSortableHeaderClicked(event, callback);});
    });
}

function onSortableHeaderClicked(x, callback){
    if(!x.target.dataset || !x.target.dataset.header){
        console.warn(x + " has no 'data-header' tag! Please add one for sorting functionallity!");
    }
    console.log(x.target.dataset.header);
    var direction = 'asc';
    if(lastClicked === x.target.dataset.header){
        if(lastSortOrder === 'asc')
            direction = 'desc';
        else
            direction = 'asc';
    }

    lastSortOrder = direction;
    lastClicked = x.target.dataset.header;
    callback("&$orderby=" + x.target.dataset.header + " " + direction)
}

function fillData(target_selector, template_selector, data) {
    var target = document.querySelector(target_selector);
    var rows = $(target_selector);
    rows.empty();
    var template = document.querySelector(template_selector);
    for (var i = 0; i < data.length; i++) {
        var clone = document.importNode(template.content, true);
        _.each(data[i], function (value, key, obj) {
            var itm = clone.querySelector('.' + key);
            if (!itm)
                return;
            itm.textContent = value;
            if(typeof value === 'number'){
                itm.textContent = value.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
            if(typeof value === 'string' && value.match(/^\d\d\d\d\-[0-1]\d\-\d\d$/gm)){
                itm.textContent = value;// new Date(value).toLocaleDateString('de-DE');
            }

        });
        target.appendChild(clone);
    }

}