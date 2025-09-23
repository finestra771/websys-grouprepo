var collArticles = document.getElementsByClassName("collapsible-article");
var collAmendments = document.getElementsByClassName("collapsible-amendment");

//this just makes it so both lists can have same effects
var allColl = [...collArticles, ...collAmendments];

//go through all entries and see if user clicked
for (let i = 0; i < allColl.length; i++) {
  allColl[i].addEventListener("click", function() {
    var content = this.nextElementSibling;

    //if they clicked one, close all others
    for (let j = 0; j < allColl.length; j++) {
      if (allColl[j] !== this && allColl[j].classList.contains("active")) {
        $(allColl[j].nextElementSibling).slideUp(500, 'swing');
        allColl[j].classList.remove("active");
      }
    }

    //make clicked one active and open it
    $(content).slideToggle(500, 'swing');
    this.classList.toggle("active");
  });
}

// this is for scrolling to sections
$(document).ready(() => {
    $('#link1').click(function (e) {
        e.preventDefault(); 
        $('html, body').animate({
            scrollTop: $('#header').offset().top - 198
        }, 700);
    });

    $('#link2').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#articles').offset().top - 198
        }, 700);
    });

    $('#link3').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#amendments').offset().top - 198
        }, 700);
    });
});
