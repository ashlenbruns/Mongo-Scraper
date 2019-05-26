$(document).ready(function(){

    //Any time a button is clicked evaluate saved status
    $("#btn-articles").on("click", function(event){
        location.reload();
    });

    // Add to saved
    $(".mark-saved").on("click", function(event){
        var $id = $(this.id).selector;
        var $savedStatus = $('#article-' + $id).attr("data-saved");
        var newSavedStatus;

        if ($savedStatus == "false"){
            newSavedStatus = {
                saved: true,
                buttonTxt: "Remove From Saved"
            }
            $('#article-' + $id).attr("data-saved", "true");
            $('#' + $id).text("Remove From Saved");
        }else{
            newSavedStatus = {
                saved: false,
                buttonTxt: "Save Article"
            }
            $('#article-' + $id).attr("data-saved", "false");
            $('#' + $id).text("Save Article");
        }
        
        console.log(newSavedStatus);

        $.ajax({
            url: "/articles/" + $id,
            type: "PUT",
            data: newSavedStatus
        }).then(
            function(){
                console.log("updated favorite status of Article #: " + $id + " to " +newSavedStatus.saved);
                location.reload();
            }
        );
    });

    // Scrape articles
    $("#btn-scrape").on("click", function(event){
        $.ajax({
            method: "GET",
            url: "/scrape"
        })
        .then(
            function(){
                alert("Successfully Scraped Articles!");
                window.location.href = "/";
            }
        );
    });

});