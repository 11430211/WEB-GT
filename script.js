document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    // 全局狀態：是否處於崩壞模式
    let isGlitchMode = false;

    // 工具函式：亂碼生成器 (用於紅字模式的文字跳動)
    const getRandomStr = (len) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        let str = "";
        for (let i = 0; i < len; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    };

    // --- 1. 導航欄互動 ---
    
    // 切換手機版選單 (加入判斷避免在詳細頁面報錯)
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 點擊連結後自動關閉選單
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // --- 2. 捲動淡入動畫 (Scroll Animation) ---
    const observerOptions = {
        threshold: 0.2 // 當元素出現 20% 時觸發
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    // 偵測所有需要動畫的元素
    const hiddenElements = document.querySelectorAll('.hidden, .hidden-left, .hidden-right');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- 3. 敘事轉場 (Narrative Glitch Trigger) ---
    const aboutSection = document.getElementById('about');
    const projectTrigger = document.querySelector('.video-container, .project-img'); // 專案頁面的觸發點
    const narrativeOverlay = document.getElementById('narrative-overlay');
    
    // 判斷當前頁面類型並設定參數
    let triggerElement = null;
    let storageKey = '';
    let targetContainer = null; // 要套用崩壞樣式的容器
    let textSelector = '';

    if (aboutSection) {
        // 首頁模式
        triggerElement = aboutSection;
        storageKey = 'hasGlitched';
        targetContainer = aboutSection;
        textSelector = '.about-text p';
    } else if (projectTrigger) {
        // 專案頁面模式
        triggerElement = projectTrigger;
        storageKey = 'hasProjectGlitched'; // 專案頁面共用同一個 key
        targetContainer = projectTrigger.closest('.container');
        textSelector = '.about-content p';
    }

    let glitchCount = sessionStorage.getItem(storageKey) ? 1 : 0;

    if (triggerElement && narrativeOverlay && targetContainer) {
        window.addEventListener('scroll', () => {
            const rect = triggerElement.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.2; // 觸發點設定

            // 當「關於我」區塊的底部 離開畫面 或 接近頂部時觸發
            if (rect.bottom < triggerPoint) {
                
                // --- 第一次觸發 ---
                if (glitchCount === 0) {
                    glitchCount++; // 鎖定，避免重複觸發
                    sessionStorage.setItem(storageKey, 'true'); // 記錄已觸發狀態到瀏覽器

                    // A. 啟動轉場：顯示遮罩、開始震動、背景雜訊
                    // 修正：只震動內容元素，確保 overlay 的 fixed 定位正常運作
                    const contentToShake = document.querySelectorAll('nav, section, footer, #bg-canvas');
                    contentToShake.forEach(el => el.classList.add('screen-shake'));
                    
                    document.body.style.overflow = 'hidden'; // 暫時鎖定捲動
                    narrativeOverlay.classList.add('active');
                    isGlitchMode = true; // 啟動背景雜訊

                    // B. 設定 1 秒後恢復 (遮罩消失)
                    setTimeout(() => {
                        // 解除捲動鎖定
                        document.body.style.overflow = '';

                        // 強制拉回觸發區塊
                        triggerElement.scrollIntoView({ behavior: 'auto', block: 'center' });

                        // 停止震動，移除遮罩
                        contentToShake.forEach(el => el.classList.remove('screen-shake'));
                        narrativeOverlay.classList.remove('active');

                        // C. 進入紅字崩壞模式 (維持 0.5 秒)
                        targetContainer.classList.add('glitched-mode');

                        // 文字內容出現動態亂碼
                        const text = targetContainer.querySelector(textSelector);
                        let glitchInterval;
                        let originalText = ''; // 儲存原始文字以便還原

                        if(text) {
                            originalText = text.innerHTML; // 記錄當前頁面的原始文字

                            // 啟動持續變動的亂碼效果 (每 100ms 更新一次)
                            glitchInterval = setInterval(() => {
                                const random36 = getRandomStr(36); // 36個字元的亂碼
                                const randomRed1 = getRandomStr(2);
                                const randomRed2 = getRandomStr(1);
                                const randomErr = "FATAL_" + getRandomStr(8); // 紅字變成不同字樣

                                text.innerHTML = `探索數位與實體的邊界，專注於演<span style='color:red'>${randomRed1}</span>生成的視覺美學。我使用程式碼作為 <span style='color:var(--accent-color)'>${random36}</span> 筆，創造出有機且充滿不確性視體驗。作品涵蓋互<span style='color:red'>${randomRed2}</span>裝、動態影像設計與生成式藝術... <br><span style='font-family:monospace; font-size:0.8rem; color:#ff0000;'>${randomErr} // SYSTEM_HALTED</span>`;
                            }, 100);
                        }

                        // D. 0.5秒後完全恢復正常
                        setTimeout(() => {
                            targetContainer.classList.remove('glitched-mode');
                            isGlitchMode = false; // 關閉背景雜訊
                            
                            // 清除亂碼定時器，還原文字
                            if (glitchInterval) clearInterval(glitchInterval);
                            if (text) text.innerHTML = originalText; // 還原為該頁面原本的文字
                        }, 500);

                    }, 1000); // 遮罩持續 1 秒
                }
            }
        });
    }

    // --- 4. 生成式藝術背景 (Generative Art Background) ---
    const canvas = document.getElementById('bg-canvas');
    
    // 如果頁面上沒有 canvas (例如某些特殊頁面)，則不執行後續繪圖代碼
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // 滑鼠互動追蹤
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // 速度極慢
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 150 + 50; // 大尺寸光暈
            // 隨機顏色：紫色到藍色的區間
            const hue = Math.random() * 60 + 220; // 220-280 (Blue to Purple)
            this.color = `hsla(${hue}, 70%, 60%, 0.15)`;
            this.depth = (Math.random() - 0.5) * 0.1; // 視差深度係數
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // 邊界反彈
            if (this.x < -100 || this.x > width + 100) this.vx *= -1;
            if (this.y < -100 || this.y > height + 100) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            
            // 計算視差偏移量
            const moveX = (mouse.x - width / 2) * this.depth;
            const moveY = (mouse.y - height / 2) * this.depth;

            // 建立徑向漸層
            const gradient = ctx.createRadialGradient(this.x + moveX, this.y + moveY, 0, this.x + moveX, this.y + moveY, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.globalCompositeOperation = 'screen'; // 混合模式：濾色
            ctx.arc(this.x + moveX, this.y + moveY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 初始化粒子
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // 崩壞模式下的特效 (Noise Particles)
        if (isGlitchMode) {
            // 1. 隨機雜訊線條
            if (Math.random() > 0.01) { // 99% 機率每幀產生 (幾乎不間斷)
                const noiseCount = Math.floor(Math.random() * 100) + 50; // 超大量雜訊
                for (let i = 0; i < noiseCount; i++) {
                    const nx = Math.random() * width;
                    const ny = Math.random() * height;
                    const nw = Math.random() * 100 + 10;
                    const nh = Math.random() * 2 + 1;
                    
                    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 0, 0, 0.5)';
                    ctx.fillRect(nx, ny, nw, nh);
                }
            }
            
            // 2. 青色故障塊
            if (Math.random() > 0.9) {
                const bx = Math.random() * width;
                const by = Math.random() * height;
                const bs = Math.random() * 30 + 10;
                ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.fillRect(bx, by, bs, bs);
            }

            // 3. 亂碼文字粒子
            if (Math.random() > 0.8) {
                const tx = Math.random() * width;
                const ty = Math.random() * height;
                const chars = "01@#%&?£§µ¶†‡ERROR";
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 0, 0, 0.8)';
                ctx.font = (Math.random() * 20 + 10) + "px 'Courier New'";
                ctx.fillText(char, tx, ty);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});
