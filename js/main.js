// ================= TAB SYSTEM =================
let activeGraphTab = 'q2';
let q1Result = { markdown: '', html: '' };
let q2Result = { markdown: '', html: '' };
let q3Result = { markdown: '', html: '' };

function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function loadPresetExam(num) {
    const f0Input = document.getElementById('f0-input');
    const varsCountSelect = document.getElementById('bool-vars');
    varsCountSelect.value = '4';
    initMintermSelectors();
    if (num === 1) {
        f0Input.value = '0110, 1011, 0011, 1001, 1101, 1100';
    } else {
        f0Input.value = '1110, 1011, 0011, 0101, 0001, 0100';
    }
    solveBoolean();
}

function switchTab(tabId) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn, .dt-btn').forEach(el => el.classList.remove('active'));
    
    if (tabId === 'boolean-tab') {
        document.getElementById('boolean-tab').classList.add('active');
        document.getElementById('tab-btn-boolean').classList.add('active');
        const dtBtn = Array.from(document.querySelectorAll('.dt-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes('boolean-tab'));
        if (dtBtn) dtBtn.classList.add('active');
    } else if (tabId === 'graph-q2' || tabId === 'graph-q3') {
        activeGraphTab = tabId === 'graph-q2' ? 'q2' : 'q3';
        document.getElementById('graph-tab').classList.add('active');
        
        if (tabId === 'graph-q2') {
            document.getElementById('tab-btn-q2').classList.add('active');
            const dtBtn = Array.from(document.querySelectorAll('.dt-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes('graph-q2'));
            if (dtBtn) dtBtn.classList.add('active');
            
            // Show Câu 2 components, hide Câu 3 and setup/canvas/log components
            document.getElementById('q2-card').style.display = 'block';
            document.getElementById('q3-card').style.display = 'none';
            document.getElementById('graph-setup-card').style.display = 'none';
            document.getElementById('canvas-area-wrapper').style.display = 'none';
            document.getElementById('graph-log-card').style.display = 'none';
            document.getElementById('uit-q2-exam-card').style.display = q2Result.html ? 'block' : 'none';
            document.getElementById('uit-q3-exam-card').style.display = 'none';
        } else {
            document.getElementById('tab-btn-q3').classList.add('active');
            const dtBtn = Array.from(document.querySelectorAll('.dt-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes('graph-q3'));
            if (dtBtn) dtBtn.classList.add('active');
            
            // Show Câu 3 and setup/canvas/log components, hide Câu 2 components
            document.getElementById('q3-card').style.display = 'block';
            document.getElementById('q2-card').style.display = 'none';
            document.getElementById('graph-setup-card').style.display = 'block';
            document.getElementById('canvas-area-wrapper').style.display = 'block';
            document.getElementById('graph-log-card').style.display = 'block';
            document.getElementById('uit-q3-exam-card').style.display = q3Result.html ? 'block' : 'none';
            document.getElementById('uit-q2-exam-card').style.display = 'none';
        }
        
        resizeCanvas();
        drawGraph();
    } else if (tabId === 'export-tab') {
        document.getElementById('export-tab').classList.add('active');
        document.getElementById('tab-btn-export').classList.add('active');
        const dtBtn = Array.from(document.querySelectorAll('.dt-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes('export-tab'));
        if (dtBtn) dtBtn.classList.add('active');

        // Populate with collected results
        document.getElementById('export-q1-content').innerHTML = q1Result.html || '<span style="color:#64748b; font-style:italic;">(Chưa hoàn thành - Hãy chạy tối thiểu hóa ở tab Câu 1)</span>';
        document.getElementById('export-q2-content').innerHTML = q2Result.exportHtml || q2Result.html || '<span style="color:#64748b; font-style:italic;">(Chưa hoàn thành - Hãy vẽ đồ thị & chạy Bài 2)</span>';
        document.getElementById('export-q3-content').innerHTML = q3Result.html || '<span style="color:#64748b; font-style:italic;">(Chưa hoàn thành - Hãy chạy thuật toán ở tab Câu 3)</span>';
    }
}

function copyFullMarkdownAnswer() {
    let combinedMd = ``;
    if (q1Result.markdown) {
        combinedMd += `### BÀI 1: TỐI THIỂU HÓA HÀM BOOLE\n\n` + q1Result.markdown + `\n\n---\n\n`;
    }
    if (q2Result.markdown) {
        combinedMd += `### BÀI 2: PHÁC HỌA ĐỒ THỊ & LÝ LUẬN\n\n` + q2Result.markdown + `\n\n---\n\n`;
    }
    if (q3Result.markdown) {
        combinedMd += `### BÀI 3: THUẬT TOÁN ĐỒ THỊ\n\n` + q3Result.markdown + `\n\n`;
    }

    if (!combinedMd.trim()) {
        alert("Không có nội dung bài làm để sao chép. Hãy chạy các câu hỏi trước!");
        return;
    }

    navigator.clipboard.writeText(combinedMd).then(() => {
        alert("Đã sao chép toàn bộ bài làm dưới dạng Markdown!");
    });
}

function copyToClipboard(elementId, btn) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Đã sao chép!';
        btn.style.background = 'var(--green)';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

// ================= SERVICE WORKER REGISTRATION =================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[Service Worker] Registered successfully', reg.scope))
            .catch(err => console.error('[Service Worker] Registration failed', err));
    });
}