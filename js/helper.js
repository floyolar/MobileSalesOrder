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
    } while(obj = obj.offsetParent );
    return {left: offsetLeft, top: offsetTop};
}

function fillData(target_selector, template_selector, data, callback, skip_clear_items) {
    var target = document.querySelector(target_selector);
    var rows = $(target_selector);
    if(!skip_clear_items)
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
                if(key === 'DocTotal'){
                    itm.textContent = value.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                }
                else{
                    //itm.textContent = value.toLocaleString('de-DE');
                }

            }
            if(typeof value === 'string' && value.match(/^\d\d\d\d\-[0-1]\d\-\d\d$/gm)){
                itm.textContent = value;// new Date(value).toLocaleDateString('de-DE');
            }

        });
        target.appendChild(clone);
    }
    if(callback)
        callback();

}

function remote(method, path, error, success) {
    document.cookie = "B1SESSION=" + localStorage.getItem("session") + "; ROUTEID=.node0";
    var req = new XMLHttpRequest();
    req.open(method, path, true); // force XMLHttpRequest2
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
