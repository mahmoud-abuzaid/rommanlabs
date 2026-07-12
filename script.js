document.addEventListener("DOMContentLoaded", () => {

    const words = [
        "قطاع التجارة والتعاقدات",
        "قطاع المقاولات والبناء",
        "سلاسل الإمداد اللوجستية",
        "تتبع الأصول وإدارتها",
        "دمج ذوي الاحتياجات الخاصة"
    ];

    let i = 0;
    const el = document.getElementById("chip-text");

    function typeWord(word, done) {
        let ci = 0;
        el.textContent = "";
        function go() {
            if (ci < word.length) {
                ci++;
                el.textContent = word.substring(0, ci);
                setTimeout(go, 25 + Math.random() * 35);
            } else {
                if (done) setTimeout(done, 2000);
            }
        }
        go();
    }

    function eraseWord(word, done) {
        let ci = 1;
        function go() {
            if (ci < word.length) {
                el.textContent = word.substring(0, word.length - ci);
                ci++;
                setTimeout(go, 15 + Math.random() * 20);
            } else {
                el.textContent = "";
                if (done) setTimeout(done, 100);
            }
        }
        go();
    }

    function next() {
        i = (i + 1) % words.length;
        setTimeout(() => typeWord(words[i], next), 150);
    }

    function cycle() {
        eraseWord(words[i], next);
    }

    setTimeout(() => typeWord(words[0], cycle), 800);

    const btn = document.getElementById("theme-btn");
    const html = document.documentElement;
    const saved = localStorage.getItem("theme");
    if (saved) html.setAttribute("data-theme", saved);

    btn.addEventListener("click", () => {
        const cur = html.getAttribute("data-theme");
        const nxt = cur === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", nxt);
        localStorage.setItem("theme", nxt);
        btn.setAttribute("aria-label", nxt === "dark" ? "الوضع النهاري" : "الوضع الداكن");
    });

});
