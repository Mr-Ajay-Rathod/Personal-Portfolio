// Select all next and previous buttons
const pageTurnBtns = document.querySelectorAll('.nextprev-btn');
pageTurnBtns.forEach((btn, index) => {
    btn.onclick = () => {
        const pageTurnId = btn.getAttribute('data-page');
        const pageTurn = document.getElementById(pageTurnId);

        if (pageTurn.classList.contains('turn')) {
            pageTurn.classList.remove('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 20 - index;
            }, 500);
        } else {
            pageTurn.classList.add('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 20 + index;
            }, 500);
        }
    };
});

const pages = document.querySelectorAll('.book-page.page-right');
const contactMeBtn = document.querySelector('.btn.contact-me');

contactMeBtn.onclick = () => {
    pages.forEach((page, index) => {
        setTimeout(() => {
            page.classList.add('turn');
            setTimeout(() => {
                page.style.zIndex = 20 + index;
            }, 500);
        }, (index + 1) * 200 + 100);
    });
};

let totalPages = pages.length;
let pageNumber = 0 ;

function reverseindex(){
    pageNumber--;
    if(pageNumber<0){
        pageNumber = totalPages -1 ;
    }
}


const backProfileBtn = document.querySelector('.back-profile');

backProfileBtn.onclick = () => {
    pages.forEach((_, index) => {
        setTimeout(() => {
            reverseindex();
           pages[pageNumber].classList.remove('turn'); 
        
           setTimeout(() => {
            reverseindex();
           pages[pageNumber].style.zIndex= 10 + index;
           }, 500);
        
        },(index +1) *200+100 );
    })
    }



    const coverRight = document.querySelector('.cover.cover-right');
    const pageLeft = document.querySelector('.book-page.page-left');


    setTimeout(() => {
        coverRight.classList.add('turn');
    }, 2100);


    setTimeout(() => {
        coverRight.style.zIndex=-1;
    }, 2800);


    setTimeout(() => {
        pageLeft.style.zIndex=20;
    }, 3200);




    pages.forEach((_, index) => {
        setTimeout(() => {
            reverseindex();
           pages[pageNumber].classList.remove('turn'); 
        
           setTimeout(() => {
            reverseindex();
           pages[pageNumber].style.zIndex= 10 + index;
           }, 500);
        
        },(index +1) *200+ 2100 );
    })

    
// Placeholder for other functionalities that need to be implemented

// contact me button when click

// create reverse index function

// back profile button when click

// opening animation
// opening animation (cover right animation)
// opening animation (page left or profile page animation)
// opening animation (all page right animation)




const titles = ["C++ Developer", "Gradhub Educator", "Instructor", "Web Developer"];
let currentIndex = 0;
let isDeleting = false;
let charIndex = 0;
const typingSpeed = 100;
const deletingSpeed = 50;
const delayBetweenTitles = 2000;

function typeWriter() {
    const titleElement = document.querySelector('.dynamic-title');
    const currentTitle = titles[currentIndex];

    if (isDeleting) {
        titleElement.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % titles.length;
            setTimeout(typeWriter, 500); // Pause before typing the next title
        } else {
            setTimeout(typeWriter, deletingSpeed);
        }
    } else {
        titleElement.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentTitle.length) {
            isDeleting = true;
            setTimeout(typeWriter, delayBetweenTitles); // Pause before deleting
        } else {
            setTimeout(typeWriter, typingSpeed);
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(typeWriter, delayBetweenTitles);
});