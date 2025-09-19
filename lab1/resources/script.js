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
    $('#link1').click(function (e) {
        e.preventDefault(); 
        $('html, body').animate({
            scrollTop: $('#home').offset().top
        }, 700);
    });

    $('#link2').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#gallery').offset().top
        }, 700);
    });

    $('#link3').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#about-us').offset().top
        }, 700);
    });

    $('#link4').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#contacts').offset().top
        }, 700);
    });
});
