// ===============================
// 🔥 REVELAR ELEMENTOS AO ROLAR
// ===============================

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

window.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".card, .stat, .section");

    elements.forEach((el) => {
        el.classList.add("hidden");
        observer.observe(el);
    });
});


// ===============================
// 🔢 CONTADOR ANIMADO
// ===============================

function animateCounters() {
    const stats = document.querySelectorAll(".stat h3");

    stats.forEach((stat) => {
        const text = stat.innerText;

        if (!text.includes("+")) return;

        const target = parseInt(text.replace(/\D/g, ""));
        if (isNaN(target)) return;

        let count = 0;
        const speed = Math.max(1, target / 100);

        function update() {
            count += speed;

            if (count < target) {
                stat.innerText = Math.floor(count) + "+";
                requestAnimationFrame(update);
            } else {
                stat.innerText = target + "+";
            }
        }

        update();
    });
}


// ===============================
// 🧭 NAVBAR DINÂMICA
// ===============================

window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    navbar.style.background =
        window.scrollY > 100
            ? "rgba(5,8,22,.95)"
            : "rgba(5,8,22,.65)";
});


// ===============================
// 🌄 PARALLAX (SE HERO EXISTIR)
// ===============================

window.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const offset = window.pageYOffset;
    hero.style.backgroundPositionY = offset * 0.3 + "px";
});


// ===============================
// 🚀 INICIALIZAÇÃO SEGURA
// ===============================

window.addEventListener("load", () => {
    animateCounters();
});
