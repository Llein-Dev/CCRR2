function loadPresetQ2(num) {
    if (num === 1) {
        document.getElementById('q2a-vertices').value = '5';
        document.getElementById('q2a-complete').value = 'false';
        document.getElementById('q2a-euler').value = 'true';
        document.getElementById('q2a-hamilton').value = 'true';
        
        document.getElementById('q2b-vertices').value = '6';
        document.getElementById('q2b-connectivity').value = 'weak';
        document.getElementById('q2b-tournament').value = 'true';
    } else {
        document.getElementById('q2a-vertices').value = '6';
        document.getElementById('q2a-complete').value = 'false';
        document.getElementById('q2a-euler').value = 'false';
        document.getElementById('q2a-hamilton').value = 'true';
        
        document.getElementById('q2b-vertices').value = '5';
        document.getElementById('q2b-connectivity').value = 'strong';
        document.getElementById('q2b-tournament').value = 'true';
    }
    runQ2AutoAlgorithm();
}

function runQ2CanvasAlgorithm() {
    highlightedEdges = [];
    highlightedNodes = [];
    const outBox = document.getElementById('graph-output');
    if (graph.nodes.length === 0) {
        outBox.innerText = "Lỗi: Không có đỉnh nào trên canvas để phân tích.";
        document.getElementById('uit-q2-exam-card').style.display = 'none';
        return;
    }
    checkGraphProperties(outBox);
    generateUitQuestion2Answer();
    drawGraph();
    setTimeout(() => scrollToElement('uit-q2-exam-card'), 100);
}

function runQ2AutoAlgorithm() {
    highlightedEdges = [];
    highlightedNodes = [];
    const outBox = document.getElementById('graph-output');
    outBox.innerText = "Đã sinh thiết kế Câu 2 tự động thành công.";
    generateAutoQ2Answer();
    drawGraph();
    setTimeout(() => scrollToElement('uit-q2-exam-card'), 100);
}

function generateGraphSVG(points, edges, isDirected, useCanvasCoords = false) {
    let viewBox = "0 0 220 220";
    let width = 220;
    let height = 220;
    if (useCanvasCoords && points.length > 0) {
        let xs = points.map(p => p.x);
        let ys = points.map(p => p.y);
        let minX = Math.min(...xs), maxX = Math.max(...xs);
        let minY = Math.min(...ys), maxY = Math.max(...ys);
        let pad = 25;
        let w = (maxX - minX) || 100;
        let h = (maxY - minY) || 100;
        viewBox = `${minX - pad} ${minY - pad} ${w + 2*pad} ${h + 2*pad}`;
        width = Math.min(450, Math.max(220, w + 2*pad));
        height = Math.min(350, Math.max(160, h + 2*pad));
    }

    let svg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius-sm); display:block; margin: 1rem auto; box-shadow:0 2px 8px rgba(0,0,0,0.04);">`;
    
    if (isDirected) {
        svg += `
        <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="19" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569"/>
            </marker>
        </defs>`;
    }
    
    // Draw edges
    edges.forEach(e => {
        let marker = isDirected ? ' marker-end="url(#arrowhead)"' : '';
        svg += `<line x1="${e.u.x}" y1="${e.u.y}" x2="${e.v.x}" y2="${e.v.y}" stroke="#475569" stroke-width="2"${marker}/>`;
    });
    
    // Draw nodes
    points.forEach(p => {
        svg += `
        <circle cx="${p.x}" cy="${p.y}" r="12" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
        <text x="${p.x}" y="${p.y}" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" dominant-baseline="central">${p.id}</text>`;
    });
    
    svg += `</svg>`;
    return svg;
}

function generateAutoQ2Answer() {
    const q2aV = parseInt(document.getElementById('q2a-vertices').value);
    const q2aComp = document.getElementById('q2a-complete').value === 'true';
    const q2aEuler = document.getElementById('q2a-euler').value === 'true';
    const q2aHam = document.getElementById('q2a-hamilton').value === 'true';

    const q2bV = parseInt(document.getElementById('q2b-vertices').value);
    const q2bConn = document.getElementById('q2b-connectivity').value;
    const q2bTour = document.getElementById('q2b-tournament').value === 'true';

    // --- GENERATE QUESTION 2a ---
    let q2aTitle = `Đồ thị vô hướng, ${q2aV} đỉnh, ${q2aComp ? "đầy đủ" : "không đầy đủ"}, ${q2aEuler ? "có Euler" : "không Euler"}, ${q2aHam ? "có Hamilton" : "không Hamilton"}`;
    let q2aDrawing = "";
    let q2aExplanation = "";

    let labelsA = [];
    for (let i = 0; i < q2aV; i++) {
        labelsA.push(String.fromCharCode(65 + i));
    }
    let cycleStrA = labelsA.join('-') + '-' + labelsA[0];
    let pathStrA = labelsA.join(' - ');

    if (q2aComp) {
        q2aDrawing = `Vẽ ${q2aV} đỉnh xếp thành hình đa giác đều. Nối tất cả các cặp đỉnh với nhau bằng các cạnh vô hướng (tổng cộng ${q2aV * (q2aV - 1) / 2} cạnh).`;
        let deg = q2aV - 1;
        let hasEuler = (deg % 2 === 0);
        q2aExplanation = `Đồ thị đầy đủ $K_{${q2aV}}$ có tất cả các đỉnh đều kề với nhau. Bậc của mỗi đỉnh là $deg(v) = ${deg}$.\n`;
        q2aExplanation += `    - Kết luận Euler: Vì bậc mọi đỉnh đều bằng ${deg} (là số ${hasEuler ? "chẵn" : "lẻ"}), nên đồ thị ${hasEuler ? "CÓ" : "KHÔNG CÓ"} chu trình Euler.\n`;
        q2aExplanation += `    - Kết luận Hamilton: Đồ thị đầy đủ $K_{${q2aV}}$ với số đỉnh $\\ge 3$ luôn CÓ chu trình Hamilton (chu trình ví dụ: ${cycleStrA}).`;
    } else {
        if (q2aEuler && q2aHam) {
            q2aDrawing = `Vẽ ${q2aV} đỉnh xếp thành vòng tròn (gán nhãn ${labelsA.join(', ')}). Nối các đỉnh theo vòng khép kín (${cycleStrA}) để tạo thành một vòng tròn khép kín nối tiếp nhau. Không vẽ thêm đường chéo nào khác.`;
            q2aExplanation = `Đồ thị vô hướng có bậc của tất cả các đỉnh đều bằng 2 (số chẵn) nên đồ thị CÓ chu trình Euler (tên chu trình: ${cycleStrA}).\n`;
            q2aExplanation += `    - Đồ thị chứa một chu trình đơn đi qua tất cả các đỉnh đúng 1 lần rồi quay lại đỉnh xuất phát nên đồ thị CÓ chu trình Hamilton (tên chu trình: ${cycleStrA}).\n`;
            q2aExplanation += `    - Đồ thị không đầy đủ vì thiếu các cạnh chéo kết nối các đỉnh không kề nhau (ví dụ: thiếu cạnh ${labelsA[0]}-${labelsA[2]}, ${labelsA[1]}-${labelsA[3]}...).`;
        } else if (!q2aEuler && !q2aHam) {
            q2aDrawing = `Vẽ ${q2aV} đỉnh xếp nối tiếp nhau thành một đường thẳng dài (ví dụ: ${pathStrA}).`;
            q2aExplanation = `Hai đỉnh ở hai đầu mút ${labelsA[0]} và ${labelsA[q2aV-1]} chỉ có bậc bằng 1 (số lẻ) nên đồ thị KHÔNG CÓ chu trình Euler.\n`;
            q2aExplanation += `    - Đồ thị là một đường thẳng cụt, không chứa bất kỳ chu trình khép kín nào đi qua mọi đỉnh nên KHÔNG CÓ chu trình Hamilton.\n`;
            q2aExplanation += `    - Đồ thị không đầy đủ vì thiếu rất nhiều cạnh nối giữa các cặp đỉnh khác nhau.`;
        } else if (q2aEuler && !q2aHam) {
            q2aDrawing = `Vẽ 2 hình tam giác chỉ chung nhau đúng 1 đỉnh (ví dụ với 5 đỉnh A, B, C, D, E: vẽ tam giác A-B-C-A và tam giác C-D-E-C chung đỉnh C).`;
            q2aExplanation = `Đỉnh chung C có bậc 4, các đỉnh còn lại A, B, D, E đều có bậc 2. Vì bậc của mọi đỉnh đều là số chẵn nên đồ thị CÓ chu trình Euler (ví dụ: A-B-C-D-E-C-A).\n`;
            q2aExplanation += `    - Đồ thị KHÔNG CÓ chu trình Hamilton vì đỉnh C là "điểm nghẽn" (cầu nối duy nhất giữa 2 tam giác rời), không thể đi qua tất cả các đỉnh đúng 1 lần mà không phải đi qua đỉnh C lần thứ hai.\n`;
            q2aExplanation += `    - Đồ thị không đầy đủ vì thiếu nhiều cạnh nối chéo giữa các đỉnh.`;
        } else if (!q2aEuler && q2aHam) {
            q2aDrawing = `Vẽ ${q2aV} đỉnh xếp thành hình đa giác đều. Nối các đỉnh theo vòng khép kín (${cycleStrA}) để tạo chu trình Hamilton. Vẽ thêm duy nhất một cạnh chéo nối hai đỉnh không kề nhau (ví dụ: cạnh ${labelsA[0]}-${labelsA[2]}).`;
            q2aExplanation = `Khi vẽ thêm cạnh chéo ${labelsA[0]}-${labelsA[2]}, hai đỉnh ${labelsA[0]} và ${labelsA[2]} sẽ có bậc bằng 3 (số lẻ), các đỉnh khác vẫn có bậc bằng 2. Vì đồ thị có đỉnh bậc lẻ nên KHÔNG CÓ chu trình Euler.\n`;
            q2aExplanation += `    - Đồ thị vẫn chứa chu trình khép kín đi qua tất cả các đỉnh đúng 1 lần (vòng tròn ban đầu ${cycleStrA}) nên CÓ chu trình Hamilton (tên chu trình: ${cycleStrA}).\n`;
            q2aExplanation += `    - Đồ thị không đầy đủ vì thiếu nhiều cạnh chéo khác.`;
        }
    }

    // --- GENERATE GRAPH G (2a) POINTS & EDGES ---
    let pointsA = [];
    let edgesA = [];

    if (q2aEuler && !q2aHam && q2aV === 5) {
        pointsA = [
            { x: 40, y: 70, id: 'A' },
            { x: 40, y: 150, id: 'B' },
            { x: 110, y: 110, id: 'C' },
            { x: 180, y: 70, id: 'D' },
            { x: 180, y: 150, id: 'E' }
        ];
        edgesA = [
            { u: pointsA[0], v: pointsA[1] },
            { u: pointsA[1], v: pointsA[2] },
            { u: pointsA[2], v: pointsA[0] },
            { u: pointsA[2], v: pointsA[3] },
            { u: pointsA[3], v: pointsA[4] },
            { u: pointsA[4], v: pointsA[2] }
        ];
    } else if (!q2aEuler && !q2aHam) {
        let step = (220 - 60) / (q2aV - 1);
        for(let i=0; i<q2aV; i++) {
            pointsA.push({ x: 30 + i * step, y: 110, id: String.fromCharCode(65 + i) });
        }
        for(let i=0; i<q2aV-1; i++) {
            edgesA.push({ u: pointsA[i], v: pointsA[i+1] });
        }
    } else {
        let cx = 110, cy = 110, r = 70;
        for(let i=0; i<q2aV; i++) {
            let angle = (2 * Math.PI * i) / q2aV - Math.PI / 2;
            pointsA.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), id: String.fromCharCode(65 + i) });
        }

        if (q2aComp) {
            for(let i=0; i<q2aV; i++) {
                for(let j=i+1; j<q2aV; j++) {
                    edgesA.push({ u: pointsA[i], v: pointsA[j] });
                }
            }
        } else if (q2aEuler && q2aHam) {
            for(let i=0; i<q2aV; i++) {
                edgesA.push({ u: pointsA[i], v: pointsA[(i+1)%q2aV] });
            }
        } else if (!q2aEuler && q2aHam) {
            for(let i=0; i<q2aV; i++) {
                edgesA.push({ u: pointsA[i], v: pointsA[(i+1)%q2aV] });
            }
            edgesA.push({ u: pointsA[0], v: pointsA[2] });
        }
    }

    let svgA = generateGraphSVG(pointsA, edgesA, false);

    // --- GENERATE QUESTION 2b ---
    let q2bTitle = `Đồ thị có hướng, ${q2bV} đỉnh, ${q2bTour ? "Tournament (Đầy đủ)" : "Không đầy đủ"}, liên thông ${q2bConn === 'strong' ? "mạnh" : "yếu"}`;
    let q2bDrawing = "";
    let q2bExplanation = "";

    let labelsB = [];
    for (let i = 0; i < q2bV; i++) {
        labelsB.push(String.fromCharCode(65 + i));
    }
    let pathStrB = labelsB.join(' -> ');
    let cycleStrB = labelsB.join(' -> ') + ' -> ' + labelsB[0];

    if (q2bTour) {
        if (q2bConn === 'strong') {
            q2bDrawing = `Vẽ ${q2bV} đỉnh xếp thành vòng tròn (gán nhãn ${labelsB.join(', ')}). Vẽ các cung một chiều nối tiếp nhau tạo thành một vòng tròn lớn khép kín: ${cycleStrB}. Đối với tất cả các cặp đỉnh còn lại chưa có cung liên kết trực tiếp, vẽ thêm các cung một chiều chéo nhau bất kỳ sao cho giữa mỗi cặp đỉnh chỉ có đúng 1 cung.`;
            q2bExplanation = `Đồ thị liên thông mạnh vì có vòng cung khép kín $${labelsB.join(' \\to ')} \\to ${labelsB[0]}$ nối tất cả các đỉnh, đảm bảo luôn tồn tại đường đi có hướng giữa mọi cặp đỉnh bất kỳ.\n`;
            q2bExplanation += `    - Đồ thị là Tournament (đầy đủ có hướng) vì giữa 2 đỉnh bất kỳ $u$ và $v$ luôn có đúng 1 cung kết nối (hoặc $u \\to v$ hoặc $v \\to u$).`;
        } else {
            q2bDrawing = `Vẽ ${q2bV} đỉnh (gán nhãn ${labelsB.join(', ')}). Vẽ các cung một chiều đi từ đỉnh ${labelsB[0]} đến tất cả các đỉnh còn lại (${labelsB[0]} -> ${labelsB[1]}, ${labelsB[0]} -> ${labelsB[2]}, ..., ${labelsB[0]} -> ${labelsB[q2bV-1]}). Giữa các đỉnh còn lại, vẽ các cung một chiều chéo nhau bất kỳ sao cho giữa mỗi cặp đỉnh chỉ có đúng 1 cung.`;
            q2bExplanation = `Đồ thị liên thông yếu vì nếu ta bỏ qua chiều của các cung (xem như đồ thị vô hướng), đồ thị liên thông. Tuy nhiên, đồ thị không liên thông mạnh vì từ các đỉnh khác không có cách nào đi ngược về đỉnh ${labelsB[0]} được (đỉnh ${labelsB[0]} chỉ có cung đi ra, không có cung đi vào).\n`;
            q2bExplanation += `    - Đồ thị là Tournament (đầy đủ có hướng) vì giữa 2 đỉnh bất kỳ luôn có đúng 1 cung kết nối.`;
        }
    } else {
        if (q2bConn === 'strong') {
            q2bDrawing = `Vẽ ${q2bV} đỉnh xếp thành vòng tròn. Chỉ vẽ các cung một chiều nối tiếp nhau tạo thành vòng khép kín đi qua tất cả các đỉnh: ${cycleStrB}. Không vẽ thêm cung nào khác.`;
            q2bExplanation = `Đồ thị liên thông mạnh vì chứa vòng đi qua tất cả các đỉnh, luôn đi được từ đỉnh này đến đỉnh kia.\n`;
            q2bExplanation += `    - Đồ thị không đầy đủ (không phải Tournament) vì thiếu các cung liên kết chéo giữa các cặp đỉnh không kề nhau.`;
        } else {
            q2bDrawing = `Vẽ ${q2bV} đỉnh nối tiếp nhau thành một đường thẳng một chiều từ trái qua phải (ví dụ: ${pathStrB}).`;
            q2bExplanation = `Đồ thị liên thông yếu vì khi bỏ qua chiều của các cung thì đồ thị liên thông. Đồ thị không liên thông mạnh vì đường đi chỉ đi một chiều từ đầu đến cuối, không thể quay ngược lại được.\n`;
            q2bExplanation += `    - Đồ thị không đầy đủ vì thiếu rất nhiều cung nối giữa các cặp đỉnh.`;
        }
    }

    // --- GENERATE GRAPH G' (2b) POINTS & EDGES ---
    let pointsB = [];
    let edgesB = [];
    
    let cx = 110, cy = 110, r = 70;
    for(let i=0; i<q2bV; i++) {
        let angle = (2 * Math.PI * i) / q2bV - Math.PI / 2;
        pointsB.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), id: String.fromCharCode(65 + i) });
    }

    if (q2bTour) {
        if (q2bConn === 'strong') {
            for(let i=0; i<q2bV; i++) {
                edgesB.push({ u: pointsB[i], v: pointsB[(i+1)%q2bV] });
            }
            for(let i=0; i<q2bV; i++) {
                for(let j=i+2; j<q2bV; j++) {
                    if (i === 0 && j === q2bV - 1) continue;
                    edgesB.push({ u: pointsB[i], v: pointsB[j] });
                }
            }
        } else {
            for(let i=0; i<q2bV; i++) {
                for(let j=i+1; j<q2bV; j++) {
                    edgesB.push({ u: pointsB[i], v: pointsB[j] });
                }
            }
        }
    } else {
        if (q2bConn === 'strong') {
            for(let i=0; i<q2bV; i++) {
                edgesB.push({ u: pointsB[i], v: pointsB[(i+1)%q2bV] });
            }
        } else {
            pointsB = [];
            let step = (220 - 60) / (q2bV - 1);
            for(let i=0; i<q2bV; i++) {
                pointsB.push({ x: 30 + i * step, y: 110, id: String.fromCharCode(65 + i) });
            }
            for(let i=0; i<q2bV-1; i++) {
                edgesB.push({ u: pointsB[i], v: pointsB[i+1] });
            }
        }
    }

    let svgB = generateGraphSVG(pointsB, edgesB, true);

    // Format Markdown output (ONLY contains the SVGs)
    let markdown = `**BÀI LÀM**

**a) Phác họa đồ thị G (${q2aTitle}):**
${svgA}

**b) Phác họa đồ thị có hướng G' (${q2bTitle}):**
${svgB}`;

    // Format Export HTML (ONLY contains the SVGs)
    let exportHtml = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p><strong>BÀI LÀM</strong></p>
            <br>
            <p><strong>a) Phác họa đồ thị G (${q2aTitle}):</strong></p>
            <div style="text-align: center; margin: 1rem 0;">${svgA}</div>
            
            <p><strong>b) Phác họa đồ thị có hướng G' (${q2bTitle}):</strong></p>
            <div style="text-align: center; margin: 1rem 0;">${svgB}</div>
        </div>
    `;

    // Format HTML Preview (explanations + reasoning + SVGs)
    let htmlPreview = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p><strong>BÀI LÀM</strong></p>
            <br>
            <p><strong>a) Phác họa đồ thị G (${q2aTitle}):</strong></p>
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li style="margin-bottom: 0.5rem;"><strong>Cách vẽ thiết kế:</strong><br><span style="color: var(--accent-blue); font-weight: 500;">${q2aDrawing}</span></li>
                <li style="margin-bottom: 0.5rem;"><strong>Lý luận chứng minh:</strong><br>${q2aExplanation.replace(/\n/g, '<br>')}</li>
                <li style="margin-bottom: 0.5rem; text-align: center;"><strong>Hình vẽ phác họa G:</strong><br>${svgA}</li>
            </ul>
            
            <p><strong>b) Phác họa đồ thị có hướng G' (${q2bTitle}):</strong></p>
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <li style="margin-bottom: 0.5rem;"><strong>Cách vẽ thiết kế:</strong><br><span style="color: var(--accent-blue); font-weight: 500;">${q2bDrawing}</span></li>
                <li style="margin-bottom: 0.5rem;"><strong>Lý luận chứng minh:</strong><br>${q2bExplanation.replace(/\n/g, '<br>')}</li>
                <li style="margin-bottom: 0.5rem; text-align: center;"><strong>Hình vẽ phác họa G':</strong><br>${svgB}</li>
            </ul>
        </div>
    `;

    document.getElementById('uit-q2-raw-text').value = markdown;
    document.getElementById('uit-q2-preview-content').innerHTML = htmlPreview;
    document.getElementById('uit-q2-exam-card').style.display = 'block';
    q2Result.markdown = markdown;
    q2Result.html = htmlPreview;
    q2Result.exportHtml = exportHtml;
}

function generateUitQuestion2Answer() {
    let sortedNodes = [...graph.nodes].sort((a,b) => a.id.localeCompare(b.id));
    if (sortedNodes.length === 0) return;
    
    let degrees = {};
    sortedNodes.forEach(n => degrees[n.id] = 0);
    graph.edges.forEach(e => {
        if(degrees[e.u] !== undefined) degrees[e.u]++;
        if(degrees[e.v] !== undefined) degrees[e.v]++;
    });

    let degreesText = sortedNodes.map(n => `deg(${n.id})=${degrees[n.id]}`).join(', ');

    let connected = isGraphConnected();
    let oddNodes = [];
    sortedNodes.forEach(n => {
        if(degrees[n.id] % 2 !== 0) oddNodes.push(n.id);
    });

    let eulerConclusion = "";
    if (!connected) {
        eulerConclusion = "Vì đồ thị không liên thông nên đồ thị không có chu trình hay đường đi Euler.";
    } else if (oddNodes.length === 0) {
        eulerConclusion = `Vì đồ thị liên thông và mọi đỉnh đều có bậc chẵn (đều chia hết cho 2) nên đồ thị CÓ chu trình Euler.`;
    } else if (oddNodes.length === 2) {
        eulerConclusion = `Vì đồ thị liên thông và có đúng 2 đỉnh bậc lẻ (${oddNodes.join(', ')}) nên đồ thị CÓ đường đi Euler (không có chu trình Euler).`;
    } else {
        eulerConclusion = `Vì đồ thị có ${oddNodes.length} đỉnh có bậc lẻ (${oddNodes.join(', ')}) nên đồ thị KHÔNG có chu trình hay đường đi Euler.`;
    }

    let edgesPoints = graph.edges.map(e => {
        let uNode = graph.nodes.find(n => n.id === e.u);
        let vNode = graph.nodes.find(n => n.id === e.v);
        return { u: uNode, v: vNode };
    });
    let svgCanvas = generateGraphSVG(graph.nodes, edgesPoints, graph.type === 'directed', true);

    // Format Markdown output (ONLY contains the SVG)
    let markdown = `**BÀI LÀM**

**a) Hình vẽ đồ thị G:**
${svgCanvas}`;

    // Format Export HTML (ONLY contains the SVG)
    let exportHtml = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p><strong>BÀI LÀM</strong></p>
            <br>
            <p><strong>a) Hình vẽ đồ thị G:</strong></p>
            <div style="text-align: center; margin: 1rem 0;">${svgCanvas}</div>
        </div>
    `;

    // Format HTML Preview (explanations + reasoning + SVG)
    let oddLabel = oddNodes.length > 0
        ? `<span style="color: var(--accent-red); font-weight: bold;">${oddNodes.length} đỉnh bậc lẻ: ${oddNodes.join(', ')}</span>`
        : `<span style="color: var(--accent-green);">Tất cả đỉnh đều có bậc chẵn</span>`;
        
    let htmlPreview = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p><strong>BÀI LÀM</strong></p>
            <br>
            <p><strong>a) Bậc của các đỉnh và lý luận Euler:</strong></p>
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <li style="margin-bottom: 0.75rem;">
                    Ta có bậc của các đỉnh trên đồ thị là:<br>
                    <span style="font-style: italic; font-family: 'Times New Roman', Times, serif; font-size: 1rem; display:inline-block; margin-top:0.35rem; color: var(--accent-blue);">${degreesText}</span>
                </li>
                <li style="margin-bottom: 0.5rem;">${oddLabel}</li>
                <li style="margin-bottom: 0.5rem;"><strong>Kết luận:</strong> <span style="color: var(--accent-green); font-weight: bold;">${eulerConclusion}</span></li>
                <li style="margin-bottom: 0.5rem; text-align: center;"><strong>Hình vẽ đồ thị G:</strong><br>${svgCanvas}</li>
            </ul>
        </div>
    `;

    document.getElementById('uit-q2-raw-text').value = markdown;
    document.getElementById('uit-q2-preview-content').innerHTML = htmlPreview;
    document.getElementById('uit-q2-exam-card').style.display = 'block';
    
    q2Result.markdown = markdown;
    q2Result.html = htmlPreview;
    q2Result.exportHtml = exportHtml;
}

