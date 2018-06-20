$(document).ready(function () {
    var prevUser = localStorage.getItem("username");
    if (prevUser) {
        $("#username").val(prevUser);
        $("#password").select();
    }
    else {
        $("#username").select();
    }
    $("#login").on("submit", function (event) {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();
        localStorage.setItem("username", username);
        setLoadingState(true);
        $.ajax({
            url: "/b1s/v1/Login",
            type: "POST",
            data: JSON.stringify({"CompanyDB": "SBODEMODE", "UserName": username, "Password": password}),
            error: function (err) {
                console.error(err);
                $("div.error").show();
                $("#err_message").text(err.responseJSON.error.message.value);
                setLoadingState(false);
            },
            success: function (response) {
                localStorage.setItem("session-raw", JSON.stringify(response));
                localStorage.setItem("session", response.SessionId);
                setLoadingState(false);
                window.location = '/index.html';
            }
        });
    });
});

function setLoadingState(newState) {
    if (!!newState) {
        $("#login > div > input").attr("disabled", "disabled");
    }
    else {
        $("#login > div > input").removeAttr("disabled");
    }
}