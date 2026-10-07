document.addEventListener("DOMContentLoaded", () => {
    // === Logika Universal Navigasi SPA via atribut [data-target] ===
    const screens = document.querySelectorAll('.screen');
    const navBtns = document.querySelectorAll('.nav-btn');

    function goToScreen(targetId) {
        screens.forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.scrollTop = 0;
            
            if (targetId === 'screen-quiz') {
            setTimeout(loadQuizQuestion, 50); // Beri jeda sepersekian detik agar DOM siap
            }
        }

        // Sinkronisasi tombol Navbar atas
        navBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Render ulang MathJax jika ada elemen matematika
    if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
        MathJax.typesetPromise().catch((err) => console.log(err));
    }
    }

    // Tangkap semua elemen yang memiliki atribut data-target (termasuk kartu modul & tombol)
    document.body.addEventListener('click', (e) => {
        const targetEl = e.target.closest('[data-target]');
        if (targetEl) {
            const targetId = targetEl.getAttribute('data-target');
            goToScreen(targetId);
        }
    });

    // Tombol Cepat di Beranda Utama
    const btnMulai = document.getElementById('btn-mulai');
    if (btnMulai) {
        btnMulai.addEventListener('click', () => goToScreen('screen-modules'));
    }

    // === Logika Modal "Tentang" ===
    const modal = document.getElementById('modal-tentang');
    const btnTentang = document.getElementById('btn-tentang');
    const btnClose = document.getElementById('close-modal');

    if (btnTentang) {
        btnTentang.addEventListener('click', () => modal.classList.add('active'));
    }
    if (btnClose) {
        btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // === Logika Drag and Drop (Screen 2: Ruang Sampel) ===
    const draggables = document.querySelectorAll('.draggable');
    const dropZone = document.getElementById('drop-zone');
    const conclusionBox = document.getElementById('conclusion-box');
    const placeholderText = document.querySelector('.placeholder-text');
    let droppedCount = 0;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    if(dropZone) {
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('hovered');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('hovered');
        });
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('hovered');
            
            const draggable = document.querySelector('.dragging');
            if (draggable && draggable.parentElement !== dropZone) {
                dropZone.appendChild(draggable);
                droppedCount++;
                if(placeholderText) placeholderText.style.display = 'none';

                if(droppedCount === 6) {
                    conclusionBox.style.display = 'block';
                    if (window.MathJax) {
                        MathJax.typesetPromise([conclusionBox]);
                    }
                }
            }
        });
    }

    // === Logika Lab Simulasi (Screen 3) ===
    let totalA = 0;
    let totalG = 0;
    let totalN = 0;

    window.simulasiLempar = function(times) {
        const coin = document.getElementById('the-coin');
        if(!coin) return;
        coin.classList.remove('flip-animation');
        void coin.offsetWidth; 
        coin.classList.add('flip-animation');

        let a = 0;
        let g = 0;
        for(let i = 0; i < times; i++) {
            if(Math.random() < 0.5) a++;
            else g++;
        }

        setTimeout(() => {
            if (times === 1) {
                coin.style.transform = (a === 1) ? "rotateY(0deg)" : "rotateY(180deg)";
            } else {
                coin.style.transform = "rotateY(0deg)";
            }
        }, 600);

        totalA += a;
        totalG += g;
        totalN += times;
        updateDashboard();
    }

    window.resetSimulasi = function() {
        totalA = 0;
        totalG = 0;
        totalN = 0;
        const coin = document.getElementById('the-coin');
        if(coin) coin.style.transform = "rotateY(0deg)";
        const conc = document.getElementById('simulasi-conclusion');
        if(conc) conc.style.display = 'none';
        updateDashboard();
    }

    function updateDashboard() {
        const cA = document.getElementById('count-A');
        const cG = document.getElementById('count-G');
        const tN = document.getElementById('total-N');
        if(!cA) return;

        cA.innerText = totalA;
        cG.innerText = totalG;
        tN.innerText = totalN;

        let freqA = totalN === 0 ? 0 : (totalA / totalN).toFixed(2);
        let freqG = totalN === 0 ? 0 : (totalG / totalN).toFixed(2);

        document.getElementById('freq-A').innerText = `\\(\\frac{${totalA}}{${totalN}} = ${freqA}\\)`;
        document.getElementById('freq-G').innerText = `\\(\\frac{${totalG}}{${totalN}} = ${freqG}\\)`;

        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('freq-A'), document.getElementById('freq-G')]);
        }

        let pctA = totalN === 0 ? 0 : (totalA / totalN) * 100;
        let pctG = totalN === 0 ? 0 : (totalG / totalN) * 100;
        
        document.getElementById('bar-A').style.height = pctA + '%';
        document.getElementById('bar-G').style.height = pctG + '%';

        if (totalN >= 100) {
            const conclusion = document.getElementById('simulasi-conclusion');
            if (conclusion && conclusion.style.display === 'none') {
                conclusion.style.display = 'block';
                if (window.MathJax) MathJax.typesetPromise([conclusion]);
            }
        }
    }

    // === Logika Screen 4 (Peluang Teoretik) ===
    let correctBlue = 0;
    let correctTotal = 0;

    function generateBalls() {
        const container = document.getElementById('ball-container');
        if(!container) return;
        container.innerHTML = '';
        
        correctTotal = Math.floor(Math.random() * 5) + 5;
        correctBlue = Math.floor(Math.random() * (correctTotal - 1)) + 1;
        let redBalls = correctTotal - correctBlue;

        let colors = [];
        for(let i=0; i<correctBlue; i++) colors.push('#3498DB');
        for(let i=0; i<redBalls; i++) colors.push('#E74C3C');
        colors.sort(() => Math.random() - 0.5);

        let ballIndex = 0;
        for(let row = 0; row < 3; row++) {
            for(let col = 0; col < 3; col++) {
                if(ballIndex < correctTotal) {
                    let cx = 65 + (col * 35) + (Math.random() * 10 - 5);
                    let cy = 215 - (row * 35) + (Math.random() * 8 - 4);
                    
                    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", cx);
                    circle.setAttribute("cy", cy);
                    circle.setAttribute("r", 17);
                    circle.setAttribute("fill", colors[ballIndex]);
                    
                    let highlight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    highlight.setAttribute("cx", cx - 5);
                    highlight.setAttribute("cy", cy - 5);
                    highlight.setAttribute("r", 5);
                    highlight.setAttribute("fill", "rgba(255,255,255,0.4)");
                    
                    container.appendChild(circle);
                    container.appendChild(highlight);
                    ballIndex++;
                }
            }
        }
    }

    generateBalls();

    const btnCekTeori = document.getElementById('btn-cek-teori');
    if(btnCekTeori) {
        btnCekTeori.addEventListener('click', () => {
            const inputA = document.getElementById('input-nA');
            const inputS = document.getElementById('input-nS');
            const feedback = document.getElementById('teori-feedback');
            const solution = document.getElementById('teori-solution');
            
            let valA = parseInt(inputA.value);
            let valS = parseInt(inputS.value);
            
            inputA.classList.remove('shake-error');
            inputS.classList.remove('shake-error');
            
            if (valA === correctBlue && valS === correctTotal) {
                feedback.style.display = 'block';
                solution.innerHTML = `$$P(\\text{Biru}) = \\frac{${correctBlue}}{${correctTotal}}$$`;
                if(window.MathJax) MathJax.typesetPromise([solution]);
            } else {
                feedback.style.display = 'none';
                if (valA !== correctBlue) inputA.classList.add('shake-error');
                if (valS !== correctTotal) inputS.classList.add('shake-error');
            }
        });
    }

    // === Logika Modul 3 (Peluang Komplemen) ===
    const slider = document.getElementById('komplemen-slider');
    const sliderVal = document.getElementById('slider-val');
    const barA = document.getElementById('bar-A');
    const barAc = document.getElementById('bar-Ac');
    const formulaDisplay = document.getElementById('formula-display');

    if(slider) {
        slider.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            let pA = val / 100;
            let pAc = (100 - val) / 100;

            sliderVal.innerText = pA.toFixed(2);
            barA.style.width = val + '%';
            barAc.style.width = (100 - val) + '%';
            
            barA.innerText = val > 15 ? `P(A) = ${pA.toFixed(2)}` : "";
            barAc.innerText = (100 - val) > 15 ? `P(A') = ${pAc.toFixed(2)}` : "";

            if (window.MathJax) {
                MathJax.typesetPromise([formulaDisplay]);
            }
        });
    }

    // === LOGIKA MODUL 4 (Ruang Sampel Dua Dadu & Misi Tantangan) ===
    const matrixTable = document.getElementById('dadu-matrix');
    let markedCount = 0;

    if (matrixTable) {
        let html = '<tr><th>/</th>';
        for(let j=1; j<=6; j++) html += `<th>${j}</th>`;
        html += '</tr>';

        for(let i=1; i<=6; i++) {
            html += `<tr><th>${i}</th>`;
            for(let j=1; j<=6; j++) {
                html += `<td class="matrix-cell" id="cell-${i}-${j}">(${i},${j})</td>`;
            }
            html += '</tr>';
        }
        matrixTable.innerHTML = html;
    }

    const btnLemparDadu = document.getElementById('btn-lempar-dadu');
    const pblBox = document.getElementById('pbl-challenge-box');

    if (btnLemparDadu) {
        btnLemparDadu.addEventListener('click', () => {
            let d1 = Math.floor(Math.random() * 6) + 1;
            let d2 = Math.floor(Math.random() * 6) + 1;

            const box1 = document.getElementById('dadu-1-box');
            const box2 = document.getElementById('dadu-2-box');
            if(box1) box1.innerText = d1;
            if(box2) box2.innerText = d2;

            let cellId = `cell-${d1}-${d2}`;
            let cell = document.getElementById(cellId);
            
            if(cell && !cell.classList.contains('marked')) {
                cell.classList.add('marked');
                markedCount++;
                const counter = document.getElementById('matrix-counter');
                if(counter) counter.innerText = `Titik sampel ditemukan: ${markedCount} dari 36`;

                if (markedCount === 36 && pblBox) {
                    pblBox.style.display = 'block';
                }
            }
        });
    }

    const btnResetDadu = document.getElementById('btn-reset-dadu');
    if (btnResetDadu) {
        btnResetDadu.addEventListener('click', () => {
            markedCount = 0;
            const box1 = document.getElementById('dadu-1-box');
            const box2 = document.getElementById('dadu-2-box');
            if(box1) box1.innerText = '🎲';
            if(box2) box2.innerText = '🎲';
            
            const counter = document.getElementById('matrix-counter');
            if(counter) counter.innerText = `Titik sampel ditemukan: 0 dari 36`;
            
            if(pblBox) pblBox.style.display = 'none';
            const feedback = document.getElementById('tantangan-feedback');
            if(feedback) feedback.innerText = '';
            const inputTantangan = document.getElementById('input-tantangan');
            if(inputTantangan) inputTantangan.value = '';
            
            const cells = document.querySelectorAll('.matrix-cell');
            cells.forEach(c => c.classList.remove('marked'));
        });
    }

    const btnCekTantangan = document.getElementById('btn-cek-tantangan');
    if (btnCekTantangan) {
        btnCekTantangan.addEventListener('click', () => {
            const inputVal = parseInt(document.getElementById('input-tantangan').value);
            const feedback = document.getElementById('tantangan-feedback');
            
            if(feedback) {
                feedback.style.marginTop = "12px";
                feedback.style.fontSize = "0.95rem";
                
                if (inputVal === 6) {
                    feedback.style.color = "#27AE60";
                    feedback.innerHTML = "🎉 Benar sekali! Ada 6 titik sampel yang jumlahnya 7: \\((1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\).<br>Maka peluangnya adalah $$P(\\text{Jumlah 7}) = \\frac{6}{36} = \\frac{1}{6}$$";
                    if(window.MathJax) MathJax.typesetPromise([feedback]);
                } else {
                    feedback.style.color = "#C0392B";
                    feedback.innerHTML = "❌ Kurang tepat. Coba hitung lagi diagonal titik sampel yang menghasilkan jumlah 7 pada tabel matriks di atas!";
                }
            }
        });
    }

    // === LOGIKA MODUL 5 (Frekuensi Harapan) ===
    const sliderPercobaan = document.getElementById('fh-percobaan');
    const valPercobaan = document.getElementById('val-percobaan');
    const btnHitungFh = document.getElementById('btn-hitung-fh');
    const fhOutputText = document.getElementById('fh-output-text');
    const fhFormulaDisplay = document.getElementById('fh-formula-display');

    if (sliderPercobaan && valPercobaan) {
        sliderPercobaan.addEventListener('input', (e) => {
            valPercobaan.innerText = e.target.value;
        });
    }

    if (btnHitungFh) {
        btnHitungFh.addEventListener('click', () => {
            let n = parseInt(sliderPercobaan.value);
            let fh = (1 / 6) * n;

            if (fhOutputText) {
                fhOutputText.innerHTML = `$$F_h = \\frac{1}{6} \\times ${n} = \\mathbf{${Math.round(fh)}}\\text{ kali}$$`;
                if (window.MathJax) {
                    MathJax.typesetPromise([fhOutputText]);
                }
            }
        });
    }

    if (window.MathJax && typeof MathJax.typesetPromise === 'function' && fhFormulaDisplay) {
        MathJax.typesetPromise([fhFormulaDisplay]);
    }

    // === LOGIKA KUIS INTERAKTIF ===
    const quizData = [
        {
            question: "Sebuah dadu dilempar sekali. Berapa peluang munculnya mata dadu bilangan genap?",
            options: ["1/6", "1/3", "1/2", "2/3"],
            correct: 2,
            explanation: "Bilangan genap pada dadu adalah 2, 4, dan 6 (ada 3 angka). Peluangnya adalah 3/6 = 1/2."
        },
        {
            question: "Jika peluang hari ini akan turun hujan adalah 0.25, berapakah peluang hari ini TIDAK turun hujan (komplemennya)?",
            options: ["0.25", "0.50", "0.75", "1.00"],
            correct: 2,
            explanation: "Peluang komplemen dihitung dengan 1 - P(A) = 1 - 0.25 = 0.75."
        },
        {
            question: "Dua buah dadu dilempar bersama-sama. Berapa jumlah total seluruh titik sampel [n(S)] pada ruang sampelnya?",
            options: ["12", "18", "24", "36"],
            correct: 3,
            explanation: "Berdasarkan Modul 4, ruang sampel dua dadu adalah 6 x 6 = 36 titik sampel."
        },
        {
            question: "Sebuah koin dilempar sebanyak 60 kali. Berapa frekuensi harapan munculnya angka?",
            options: ["15 kali", "30 kali", "45 kali", "60 kali"],
            correct: 1,
            explanation: "Peluang muncul angka pada koin adalah 1/2. Frekuensi harapannya = (1/2) x 60 = 30 kali."
        }
    ];

    let currentQuizIndex = 0;
    let quizScore = 0;

    var quizQuestionEl = document.getElementById('quiz-question');
    var quizOptionsEl = document.getElementById('quiz-options');
    var quizProgressEl = document.getElementById('quiz-progress');
    var quizScoreBadge = document.getElementById('quiz-score-badge');
    var quizFeedbackEl = document.getElementById('quiz-feedback');
    var btnNextQuiz = document.getElementById('btn-next-quiz');
    var quizContainer = document.getElementById('quiz-container');
    var quizResultScreen = document.getElementById('quiz-result-screen');
    var finalScoreText = document.getElementById('final-score-text');
    var btnRestartQuiz = document.getElementById('btn-restart-quiz');

    function loadQuizQuestion() {
        if (quizQuestionEl && currentQuizIndex < quizData.length) {
            let currentQ = quizData[currentQuizIndex];
            if(quizProgressEl) quizProgressEl.innerText = `Soal ${currentQuizIndex + 1} dari ${quizData.length}`;
            if(quizQuestionEl) quizQuestionEl.innerText = currentQ.question;
            if(quizFeedbackEl) quizFeedbackEl.innerText = "";
            if(btnNextQuiz) btnNextQuiz.style.display = "none";
            
            if(quizOptionsEl) {
                quizOptionsEl.innerHTML = "";
                currentQ.options.forEach((opt, idx) => {
                    let btn = document.createElement('button');
                    btn.style.cssText = "padding: 12px 15px; text-align: left; background: #F8FBFE; border: 2px solid #DCE4EC; border-radius: 10px; font-size: 1rem; cursor: pointer; transition: all 0.2s;";
                    btn.innerText = opt;
                    btn.addEventListener('click', () => selectQuizAnswer(idx, btn));
                    quizOptionsEl.appendChild(btn);
                });
            }
        } else if (quizContainer && quizResultScreen) {
            quizContainer.style.display = "none";
            quizResultScreen.style.display = "block";
            if(finalScoreText) finalScoreText.innerText = `Skor Akhir Kamu: ${quizScore} dari ${quizData.length * 25}`;
        }
    }

    function selectQuizAnswer(selectedIndex, selectedBtn) {
        let currentQ = quizData[currentQuizIndex];
        const allOptionBtns = quizOptionsEl.querySelectorAll('button');
        
        allOptionBtns.forEach(b => b.style.pointerEvents = "none");

        if (selectedIndex === currentQ.correct) {
            selectedBtn.style.background = "#E8F8F5";
            selectedBtn.style.borderColor = "#27AE60";
            selectedBtn.style.color = "#27AE60";
            selectedBtn.style.fontWeight = "bold";
            if(quizFeedbackEl) {
                quizFeedbackEl.style.color = "#27AE60";
                quizFeedbackEl.innerHTML = `🎉 Benar! ${currentQ.explanation}`;
            }
            quizScore += 25;
            if(quizScoreBadge) quizScoreBadge.innerText = `Skor: ${quizScore}`;
        } else {
            selectedBtn.style.background = "#FDEDEC";
            selectedBtn.style.borderColor = "#C0392B";
            selectedBtn.style.color = "#C0392B";
            selectedBtn.style.fontWeight = "bold";
            allOptionBtns[currentQ.correct].style.background = "#E8F8F5";
            allOptionBtns[currentQ.correct].style.borderColor = "#27AE60";
            
            if(quizFeedbackEl) {
                quizFeedbackEl.style.color = "#C0392B";
                quizFeedbackEl.innerHTML = `❌ Kurang tepat. ${currentQ.explanation}`;
            }
        }

        if(btnNextQuiz) btnNextQuiz.style.display = "block";
    }

    if (btnNextQuiz) {
        btnNextQuiz.addEventListener('click', () => {
            currentQuizIndex++;
            loadQuizQuestion();
        });
    }

    if (btnRestartQuiz) {
        btnRestartQuiz.addEventListener('click', () => {
            currentQuizIndex = 0;
            quizScore = 0;
            if(quizScoreBadge) quizScoreBadge.innerText = `Skor: 0`;
            if(quizContainer) quizContainer.style.display = "block";
            if(quizResultScreen) quizResultScreen.style.display = "none";
            loadQuizQuestion();
        });
    }
    if (typeof loadQuizQuestion === 'function') {
        loadQuizQuestion();
    }

});