const pswBtn = document.querySelector("#pswdBtn");
pswBtn.addEventListener("click", function() {
    const pswdInput = document.getElementById("pword");
    const type = pswdInput.getAttribute("type");
    if(type == "password") {
        pswdInput.setAttribute("type", "text");
        pswBtn.innerHTML = "Hide Password";
    } else {
        pswdInput.setAttribute("type", "password");
        pswBtn.innerHTML = "Show Password";
    }
});