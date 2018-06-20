'use strict';
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
    const url = "/b1s/v1/Login";
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

function updateTable(additional_filters, requestUrl){
    setLoadingState(true);

    if(!additional_filters)
        additional_filters = '';
    if(!requestUrl)
        requestUrl = "/b1s/v1/Orders?$filter=DocumentStatus eq 'bost_Open'&$select=DocEntry,DocNum,DocDate,CardCode,CardName,DocTotal,DocCurrency,U_ISSIGNED";

    remote("GET", requestUrl + additional_filters,
        function onError(e) {
            console.error(e);
           setLoadingState(false);
           window.location = "/login.html";

        },
        function onSuccess(result) {
            setLoadingState(false);
            prev_page_link = requestUrl + additional_filters;
            next_page_link = result["odata.nextLink"];

            fillData("#overview-body", '#sales-order-overview-row', result.value, hookArrowEvents);
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
        var docEntry = $(event.target.parentNode.parentNode.parentNode.children).filter("td.DocEntry")[0].innerText;
        console.log(docEntry);
        window.location = "/salesorder.html?DocEntry=" + encodeURI(docEntry);
    });
}

$(document).ready(function () {
    hookHeaderEvents(updateTable);
    hookPagingEvents(updateTable);
    hookArrowEvents();

    updateTable('&$orderby=DocNum desc');


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
