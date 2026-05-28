// ייבוא החיבורים למסד הנתונים ולמערכת האימות והמשתמשים מהקובץ firebase.js
import { db, auth, provider } from './firebase.js';
// ייבוא פונקציות ספציפיות מ-Firestore שדרושות לשליפה והוספה של נתונים
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
// ייבוא הפונקציה האחראית על פתיחת חלון התחברות קופץ עבור המשתמש מפייר בייס
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"; 

function loadHeader(user) {
    // חילוץ שם הקובץ הנוכחי מהכתובת בדפדפן. אם ריק, ברירת המחדל היא index.html
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    let connected;
    if(user){ // אם המשתמש מחובר
        connected = `<span class="user-name">שלום, ${user.displayName}</span>
        <button id="logout-btn" class="logout-link">התנתקות</button>`;
    }
    else{
        connected = `<a href="login.html" class="login-link">התחברות / הרשמה</a>`;
    }
    // שמירת כל מבנה ה-HTML של תפריט הניווט העליון (Header) בתוך משתנה טקסט
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
            ${connected}
        </div>
    `;

    // איתור אלמנט ה-Header במסמך ה-HTML
    const headerElement = document.getElementById("main-header");
    // אם האלמנט קיים בעמוד, הזרקת ה-HTML שנשמר במשתנה לתוכו
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
    }
    // האזנה לכפתור ההתנתקות במידה והמשתמש מחובר
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn){
        logoutBtn.addEventListener('click', async () => {
            try{
                await signOut(auth);
                console.log("התנתקות הצליחה עבור המשתמש");
            // רענון לעמוד לאחר התנתקות
                window.location.href = 'index.html';
            }
            catch(error){
                console.error("שגיאה בתהליך ההתנתקות:", error.message);
            }
        })
    }
}

// יצירת מערך ריק שישמש לאחסון מקומי של כל הסדרות שיימשכו ממסד הנתונים
let seriesData = [];

// פונקציה אסינכרונית לשליפת נתונים ממסד הנתונים (כי מדובר בבקשת רשת שלוקחת זמן)
async function loadSeriesFromFirestore() {
    try {
        console.log("מתחיל למשוך נתונים מ-Firebase...");
        // שליחת בקשה למשיכת כל המסמכים מתוך האוסף (collection) שנקרא "series"
        const querySnapshot = await getDocs(collection(db, "series"));
        
        seriesData = []; // איפוס המערך כדי למנוע כפילויות במידה והפונקציה רצה שוב
        
        // מעבר בלולאה על כל מסמך שחזר ממסד הנתונים
        querySnapshot.forEach((doc) => {
            console.log("נמצאה סדרה בענן:", doc.data());
            // הוספת הנתונים של המסמך (doc.data) לתוך המערך המקומי
            seriesData.push(doc.data());
        });

        console.log("מעביר את הנתונים לציור על המסך...");
        // קריאה לפונקציה שמעדכנת את תצוגת ה-HTML עם הנתונים שנמשכו
        renderSeries(seriesData); 

    } catch (error) {
        // במידה ויש שגיאה בבקשת הרשת, הדפסתה לקונסול
        console.error("שגיאה בטעינת הנתונים: ", error);
    }
}

function setupAddSeriesForm() {
    // איתור טופס הוספת הסדרה לפי ה-ID שלו
    const addForm = document.getElementById('add-series-form');

    // אם הטופס לא קיים בדף הנוכחי, הפונקציה עוצרת כאן כדי למנוע שגיאות
    if (!addForm) return;

    // הוספת מאזין לאירוע 'submit' (שליחת הטופס)
    addForm.addEventListener('submit', async (event) => {
        // עצירת התנהגות ברירת המחדל של הדפדפן (מונעת רענון של העמוד)
        event.preventDefault();
        
        // בדיקה האם המשתמש הנוכחי אינו מחובר למערכת
        if (!auth.currentUser) {
            // איסוף הנתונים שהאורח כבר הספיק למלא בשדות
            const pendingData = {
                title: document.getElementById('title').value,
                image: document.getElementById('images').value,
                genre: document.getElementById('genre').value,
                description: document.getElementById('description').value,
            };
            // שמירת האובייקט בזיכרון של הדפדפן
            localStorage.setItem('pendingSeries', JSON.stringify(pendingData));

            // שאלת המשתמש האם לעבור להתחבר
            const goToLogin = confirm("אופס! כדי להוסיף סדרה לקטלוג עליך להיות מחובר. הנתונים שלך נשמרו, האם לעבור לדף ההתחברות?");

            // אם המשתמש לחץ על אישור
            if (goToLogin) {
                window.location.href = 'login.html'; // העברה לדף ההתחברות
            }
            
            return; // עצירת המשך הפונקציה בכל מקרה, כדי שהטופס לא יישלח לפייר בייס
        }

        // משיכת הערכים שהוזנו בשדות הטופס
        const title = document.getElementById('title').value;
        const image = document.getElementById('images').value;
        const genre = document.getElementById('genre').value;
        const description = document.getElementById('description').value;
        
        // איתור כפתור הרדיו של הדירוג שנבחר
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        // המרת ערך הדירוג למספר שלם, או הגדרתו כ-0 אם לא נבחר כלום
        const ratingValue = selectedRating ? parseInt(selectedRating.value) : 0;

        // בניית אובייקט חדש המכיל את כל הנתונים, מוכן לשליחה לענן
        const newSeries = {
            id: Date.now(),  // שימוש בחותמת הזמן הנוכחית כמזהה ייחודי לסדרה
            title: title,
            genre: genre,
            rating: ratingValue,
            image: image,
            description: description
        };

        try {
            // בקשה להוספת האובייקט החדש כמסמך לאוסף "series" בפיירבייס
            await addDoc(collection(db, "series"), newSeries);
            
            console.log("הסדרה נשמרה בענן בהצלחה!");
            
            // איתור אלמנט הודעת ההצלחה והצגתו על ידי הסרת קלאס ההסתרה
            const successMsg = document.getElementById('success-message');
            successMsg.classList.remove('hidden');

            // הפעלת טיימר המסתיר בחזרה את הודעת ההצלחה לאחר 3 שניות
            setTimeout(function() {
                successMsg.classList.add('hidden');
            }, 3000);
            
            // ניקוי כל השדות בטופס לאחר שליחה מוצלחת
            addForm.reset();

        } catch (error) {
            // טיפול בשגיאה במקרה שהשמירה נכשלה
            console.error("שגיאה בהוספת הסדרה: ", error);
            alert("הייתה בעיה בשמירת הסדרה, אנא נסו שוב.");
        }
    });
}

// פונקציה לטיפול בחיפוש המהיר
function setupSearch() {
    // איתור שדה החיפוש, אזור התצוגה, ואזור ההצעה האחרונה
    const searchInput = document.getElementById('quickSearch');
    const container = document.getElementById('series-catalog-container');
    const latestSection = document.getElementById('latest-suggestion');
    // איתור הטופס שעוטף את שדה החיפוש
    const searchForm = searchInput ? searchInput.closest('form') : null;
    
    // עצירת הפונקציה אם אלמנטים הכרחיים חסרים בדף
    if (!searchInput || !container) return;

    // מניעת רענון דף כאשר לוחצים אנטר בתוך שדה החיפוש
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // הוספת מאזין המופעל בכל פעם שמוקלד תו בשדה החיפוש
    searchInput.addEventListener('input', (e) => {  
        // ניקוי רווחים מההתחלה והסוף, והמרת הטקסט לאותיות קטנות (לאנגלית)
        const searchTerm = e.target.value.trim().toLowerCase();

        // בדיקה האם שדה החיפוש ריק
        if (searchTerm === "") {
            container.innerHTML = ""; // ניקוי אזור התוצאות
            container.style.display = "none"; // הסתרת אזור התוצאות
            // החזרת אזור "הסדרה האחרונה" לתצוגה אם קיים
            if (latestSection) latestSection.style.display = "block"; 
            return;
        }
        
        // סינון המערך הראשי והחזרת רק סדרות שהכותרת שלהן מכילה את טקסט החיפוש
        const filteredSeries = seriesData.filter(series => 
            series.title.toLowerCase().includes(searchTerm)
        );

        if (filteredSeries.length > 0) {
            // אם נמצאו תוצאות, הסתרת ההצעה האחרונה
            if (latestSection) latestSection.style.display = "none";
            container.classList.add('show-results'); 
            // ציור התוצאות המסוננות על המסך
            renderSeries(filteredSeries);
        } else {
            // במקרה שאין תוצאות, הצגת הודעה מתאימה בתוך הקונטיינר
            container.innerHTML = "<p class='no-results-msg'>לא מצאנו סדרה כזו... אולי תוסיפו אותה?</p>";
            container.classList.add('show-results');
        }
    });
}

// פונקציה לייצור אלמנטי HTML והצגתם בקונטיינר
function renderSeries(data) {
    const container = document.getElementById('series-catalog-container');
    if (!container) return; // עצירה אם הקונטיינר אינו קיים בדף

    container.innerHTML = ""; // ניקוי התוכן הקודם בקונטיינר לפני ציור מחדש

    // מעבר על מערך הנתונים (המלא או המסונן) שהתקבל כארגומנט
    data.forEach(series => {
        // יצירת מבנה HTML עבור כל כרטיסיית סדרה. שימוש בתמונת placeholder אם אין תמונה.
        const cardHTML = `
            <div class="series">
                <img src="${series.image || 'https://placehold.co/200x300'}" alt="${series.title}">
                <h3>${series.title}</h3>
                <div class="rating-display">⭐ ${series.rating}/5</div>
                <h4 class="more-info-btn" 
                data-title="${series.title}" 
                data-description="${series.description}" 
                data-image="${series.image || ''}">
                למידע נוסף
                </h4>
        `;
        // שרשור ה-HTML שנוצר לתוך הקונטיינר
        container.innerHTML += cardHTML;
    });
}

// פונקציה להזרקת נתונים ספציפיים לתוך המודל
function openModal(series) {
    // השמת ערכי הסדרה לתוך אלמנטי הטקסט והתמונה במודל
    document.getElementById('modal-title').innerText = series.title;
    document.getElementById('modal-description').innerText = series.description;
    document.getElementById('modal-image').src = series.image;
    document.getElementById('modal-rating').innerText = `דירוג: ⭐ ${series.rating}/5`;
    
    // הצגת המודל על ידי הסרת קלאס ההסתרה
    document.getElementById('series-modal').classList.remove('hidden');
}

// פונקציה לאיתור והצגת הסדרה החדשה ביותר
function renderLatestSeries() {
    // איתור אזור "ההצעה האחרונה" ואלמנט ה-article בתוכו
    const latestSection = document.getElementById('latest-suggestion');
    const articleElement = latestSection ? latestSection.querySelector('article') : null;
    
    // מניעת ריצה אם האלמנטים לא קיימים או שאין נתונים במערך
    if (!latestSection || !articleElement || seriesData.length === 0) return;

    // שימוש בפונקציית reduce כדי למצוא את האובייקט בעל ה-ID (חותמת הזמן) הגבוה ביותר
    const latestSeries = seriesData.reduce((prev, current) => {
        return (prev.id > current.id) ? prev : current;
    });

    // הזרקת פרטי הסדרה החדשה ביותר לתוך ה-HTML
    articleElement.innerHTML = `
        <img src="${latestSeries.image || 'https://placehold.co/150x100'}" alt="${latestSeries.title}" width="150"> 
        <h3>${latestSeries.title}</h3>
        <p>ז'אנר: <strong>${latestSeries.genre || 'כללי'}</strong></p> 
        <h4 class="more-info-btn" 
        data-title="${latestSeries.title}" 
        data-description="${latestSeries.description}" 
        data-image="${latestSeries.image || ''}">
        למידע נוסף
        </h4>
    `;
}
// פתיחת המודל
function setupModalOpening() {
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('more-info-btn')) {
            console.log("לחצו על כפתור מידע נוסף!");
            
            // שליפת המידע המאוחסן ישירות מהתגיות של הכפתור
            const title = e.target.getAttribute('data-title');
            const description = e.target.getAttribute('data-description');
            const image = e.target.getAttribute('data-image');
            
            // עדכון הנתונים בתוך המודל
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-description').textContent = description;
            document.getElementById('modal-image').src = image || 'https://via.placeholder.com/150';
            
            // הצגת המודל
            const modal = document.getElementById('series-modal');
            modal.classList.remove('hidden');
            modal.style.display = 'block';
        }
    });
}
// פונקציה לטיפול באירועי סגירת המודל (Pop-up)
function setupModalClosing() {
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('series-modal');

    // הוספת מאזין לחיצה לכפתור ה-X, שמוסיף חזרה את קלאס ההסתרה
    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // הוספת מאזין לחיצה על האובייקט הגלובלי window לסגירה בלחיצה בחוץ
    window.addEventListener('click', (event) => {
        // בדיקה האם האלמנט שנלחץ הוא הרקע של המודל ולא התוכן הפנימי שלו
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
}

// פונקציה המנהלת את תפריט הסינונים בקטלוג
function setupFilters() {
    const filterBar = document.querySelector('.filter-bar');
    const openBtn = document.querySelector('.open-filter-btn');

    // איתור אלמנטי הבחירה לסינון
    const genreSelect = document.getElementById('genre-filter');
    const ratingSelect = document.getElementById('rating-filter');
    const resetBtn = document.querySelector('.filter-bar .cancel-btn');

    // הוספת טוגל (הצגה/הסתרה) לסרגל הסינונים בלחיצה על הכפתור
    if (openBtn && filterBar) {
        openBtn.addEventListener('click', () => {
            filterBar.classList.toggle('open');
        });
    }

    // הפונקציה הפנימית שמבצעת את סינון הנתונים 
    function applyFilters() {
        const selectedGenre = genreSelect.value;
        const selectedRating = ratingSelect.value;

        // יצירת מערך חדש המכיל רק אובייקטים שעומדים בתנאי הסינון
        const filteredData = seriesData.filter(series => {
            // בדיקה אם לא נבחר ז'אנר ("סינון...") או שהז'אנר תואם
            const genreMatch = selectedGenre.includes("סינון") || series.genre === selectedGenre;
            
            // בדיקה אם לא נבחר דירוג או שהדירוג תואם
            const ratingMatch = selectedRating.includes("סינון") || series.rating == selectedRating;

            // הפריט נשמר במערך המסונן רק אם הוא עומד בשני התנאים
            return genreMatch && ratingMatch;
        });

        // קריאה לפונקציית הציור עם המערך המסונן
        renderSeries(filteredData);
    }

    // הוספת מאזיני אירועים מסוג 'change' לשדות הבחירה, המפעילים את הסינון
    if (genreSelect) genreSelect.addEventListener('change', applyFilters);
    if (ratingSelect) ratingSelect.addEventListener('change', applyFilters);

    // טיפול בלחיצה על כפתור איפוס הסינונים
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // החזרת ה-select לאינדקס 0 (אפשרות ברירת המחדל)
            genreSelect.selectedIndex = 0;
            ratingSelect.selectedIndex = 0;
            // ציור הקטלוג מחדש עם כל הנתונים
            renderSeries(seriesData); 
        });
    }
}

// הפונקציה שמכינה ומציגה את נתוני הסדרה בחלון הקופץ (מודל)
function showSeriesDetails(series) {
    const modal = document.getElementById('series-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.getElementById('close-modal');
    
    if (!modal || !modalTitle || !modalDesc) return;

    // הזרקת המידע מתוך האובייקט לתוך אלמנטי ה-HTML של המודל
    modalTitle.innerText = series.title;
    modalDesc.innerText = series.description || "אין תקציר זמין לסדרה זו.";
    
    if (modalImage) {
        // טיפול בתמונה: שימוש ב-placeholder אם ערך התמונה חסר
        modalImage.src = series.image || 'https://placehold.co/400x300?text=No+Image';
        modalImage.alt = series.title;
    }
    
    // שינוי הגדרות התצוגה ב-CSS של המודל כדי שיופיע במסך
    modal.classList.remove('hidden');
    modal.style.display = "block";

    // הגדרת פעולת הסגירה על כפתור ה-X
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
            modal.style.display = "none";
        };
    }

    // הגדרת פעולת סגירה נוספת עבור לחיצה מחוץ לתוכן המודל
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.style.display = "none";
        }
    };
}

// איתור אלמנט הקטלוג הגלובלי להוספת האזנה (Delegation)
const globalCatalogContainer = document.getElementById('series-catalog-container');
if (globalCatalogContainer) {
    // מאזין לכל לחיצה בתוך הקונטיינר
    globalCatalogContainer.addEventListener('click', (e) => {
        // בדיקה האם האלמנט שנלחץ ספציפית הוא כפתור "מידע נוסף"
        if (e.target.classList.contains('more-info-btn')) {
            console.log("לחצו על כפתור!"); 
            
            // שליפת המזהה (ID) שנשמר על גבי הכפתור
            const seriesId = e.target.getAttribute('data-id');
            console.log("ID של הסדרה:", seriesId); 
            
            // שימוש בפונקציה find כדי למצוא את האובייקט במערך הראשי לפי ה-ID
            const selectedSeries = seriesData.find(s => s.id == seriesId);
            
            if (selectedSeries) {
                // הפעלת הפונקציה להצגת המודל עם הנתונים שנמצאו
                showSeriesDetails(selectedSeries); 
            } else {
                console.error("לא הצלחתי למצוא את הסדרה עם ה-ID הזה במערך.");
            }
        }
    });
}

// קריאה לפונקציית הגדרת הסינונים מיד עם בניית עץ ה-DOM
document.addEventListener('DOMContentLoaded', setupFilters);

// בלוק האתחול הראשי - מופעל עם סיום טעינת ה-HTML הראשוני
document.addEventListener("DOMContentLoaded", async () => {
    // מאזין של פיירבייס שבודק בכל טעינת דף האתר האם יש משתמש מחובר
    onAuthStateChanged(auth, (user) => {
        // קריאה מחדש לפונקציית ההדר ושליחת מצב המשתמש הנוכחי אליה
        loadHeader(user); 
        
        if (user) { // בדיקה האם המשתמש מחובר
            console.log("המערכת זיהתה משתמש מחובר:", user.displayName);

            // בדיקה האם יש משהו שמור בזכרון הדפדפן!
            if (localStorage.getItem('pendingSeries')) {
                // שמירת מה שיש בזכרון הדפדפן בתור משתנה שרשרת
                const savedData = JSON.parse(localStorage.getItem('pendingSeries'));
                
                // הגדרת השדות בהתאם למה שנשמר
                document.getElementById('title').value = savedData.title;
                document.getElementById('images').value = savedData.image; // תואם למה ששמרת בטופס
                document.getElementById('genre').value = savedData.genre;
                document.getElementById('description').value = savedData.description; // תיקון ה-s המיותרת
                
                // מחיקת המידע מזכרון האתר
                localStorage.removeItem('pendingSeries');
            }

        } else { // אם הוא לא מחובר
            console.log("אין משתמש מחובר - הגולש הנוכחי הוא אורח");
        }
    }); 
    await loadSeriesFromFirestore(); // המתנה למשיכת הנתונים מהענן
    setupSearch();  // הגדרת החיפוש
    setupAddSeriesForm(); // הגדרת טופס ההוספה
    setupModalOpening(); // פתיחת המודל
    setupModalClosing(); // הגדרת סגירת המודל
    renderLatestSeries(); // ציור הסדרה האחרונה (אם רלוונטי לדף)
    // איתור כפתור ההתחברות של גוגל
    const googleLoginBtn = document.getElementById('google-login-btn');
    
    // בדיקה האם כפתור ההתחברות של גוגל קיים בדף הנוכחי
    if (googleLoginBtn) {
        // הצמדת מאזין לחיצה אסינכרוני אל הכפתור
        googleLoginBtn.addEventListener('click', async () => {
            // ניסיון ביצוע התחברות עם הגנה מפני שגיאות (כמו סגירת החלון על ידי המשתמש)
            try {
                // הפעלת חלון הפופ-אפ של גוגל והמתנה לקבלת פרטי המשתמש המאובטחים
                const result = await signInWithPopup(auth, provider);
                
                // הדפסת הודעת הצלחה לקונסול יחד עם שם המשתמש שהתחבר
                console.log("התחברות הצליחה עבור המשתמש:", result.user.displayName);
                
                // העברה אוטומטית של הדפדפן לדף הבית לאחר שהאימות הצליח
                window.location.href = 'index.html';
                
            } catch (error) {
                // תפיסת השגיאה במידה וההתחברות נכשלה או בוטלה, והדפדפן לא יתרסק
                console.error("שגיאה בתהליך ההתחברות:", error.message);
            }
        }); // סגירת ה-addEventListener והפונקציה האסינכרונית שלו
    } // סגירת תנאי ה-if
}); // סגירת בלוק האתחול הראשי (DOMContentLoaded)