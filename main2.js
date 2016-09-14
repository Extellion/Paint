function hide() {
    document.addEventListener("click",function ()
    {
        // var img = document.getElementById("img1");

        // $("#imgLol").slideUp("slow");
        // $("#imgMDR").slideDown("slow");

        $("#container").show();
        $("#none").fadeOut(1250, "linear");
        $("#imgMDR").animate({"margin-top": "-1000px", "opacity": "0"}, 1500, function() {
            $("#tools").fadeIn("slow");
            $("#container-colors").fadeIn("slow");
        });
        $("#imgMDR").animate({"margin-bottom": "2000px","opacity": "0"}, 1500);
        $("#imgLol").animate({"margin-top": "2000px","opacity": "0"}, 1500);
        $("#imgLol").animate({"margin-bottom": "-1000px", "opacity": "0"}, 1500);
    });
}
hide();