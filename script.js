import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
let seriesData = [];

// משיכת הנתונים מהפייר בייס
async function loadSeriesFromFirestore() {
    try {
        console.log("מתחיל למשוך נתונים מ-Firebase...");
        const querySnapshot = await getDocs(collection(db, "series"));
        
        seriesData = []; // איפוס המערך
        
        querySnapshot.forEach((doc) => {
            console.log("נמצאה סדרה בענן:", doc.data());
            seriesData.push(doc.data());
        });

        // כאן הקסם קורה: קוראים לפונקציה שלך עם המערך המלא
        console.log("מעביר את הנתונים לציור על המסך...");
        renderSeries(seriesData); 

    } catch (error) {
        console.error("שגיאה בטעינת הנתונים: ", error);
    }
}

function setupAddSeriesForm() {
    // תופסים את הטופס ושומרים במשתנה
    const addForm = document.getElementById('add-series-form');

    // אם הטופס לא קיים בדף הנוכחי, פשוט תצא מהפונקציה ואל תעשה כלום
    if (!addForm) return;

    // מוסיפים למשתנה מאזין
    addForm.addEventListener('submit', async (event) => {
        // עצירת הדף מרענון
        event.preventDefault();

        // שאיבת ושמירת הנתונים
        const title = document.getElementById('title').value;
        const image = document.getElementById('images').value;
        const genre = document.getElementById('genre').value;
        const description = document.getElementById('description').value;
        
        // שאיבת הדירוג המסומן והפיכתו למספר בטוח
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        const ratingValue = selectedRating ? parseInt(selectedRating.value) : 0;

        const newSeries = {
            id: Date.now(), 
            title: title,
            genre: genre,
            rating: ratingValue,
            image: image,
            description: description
        };

        // ניסיון לשמור בענן
        try {
            await addDoc(collection(db, "series"), newSeries);
            
            console.log("הסדרה נשמרה בענן בהצלחה!");
            
            // הודעת הצלחה למשתמש
            const successMsg = document.getElementById('success-message');
            successMsg.classList.remove('hidden');

            // משתמשים בטיימר כדי להחזיר את ההסתרה אחרי 3 שניות
            setTimeout(function() {
                successMsg.classList.add('hidden');
            }, 3000);
            
            // ניקוי הטופס פעם אחת בלבד
            addForm.reset();

        } catch (error) {
            console.error("שגיאה בהוספת הסדרה: ", error);
            alert("הייתה בעיה בשמירת הסדרה, אנא נסו שוב.");
        }
    });
}

// פונקציה לטופס החיפוש המהיר בדף הבית
function setupSearch() {
    const searchInput = document.getElementById('quickSearch');
    const container = document.getElementById('series-catalog-container');
    const latestSection = document.getElementById('latest-suggestion');
    const searchForm = searchInput ? searchInput.closest('form') : null;
    if (!searchInput || !container) return;
// מניעת רענון הדף בלחיצה על Enter
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    searchInput.addEventListener('input', (e) => {  
        const searchTerm = e.target.value.trim().toLowerCase();

        // אם החיפוש ריק להסתיר את הסדרות
        if (searchTerm === "") {
            container.innerHTML = ""; 
            container.style.display = "none"; 
            if (latestSection) latestSection.style.display = "block"; 
            return;
        }
        // אם יש טקסט בחיפוש
        const filteredSeries = seriesData.filter(series => 
            series.title.toLowerCase().includes(searchTerm)
        );

        if (filteredSeries.length > 0) {
            if (latestSection) latestSection.style.display = "none";
            container.classList.add('show-results'); // הצגת הקטלוג
            renderSeries(filteredSeries);
        } else {
            // אם חיפשנו ואין תוצאות
            container.innerHTML = "<p class='no-results-msg'>לא מצאנו סדרה כזו... אולי תוסיפו אותה?</p>";
            container.classList.add('show-results');
        }
    });
}

//פונקציה להוספת הסדרות לדף הקטלוג
function renderSeries(data) {
    const container = document.getElementById('series-catalog-container');
    if (!container) return;

    container.innerHTML = ""; // ניקוי הקונטיינר

    // ציור כל הכרטיסיות
    data.forEach(series => {
        const cardHTML = `
            <div class="series">
                <img src="${series.image || 'https://placehold.co/200x300'}" alt="${series.title}">
                <h3>${series.title}</h3>
                <div class="rating-display">⭐ ${series.rating}/5</div>
                <h4 class="more-info-btn" data-id="${series.id}">למידע נוסף</h4>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// פונקציה לפתיחת המודל
function openModal(series) {
    document.getElementById('modal-title').innerText = series.title;
    document.getElementById('modal-description').innerText = series.description;
    document.getElementById('modal-image').src = series.image;
    document.getElementById('modal-rating').innerText = `דירוג: ⭐ ${series.rating}/5`;
    
    document.getElementById('series-modal').classList.remove('hidden');
}

// פונקציה להצגת הסדרה האחרונה שנוספה בדף הבית
function renderLatestSeries() {
    const latestSection = document.getElementById('latest-suggestion');
    const articleElement = latestSection ? latestSection.querySelector('article') : null;
    
    // אם אנחנו לא בדף הבית או שעדיין אין סדרות במערך, נפסיק
    if (!latestSection || !articleElement || seriesData.length === 0) return;

    // מציאת הסדרה עם ה-ID הכי גדול (שזה בעצם התאריך הכי חדש)
    const latestSeries = seriesData.reduce((prev, current) => {
        return (prev.id > current.id) ? prev : current;
    });

    // מחליפים את נתוני הדמה בנתונים האמיתיים של הסדרה
    articleElement.innerHTML = `
        <img src="${latestSeries.image || 'https://placehold.co/150x100'}" alt="${latestSeries.title}" width="150"> 
        <h3>${latestSeries.title}</h3>
        <p>ז'אנר: <strong>${latestSeries.genre || 'כללי'}</strong></p> 
        <a href="javascript:void(0)" class="more-info-btn" data-id="${latestSeries.id}">למידע נוסף</a>
    `;
}

// פונקציה לסגירת המודל
function setupModalClosing() {
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('series-modal');

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // סגירה בלחיצה מחוץ לקופסה הלבנה
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
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

// מה קורה כשלוחצים על מידע נוסף
function showSeriesDetails(series) {
    const modal = document.getElementById('series-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image'); // תפסנו את התמונה
    const closeBtn = document.getElementById('close-modal');
    
    if (!modal || !modalTitle || !modalDesc) return;

    // מכניסים את הנתונים
    modalTitle.innerText = series.title;
    modalDesc.innerText = series.description || "אין תקציר זמין לסדרה זו.";
    
    // מכניסים את התמונה
    if (modalImage) {
        modalImage.src = series.image || 'https://placehold.co/400x300?text=No+Image';
        modalImage.alt = series.title;
    }
    
    // הצגת המודל
    modal.classList.remove('hidden');
    modal.style.display = "block";

    // סגירת המודל בלחיצה על ה-X
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
            modal.style.display = "none";
        };
    }

    // סגירת המודל בלחיצה מחוץ לחלון
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.style.display = "none";
        }
    };
}

// מאזין לחיצות גלובלי לקטלוג הסדרות)
const globalCatalogContainer = document.getElementById('series-catalog-container');
if (globalCatalogContainer) {
    globalCatalogContainer.addEventListener('click', (e) => {
        // בודקים אם מה שלחצנו עליו מכיל את הקלאס של המידע נוסף
        if (e.target.classList.contains('more-info-btn')) {
            console.log("לחצו על כפתור!"); // בדיקה לקונסול
            
            const seriesId = e.target.getAttribute('data-id');
            console.log("ID של הסדרה:", seriesId); // בדיקה לקונסול
            
            // חיפוש הסדרה במערך הנתונים הכללי
            const selectedSeries = seriesData.find(s => s.id == seriesId);
            
            if (selectedSeries) {
                showSeriesDetails(selectedSeries); // הפעלת המודל
            } else {
                console.error("לא הצלחתי למצוא את הסדרה עם ה-ID הזה במערך.");
            }
        }
    });
}

// קריאה לפונקציה כשהדף נטען
document.addEventListener('DOMContentLoaded', setupFilters);

// הפעלת ההדר, החיפוש ופונקציית הסדרות
document.addEventListener("DOMContentLoaded", async () => {
    loadHeader();
    await loadSeriesFromFirestore();
    setupSearch(); 
    setupAddSeriesForm();
    setupModalClosing();
    renderLatestSeries();
});
