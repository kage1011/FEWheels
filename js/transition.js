function goToPage(url) {
    localStorage.setItem("SMOKE_TRANSITION", "1");

    canvas.style.opacity = 1;
    running = true;
    smokes = [];
    animateSmoke();

    setTimeout(() => {
        window.location.href = url;
    }, 2000);
}


const canvas = document.getElementById("smoke-canvas");
const ctx = canvas.getContext("2d");

let smokes = [];
let running = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Smoke {
    constructor() {
        this.x = -100;
        this.y = Math.random() * canvas.height;
        this.size = 120 + Math.random() * 700;
        this.speed = 1.5 + Math.random() * 7;
        this.alpha = 0.15 + Math.random() * 0.15 * 3;
    }

    update() {
        this.x += this.speed;
        this.y += Math.sin(this.x * 0.01) * 0.3;
    }

    draw() {
        const g = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size
        );
        g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        g.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animateSmoke() {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (smokes.length < 20) {
        smokes.push(new Smoke());
    }

    smokes.forEach((s) => {
        s.update();
        s.draw();
    });

    smokes = smokes.filter((s) => s.x < canvas.width + s.size);

    requestAnimationFrame(animateSmoke);
}




// function startTransition(targetUrl) {
//     const overlay = document.getElementById('transition-overlay');

//     // 1. Ngay lập tức bật lớp phủ lên (hoặc đảm bảo nó đang bật)
//     overlay.style.opacity = 1;
//     overlay.style.transition = 'opacity 1s ease-in';

//     // 2. Chuyển hướng sau khi lớp phủ đã che kín màn hình (chúng ta giả định nó đã che kín)
//     // Đặt timeout ngắn, chỉ cần đủ để hiệu ứng mờ nhìn thấy được
//     setTimeout(() => {
//         window.location.href = targetUrl;
//     }, 500); // 500ms (0.5 giây) chờ đợi trước khi chuyển hướng
// }