function loadHeader() {
    // 1. זיהוי הדף הנוכחי
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const headerHTML = `
        <div class="header-left-part"> 
            <strong>BingeList</strong>
        </div>

        <nav class="header-center-part"> 
            <ul class="nav-links"> 
                <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">דף הבית</a></li>
                <li><a href="full-catalog.html" class="${currentPage === 'full-catalog.html' ? 'active' : ''}">קטלוג הסדרות המלא</a></li>
                <li><a href="add-series.html" class="${currentPage === 'add-series.html' ? 'active' : ''}">הוסף סדרה</a></li>
                <li><a href="profile.html" class="${currentPage === 'profile.html' ? 'active' : ''}">הפרופיל שלי</a></li>
            </ul>
        </nav>
            
        <div class="header-right-part">
            <a href="login.html" class="login-link">התחברות / הרשמה</a>
        </div>
    `;

    const headerElement = document.getElementById("main-header");
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
    }
}

// מערך לסדרות האתר
const seriesData = [
    {
       id: 1, 
       title: "sName",
       genre: "action",
       rating: 1,
       image: "url",
       description: ""
    }, 
    {
       id: 2, 
       title: "sName",
       genre: "drama",
       rating: 2,
       image: "url",
       description: ""
    }
]

function setupAddSeriesForm() {
    // תופסים את הטופס ושומרים במשתנה
    const addForm = document.getElementById('add-series-form');

    // מוסיפים למשתנה מאזין
    addForm.addEventListener('submit', function(event) {
    // עצירת הדף מרענון
    event.preventDefault()
    // שאיבת ושמירת שם הסדרה
    const title = document.getElementById('title').value;
    // שאיבת ושמירת תמונת הסדרה
    const image = document.getElementById('images').value;
    // שאיבת ושמירת ג'אנר הסדרה
    const genre = document.getElementById('genre').value;
    // שאיבת ושמירת תיאור הסדרה
    const description = document.getElementById('description').value;
    // שאיבת הדירוג המסומן והפיכתו למספר
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    const ratingValue = selectedRating ? parseInt(selectedRating.value) : 0;

    const newSeries = {
        id: Date.now(), 
        title: title,
        genre: genre,
        rating: parseInt(selectedRating.value),
        image: image,
        description: description
    }

    // הוספה למערך
    seriesData.push(newSeries);

    // הודעת הצלחה למשתמש
    const successMsg = document.getElementById('success-message');

    //מורידים את מחלקת ההסתרה כדי שההודעה תוצג
    successMsg.classList.remove('hidden');

    // 3. משתמשים בטיימר כדי להחזיר את ההסתרה אחרי 3 שניות (3000 מילישניות)
    setTimeout(function() {
    successMsg.classList.add('hidden');}, 3000);
    // ניקוי הטופס (איפוס השדות)
    addForm.reset();    
    });
}

//פונקציה להוספת הסדרות לדף הקטלוג
function renderSeries(data){
    let container = document.getElementById('series-catalog-container');
    if (!container) return;
    container.innerHTML = "";
    document.getElementById('series-catalog-container');
    data.forEach((series) => {    
        const cardHTML = `<div class = "series">
        <img src ="${series.image}">
        <h3>${series.title}</h3>
        <h4>למידע נוסף</h4>
        </div>`;
        container.innerHTML += cardHTML;
});
}

// פונקציה לטופס החיפוש המהיר בדף הבית
function setupSearch() {
    // מוצאים את הטופס ואת שדה החיפוש לפי ה-ID שלהם ב-HTML
    const searchForm = document.querySelector('#quick-add form');
    const searchInput = document.getElementById('quickSearch');

    // מוודאים שאנחנו באמת נמצאים בדף שיש בו את החיפוש (כדי שלא תהיה שגיאה בדפים אחרים)
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(event) {
            // עוצר את רענון הדף האוטומטי
            event.preventDefault(); 
            
            // ניקוי רווחים מיותרים ממה שהמשתמש הקליד בהתחלה ובסוף
            const searchTerm = searchInput.value.trim();

            if (searchTerm !== '') {
                // הדפסה לקונסול כדי לוודא שזה עובד
                console.log('המשתמש חיפש את הסדרה:', searchTerm);
                
                // כאן נכניס בהמשך את הקוד שמעביר לדף הנכון!
            } else {
                alert('נא להקליד שם סדרה לפני החיפוש.');
            }
        });
    }
}

// פונקציה לניהול פתיחה וסגירה של סרגל הסינונים
function setupFilters() {
    const filterBar = document.querySelector('.filter-bar');
    const openBtn = document.querySelector('.open-filter-btn');

// אלמנטים של הסינון
    const genreSelect = document.getElementById('genre-filter');
    const ratingSelect = document.getElementById('rating-filter');
    const resetBtn = document.querySelector('.filter-bar .cancel-btn');

    if (openBtn && filterBar) {
        openBtn.addEventListener('click', () => {
            filterBar.classList.toggle('open');
        });
    }
// פונקציה שמבצעת את הסינון בפועל
    function applyFilters() {
        const selectedGenre = genreSelect.value;
        const selectedRating = ratingSelect.value;

        const filteredData = seriesData.filter(series => {
            // האם הז'אנר מתאים?
            const genreMatch = selectedGenre.includes("סינון") || series.genre === selectedGenre;
            
            // האם הדירוג מתאים?
            const ratingMatch = selectedRating.includes("סינון") || series.rating == selectedRating;

            return genreMatch && ratingMatch;
        });

        // הצגת הנתונים המסוננים
        renderSeries(filteredData);
    }

    // האזנה לשינויים בבחירה
    if (genreSelect) genreSelect.addEventListener('change', applyFilters);
    if (ratingSelect) ratingSelect.addEventListener('change', applyFilters);

    // כפתור ניקוי סינונים
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            genreSelect.selectedIndex = 0;
            ratingSelect.selectedIndex = 0;
            renderSeries(seriesData); // הצגת הכל מחדש
        });
    }
}

// קריאה לפונקציה כשהדף נטען
document.addEventListener('DOMContentLoaded', setupFilters);

// הפעלת ההדר, החיפוש ופונקציית הסדרות
document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    setupSearch(); 
    setupAddSeriesForm();
    renderSeries(seriesData);
});
