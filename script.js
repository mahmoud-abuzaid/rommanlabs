document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Theme Toggle Logic
    const themeToggleBtn = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
        htmlElement.setAttribute("data-theme", savedTheme);
    } else {
        htmlElement.setAttribute("data-theme", "dark");
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            // Apply micro-interaction class
            themeToggleBtn.classList.add("clicked");
            setTimeout(() => themeToggleBtn.classList.remove("clicked"), 400);

            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            htmlElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.observe-element').forEach(el => {
        observer.observe(el);
    });

    // 3. Advanced Fade + Typewriter Effect Logic
    const words = [
        "قطاع التجارة والتعاقدات",
        "قطاع المقاولات والبناء",
        "سلاسل الإمداد اللوجستية",
        "تتبع الأصول وإدارتها",
        "دمج ذوي الاحتياجات الخاصة"
    ];
    
    let currentWordIndex = 0;
    const dynamicText = document.getElementById("dynamic-text");
    const dynamicTextWrapper = document.getElementById("dynamic-text-wrapper");
    
    function typeWord(word, callback) {
        let charIndex = 0;
        dynamicText.innerHTML = "<span class='cursor'>|</span>";
        
        function typeChar() {
            if (charIndex < word.length) {
                charIndex++;
                dynamicText.innerHTML = word.substring(0, charIndex) + "<span class='cursor'>|</span>";
                
                let typingSpeed = 40 + Math.random() * 60;
                if (Math.random() < 0.1) typingSpeed += 100; // Human pause
                
                setTimeout(typeChar, typingSpeed);
            } else {
                if (callback) setTimeout(callback, 2500); // Wait after typing is done
            }
        }
        typeChar();
    }

    function changeWordCycle() {
        // Fade out the current word
        dynamicTextWrapper.classList.add('fade-out');
        
        setTimeout(() => {
            // After fading out, change the word index and clear text
            currentWordIndex = (currentWordIndex + 1) % words.length;
            const nextWord = words[currentWordIndex];
            dynamicText.innerHTML = "<span class='cursor'>|</span>";
            
            // Fade back in
            dynamicTextWrapper.classList.remove('fade-out');
            
            // Start typing the new word once it's visible again
            setTimeout(() => {
                typeWord(nextWord, changeWordCycle);
            }, 300); // Wait for fade-in to complete
        }, 400); // Match CSS transition duration
    }

    // Initialize first word typing with a slight delay
    setTimeout(() => {
        typeWord(words[0], changeWordCycle);
    }, 800);
});
