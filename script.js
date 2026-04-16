function loadHeader() {
    // 1. זיהוי הדף הנוכחי
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const headerHTML = `
        <div class="header-left-part"> 
            <strong>AniList-IL</strong> 
        </div>

        <nav class="header-center-part"> 
            <ul class="nav-links"> 
                <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">דף הבית</a></li>
                <li><a href="full-catalog.html" class="${currentPage === 'full-catalog.html' ? 'active' : ''}">קטלוג הסדרות המלא</a></li>
                <li><a href="add-anime.html" class="${currentPage === 'add-anime.html' ? 'active' : ''}">הוסף סדרה</a></li>
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

// הפעלת ההדר והחיפוש יחד
document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    setupSearch(); 
});