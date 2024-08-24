document.getElementById("more-info-btn").addEventListener("click", function() {
    document.getElementById("modal").style.display = "flex";
});

document.getElementById("close-modal").addEventListener("click", function() {
    document.getElementById("modal").style.display = "none";
});

window.onclick = function(event) {
    if (event.target === document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";
    }
}