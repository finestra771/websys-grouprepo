/*
* Effectively Serves as a Scroll Event Listener
*/

window.addEventListener('scroll', function() {
    const navbar = document.querySelector("nav");
    navbar.classList.add('nav-dimmed');
});

window.addEventListener("scrollend", (event) => {
    const navbar = document.querySelector("nav");
    navbar.classList.remove('nav-dimmed');
});


$(document).ready(() => {
    $('#link0').click(function (e) {
        e.preventDefault(); 
        $('html, body').animate({
            scrollTop: $('#home').offset().top
        }, 700);
    });
    $('#link1').click(function (e) {
        e.preventDefault(); 
        $('html, body').animate({
            scrollTop: $('#home').offset().top
        }, 700);
    });

    $('#link2').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#stonkly-info').offset().top - 100
        }, 700);
    });

    $('#link3').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#about-us').offset().top   //update to why we build this
        }, 700);
    });

    $('#link4').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#contacts').offset().top
        }, 700);
    });
});
