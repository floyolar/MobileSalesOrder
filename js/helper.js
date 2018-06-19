function getOffset(obj) {
    var offsetLeft = 0;
    var offsetTop = 0;
    do {
        if (!isNaN(obj.offsetLeft)) {
            offsetLeft += obj.offsetLeft;
        }
        if (!isNaN(obj.offsetTop)) {
            offsetTop += obj.offsetTop;
        }
    } while (obj = obj.offsetParent);
    return {left: offsetLeft, top: offsetTop};
}


function getCurrencies(callback){
    remote("GET","/b1s/v1/Currencies?$select=Code",function onError(){

        },
        function onSuccess(jsonResult){
            var arr = [];
            for(var i = 0; i < jsonResult.value.length; i++){
                arr.push(jsonResult.value[i].Code);
            }
            if(arr.indexOf("EUR") > 0){
                var x = arr.indexOf("EUR");
                var y = 0;
                var b = arr[y];
                arr[y] = arr[x];
                arr[x] = b;
            }
            callback(arr);
        });
}

function formattedDate(date){
    if(!date)
        date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    if(month <= 9)
        month = '0'+month;

    var day= date.getDate();
    if(day <= 9)
        day = '0'+day;

    return day + "." + month + '.'+ year;
}

function fillData(target_selector, template_selector, data, callback, skip_clear_items, override_setValue) {

    var target;


    if(typeof target_selector !== "string"){
        target = target_selector;
    }
    else{
        target = document.querySelector(target_selector);
    }

    var rows = $(target_selector);
    if (!skip_clear_items)
        rows.empty();
    var template = document.querySelector(template_selector);

    for (var i = 0; i < data.length; i++) {
        var clone = document.importNode(template.content, true);
        _.each(data[i], function (value, key, obj) {
            var itm = clone.querySelector('.' + key);
            if (!itm)
                return;

            itm.textContent = value;
            if (typeof value === 'number') {
                if (itm.classList.contains("number-format")) {
                    itm.textContent = value.toLocaleString('de-DE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                else {
                    //itm.textContent = value.toLocaleString('de-DE');
                }

            }
            if (typeof value === 'string' && value.match(/^\d\d\d\d\-[0-1]\d\-\d\d$/gm)) {
                itm.textContent = value;// new Date(value).toLocaleDateString('de-DE');
            }
            // if(setValue)
            //     itm.value = value;
            if(override_setValue)
                itm = override_setValue(itm, value, obj);

        });
        target.appendChild(clone);

    }
    if (callback)
        callback();

}


function remote(method, path, error, success, data) {
    document.cookie = "B1SESSION=" + localStorage.getItem("session") + "; ROUTEID=.node0";
    var req = new XMLHttpRequest();
    req.open(method, path, true); // force XMLHttpRequest2
    //req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

    req.setRequestHeader('Accept', 'application/json');
    if (data)
        req.setRequestHeader("Content-Type", "application/json");

    req.setRequestHeader('postman-token', localStorage.getItem("session"));
    //req.withCredentials = true; // pass along cookies
    req.onerror = error;
    req.onreadystatechange = function () {
        if (req.readyState === 4 && (req.status === 200)) {
            var result = JSON.parse(req.responseText);
            console.log(result);
            success(result);
        }
        if (req.status === 204) {
            success(null);
        }
    };
    req.send(JSON.stringify(data));
}
