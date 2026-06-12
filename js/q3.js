function runQ3Algorithm() {
    highlightedEdges = [];
    highlightedNodes = [];
    const outBox = document.getElementById('graph-output');
    
    if(graph.nodes.length === 0) {
        outBox.innerText = "Lỗi: Đồ thị rỗng.";
        document.getElementById('uit-q3-exam-card').style.display = 'none';
        return;
    }

    const startId = document.getElementById('start-node-select').value || graph.nodes[0].id;
    const isMinKruskal = document.getElementById('kruskal-type-select').value === 'min';

    generateUitQuestion3AnswerSheet(startId, isMinKruskal);
    drawGraph();
    
    outBox.innerText = "Đã chạy toàn bộ thuật toán Câu 3 thành công.";
    setTimeout(() => scrollToElement('uit-q3-exam-card'), 100);
}

function findHamiltonianCycleOrPath() {
    let nodes = graph.nodes.map(n => n.id);
    let n = nodes.length;
    if (n === 0) return { type: 'none' };

    let adj = {};
    nodes.forEach(id => adj[id] = []);
    graph.edges.forEach(e => {
        adj[e.u].push(e.v);
        if (graph.type === 'undirected') {
            adj[e.v].push(e.u);
        }
    });

    let cyclePath = [];
    let visited = new Set();
    
    function findCycle(curr, start, path) {
        if (path.length === n) {
            if (adj[curr].includes(start)) {
                cyclePath = [...path, start];
                return true;
            }
            return false;
        }
        for (let next of adj[curr]) {
            if (!visited.has(next)) {
                visited.add(next);
                path.push(next);
                if (findCycle(next, start, path)) return true;
                path.pop();
                visited.delete(next);
            }
        }
        return false;
    }

    visited.add(nodes[0]);
    let foundCycle = findCycle(nodes[0], nodes[0], [nodes[0]]);
    if (foundCycle) {
        return { type: 'cycle', path: cyclePath };
    }

    let pathResult = [];
    function findPath(curr, path) {
        if (path.length === n) {
            pathResult = [...path];
            return true;
        }
        for (let next of adj[curr]) {
            if (!visited.has(next)) {
                visited.add(next);
                path.push(next);
                if (findPath(next, path)) return true;
                path.pop();
                visited.delete(next);
            }
        }
        return false;
    }

    for (let startNode of nodes) {
        visited.clear();
        visited.add(startNode);
        if (findPath(startNode, [startNode])) {
            return { type: 'path', path: pathResult };
        }
    }

    return { type: 'none' };
}

function generateUitQuestion3AnswerSheet(startId, isMinKruskal) {
    let sortedNodes = [...graph.nodes].sort((a,b) => a.id.localeCompare(b.id));
    let n = sortedNodes.length;
    
    // --- 3a. Euler Check ---
    let degrees = {};
    sortedNodes.forEach(n => degrees[n.id] = 0);
    graph.edges.forEach(e => {
        if(degrees[e.u] !== undefined) degrees[e.u]++;
        if(degrees[e.v] !== undefined) degrees[e.v]++;
    });

    let connected = isGraphConnected();
    let oddNodes = [];
    sortedNodes.forEach(n => {
        if(degrees[n.id] % 2 !== 0) oddNodes.push(n.id);
    });

    let eulerConclusion = "";
    let eulerConclusionHTML = "";
    if (!connected) {
        eulerConclusion = "Vì đồ thị không liên thông nên đồ thị KHÔNG có chu trình Euler và KHÔNG có đường đi Euler.";
        eulerConclusionHTML = `Vì đồ thị không liên thông nên đồ thị <strong style="color:var(--accent-red)">KHÔNG có chu trình Euler</strong> và <strong style="color:var(--accent-red)">KHÔNG có đường đi Euler</strong>.`;
    } else if (oddNodes.length === 0) {
        eulerConclusion = "Vì đồ thị liên thông và mọi đỉnh đều có bậc chẵn nên đồ thị CÓ chu trình Euler.";
        eulerConclusionHTML = `Vì đồ thị liên thông và mọi đỉnh đều có bậc chẵn nên đồ thị <strong style="color:var(--accent-green)">CÓ chu trình Euler</strong>.`;
    } else if (oddNodes.length === 2) {
        eulerConclusion = `Vì đồ thị liên thông và có đúng 2 đỉnh bậc lẻ (${oddNodes.join(', ')}) nên đồ thị CÓ đường đi Euler (không có chu trình Euler).`;
        eulerConclusionHTML = `Vì đồ thị liên thông và có đúng 2 đỉnh bậc lẻ (${oddNodes.join(', ')}) nên đồ thị <strong style="color:var(--accent-green)">CÓ đường đi Euler</strong> (không có chu trình Euler).`;
    } else {
        eulerConclusion = `Vì đồ thị có ${oddNodes.length} đỉnh bậc lẻ (${oddNodes.join(', ')}) (khác 0 và khác 2) nên đồ thị KHÔNG có chu trình Euler và KHÔNG có đường đi Euler.`;
        eulerConclusionHTML = `Vì đồ thị có ${oddNodes.length} đỉnh bậc lẻ (${oddNodes.join(', ')}) nên đồ thị <strong style="color:var(--accent-red)">KHÔNG có chu trình Euler</strong> và <strong style="color:var(--accent-red)">KHÔNG có đường đi Euler</strong>.`;
    }

    let degStrings = sortedNodes.map(node => `deg(${node.id})=${degrees[node.id]}`);
    let q3aMarkdown = `**a) Bậc của các đỉnh và lý luận Euler:**\n`;
    q3aMarkdown += `*   Ta có bậc của các đỉnh là: ${degStrings.map(t => `$${t}$`).join(', ')}.\n`;
    q3aMarkdown += `*   ${eulerConclusion}\n`;

    let q3aHTML = `
        <p><strong>a) Bậc của các đỉnh và lý luận Euler:</strong></p>
        <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
            <li style="margin-bottom: 0.5rem;">Ta có bậc của các đỉnh là: <br><span style="font-family:'Times New Roman', serif; font-style:italic; color:var(--accent-blue);">${degStrings.join(', ')}</span></li>
            <li><strong>Kết luận:</strong> ${eulerConclusionHTML}</li>
        </ul>
    `;

    // --- 3b. Hamilton Check ---
    let hamResult = findHamiltonianCycleOrPath();
    let q3bMarkdown = `**b) Lý luận Hamilton:**\n`;
    let q3bHTML = `<p><strong>b) Lý luận Hamilton:</strong></p>`;
    
    if (hamResult.type === 'cycle') {
        let pathStr = hamResult.path.join(' \\to ');
        q3bMarkdown += `*   Đồ thị có chu trình Hamilton: $${pathStr}$\n`;
        q3bHTML += `
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li>Đồ thị <strong style="color:var(--accent-green)">CÓ chu trình Hamilton</strong>: <span style="font-family:'Times New Roman', serif; font-weight:bold; color:var(--accent-green);">${hamResult.path.join(' → ')}</span></li>
            </ul>
        `;
    } else if (hamResult.type === 'path') {
        let pathStr = hamResult.path.join(' \\to ');
        q3bMarkdown += `*   Đồ thị có đường đi Hamilton (dò theo viền ngoài đồ thị): $${pathStr}$\n`;
        q3bHTML += `
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li>Đồ thị <strong style="color:var(--accent-green)">CÓ đường đi Hamilton</strong>: <span style="font-family:'Times New Roman', serif; font-weight:bold; color:var(--accent-green);">${hamResult.path.join(' → ')}</span></li>
            </ul>
        `;
    } else {
        q3bMarkdown += `*   Đồ thị không có chu trình hay đường đi Hamilton.\n`;
        q3bHTML += `
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li style="color:var(--accent-red); font-weight:bold;">Đồ thị không có chu trình hay đường đi Hamilton.</li>
            </ul>
        `;
    }

    // --- 3c. Dijkstra ---
    let dist = {};
    let prev = {};
    let visited = new Set();
    let steps = [];

    sortedNodes.forEach(node => {
        dist[node.id] = Infinity;
        prev[node.id] = null;
    });
    dist[startId] = 0;

    function getStepState() {
        let state = {};
        sortedNodes.forEach(node => {
            state[node.id] = {
                d: dist[node.id],
                p: prev[node.id]
            };
        });
        return state;
    }

    steps.push({
        S: "$\\emptyset$",
        S_raw: "Ø",
        dists: getStepState(),
        selectedNode: startId
    });

    let visitedList = [];

    while (visited.size < n) {
        let u = null;
        sortedNodes.forEach(node => {
            if (!visited.has(node.id)) {
                if (u === null || dist[node.id] < dist[u]) {
                    u = node.id;
                }
            }
        });

        if (u === null || dist[u] === Infinity) break;

        if (steps.length > 0) {
            steps[steps.length - 1].selectedNode = u;
        }

        visited.add(u);
        visitedList.push(u);

        let neighbors = graph.edges.filter(e => e.u === u);
        neighbors = [...neighbors, ...graph.edges.filter(e => e.v === u).map(e => ({ u: e.v, v: e.u, w: e.w }))];

        neighbors.forEach(edge => {
            if (!visited.has(edge.v)) {
                let alt = dist[u] + edge.w;
                if (alt < dist[edge.v]) {
                    dist[edge.v] = alt;
                    prev[edge.v] = u;
                }
            }
        });

        if (visited.size < n) {
            let S_latex = `\\{ ` + visitedList.join(', ') + ` \\}`;
            let S_raw = "{" + visitedList.join(', ') + "}";
            steps.push({
                S: S_latex,
                S_raw: S_raw,
                dists: getStepState(),
                selectedNode: null
            });
        }
    }

    // Dijkstra Markdown Table
    let otherNodes = sortedNodes.filter(node => node.id !== startId);
    let dijkstraHeaders = ["**Bước lặp**", "**Tập S**", ...sortedNodes.map(node => `**${node.id.toLowerCase()}**`)];
    let dijkstraTableLines = [];
    dijkstraTableLines.push("| " + dijkstraHeaders.join(" | ") + " |");
    dijkstraTableLines.push("| " + dijkstraHeaders.map(() => ":---:").join(" | ") + " |");

    steps.forEach((step, idx) => {
        let rowCells = [];
        rowCells.push(idx === 0 ? "Khởi tạo" : `${idx}`);
        
        if (idx === 0) {
            rowCells.push("$\\emptyset$");
        } else {
            let visitedSlice = visitedList.slice(0, idx).map(n => n.toLowerCase());
            rowCells.push(`$\\{ ${visitedSlice.join(', ')} \\}$`);
        }

        sortedNodes.forEach(node => {
            let wasVisitedBefore = false;
            for (let prevIdx = 0; prevIdx < idx; prevIdx++) {
                if (steps[prevIdx].selectedNode === node.id) {
                    wasVisitedBefore = true;
                    break;
                }
            }

            if (wasVisitedBefore) {
                rowCells.push("-");
            } else {
                let dVal = step.dists[node.id].d;
                let pVal = step.dists[node.id].p;
                let isSelected = (step.selectedNode === node.id);

                let cellStr = "";
                if (dVal === Infinity) {
                    cellStr = `\\infty, ${pVal ? pVal.toLowerCase() : startId.toLowerCase()}`;
                } else {
                    cellStr = `${dVal}, ${pVal ? pVal.toLowerCase() : startId.toLowerCase()}`;
                }

                if (isSelected) {
                    cellStr += "*";
                }
                rowCells.push(`$${cellStr}$`);
            }
        });

        dijkstraTableLines.push("| " + rowCells.join(" | ") + " |");
    });

    // Dijkstra Conclusion Table (Markdown)
    let conclusionTableLines = [];
    conclusionTableLines.push("| **Đỉnh đích** | **Trọng số (Khoảng cách)** | **Đường đi (Truy ngược chữ cái)** |");
    conclusionTableLines.push("| :---: | :---: | :---: |");

    otherNodes.forEach(destNode => {
        let dVal = dist[destNode.id];
        let pathStr = "";
        if (dVal === Infinity) {
            pathStr = "Không có đường đi";
        } else {
            let path = [];
            let curr = destNode.id;
            while (curr !== null) {
                path.unshift(curr);
                curr = prev[curr];
            }
            pathStr = `$${path.map(n => n.toLowerCase()).join(' \\to ')}$`;
        }
        let distStr = dVal === Infinity ? "$\\infty$" : `${dVal}`;
        conclusionTableLines.push(`| **${destNode.id}** | ${distStr} | ${pathStr} |`);
    });

    // Dijkstra Step Table (HTML)
    let htmlDijkstraStepTable = `<table style="border-collapse: collapse; width: 100%; margin: 1.5rem 0; font-family: inherit; font-size: 0.85rem; text-align: center;">`;
    htmlDijkstraStepTable += `<thead><tr style="border-bottom: 2px solid var(--glass-border); background: rgba(255,255,255,0.02);">`;
    htmlDijkstraStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">Bước lặp</th>`;
    htmlDijkstraStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">Tập S</th>`;
    sortedNodes.forEach(n => {
        htmlDijkstraStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">${n.id.toLowerCase()}</th>`;
    });
    htmlDijkstraStepTable += `</tr></thead><tbody>`;

    steps.forEach((step, idx) => {
        htmlDijkstraStepTable += `<tr style="border-bottom: 1px solid var(--glass-border);">`;
        htmlDijkstraStepTable += `<td style="padding: 10px; font-weight: bold;">${idx === 0 ? "Khởi tạo" : idx}</td>`;
        if (idx === 0) {
            htmlDijkstraStepTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif;">Ø</td>`;
        } else {
            let visitedSlice = visitedList.slice(0, idx).map(n => n.toLowerCase());
            htmlDijkstraStepTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif;">{ ${visitedSlice.join(', ')} }</td>`;
        }

        sortedNodes.forEach(node => {
            let wasVisitedBefore = false;
            for (let prevIdx = 0; prevIdx < idx; prevIdx++) {
                if (steps[prevIdx].selectedNode === node.id) {
                    wasVisitedBefore = true;
                    break;
                }
            }

            if (wasVisitedBefore) {
                htmlDijkstraStepTable += `<td style="padding: 10px; color: var(--muted);">-</td>`;
            } else {
                let dVal = step.dists[node.id].d;
                let pVal = step.dists[node.id].p;
                let isSelected = (step.selectedNode === node.id);

                let valStr = dVal === Infinity ? "∞" : dVal;
                let predStr = (pVal || startId).toLowerCase();

                let cellContent = `${valStr}, ${predStr}`;
                if (isSelected) {
                    cellContent = `<span style="color: var(--accent-green); font-weight: bold;">${cellContent}*</span>`;
                }

                htmlDijkstraStepTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif;">${cellContent}</td>`;
            }
        });
        htmlDijkstraStepTable += `</tr>`;
    });
    htmlDijkstraStepTable += `</tbody></table>`;

    // Dijkstra Conclusion Table (HTML)
    let htmlDijkstraConclusionTable = `<table style="border-collapse: collapse; width: 80%; margin: 1.5rem auto; font-family: inherit; font-size: 0.9rem; text-align: center;">`;
    htmlDijkstraConclusionTable += `<thead><tr style="border-bottom: 2px solid var(--glass-border); background: rgba(255,255,255,0.02);">`;
    htmlDijkstraConclusionTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue); width: 20%;">Đỉnh đích</th>`;
    htmlDijkstraConclusionTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue); width: 30%;">Trọng số (Khoảng cách)</th>`;
    htmlDijkstraConclusionTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue); width: 50%;">Đường đi (Truy ngược chữ cái)</th>`;
    htmlDijkstraConclusionTable += `</tr></thead><tbody>`;

    otherNodes.forEach(destNode => {
        let dVal = dist[destNode.id];
        let pathHtml = "";
        if (dVal === Infinity) {
            pathHtml = `<span style="color: var(--accent-red);">Không có đường đi</span>`;
        } else {
            let path = [];
            let curr = destNode.id;
            while (curr !== null) {
                path.unshift(curr);
                curr = prev[curr];
            }
            pathHtml = path.map(n => n.toLowerCase()).join(' → ');
        }

        htmlDijkstraConclusionTable += `<tr style="border-bottom: 1px solid var(--glass-border);">`;
        htmlDijkstraConclusionTable += `<td style="padding: 10px; font-weight: bold; color: var(--accent-blue);">${destNode.id}</td>`;
        htmlDijkstraConclusionTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif;">${dVal === Infinity ? "∞" : dVal}</td>`;
        htmlDijkstraConclusionTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif; color: var(--accent-green); text-align: left; padding-left: 2rem;">${pathHtml}</td>`;
        htmlDijkstraConclusionTable += `</tr>`;
    });
    htmlDijkstraConclusionTable += `</tbody></table>`;

    let q3cMarkdown = `**c) Tìm đường đi ngắn nhất từ đỉnh \`${startId.toLowerCase()}\` (Thuật toán Dijkstra):**\n\n`;
    q3cMarkdown += `*   **Bảng các bước lặp thuật toán:**\n\n${dijkstraTableLines.join("\n")}\n\n`;
    q3cMarkdown += `*   **Bảng kết luận đường đi:**\n\nĐường đi ngắn nhất từ đỉnh \`${startId.toLowerCase()}\` là:\n\n${conclusionTableLines.join("\n")}\n`;

    let q3cHTML = `
        <p><strong>c) Tìm đường đi ngắn nhất từ đỉnh <span style="font-family:'Times New Roman', serif; font-style:italic; font-weight:bold;">${startId.toLowerCase()}</span> (Thuật toán Dijkstra):</strong></p>
        <p style="margin-top: 0.5rem;"><strong>* Bảng các bước lặp thuật toán:</strong></p>
        <div style="overflow-x: auto;">
            ${htmlDijkstraStepTable}
        </div>
        
        <p><strong>* Bảng kết luận đường đi:</strong></p>
        <p style="margin-top: 0.5rem;">Đường đi ngắn nhất từ đỉnh <strong>${startId.toLowerCase()}</strong> là:</p>
        <div style="overflow-x: auto;">
            ${htmlDijkstraConclusionTable}
        </div>
    `;

    // --- 3d. Kruskal ---
    let sortedEdges = [...graph.edges];
    if (isMinKruskal) {
        sortedEdges.sort((a, b) => a.w - b.w);
    } else {
        sortedEdges.sort((a, b) => b.w - a.w);
    }

    let parent = {};
    graph.nodes.forEach(n => parent[n.id] = n.id);

    function find(i) {
        while (parent[i] !== i) i = parent[i];
        return i;
    }

    function union(i, j) {
        let rootA = find(i);
        let rootB = find(j);
        parent[rootA] = rootB;
    }

    let kruskalSteps = [];
    let mstEdges = [];
    let totalWeight = 0;

    sortedEdges.forEach(edge => {
        let rootU = find(edge.u);
        let rootV = find(edge.v);

        if (rootU !== rootV) {
            mstEdges.push(edge);
            totalWeight += edge.w;
            union(edge.u, edge.v);
            kruskalSteps.push({
                u: edge.u,
                v: edge.v,
                w: edge.w,
                selected: true,
                reason: "Chọn"
            });
        } else {
            kruskalSteps.push({
                u: edge.u,
                v: edge.v,
                w: edge.w,
                selected: false,
                reason: "Không chọn (Vì tạo thành chu trình)"
            });
        }
    });

    highlightedEdges = mstEdges;
    highlightedNodes = [...new Set(mstEdges.flatMap(e => [e.u, e.v]))];

    let kruskalTableLines = [];
    kruskalTableLines.push("| **Cạnh ($E_T$)** | **Trọng số** | **Ghi chú (Trạng thái)** |");
    kruskalTableLines.push("| :--- | :--- | :--- |");

    kruskalSteps.forEach(step => {
        kruskalTableLines.push(`| (${step.u.toLowerCase()}, ${step.v.toLowerCase()}) | ${step.w} | ${step.reason} |`);
    });

    let mstEdgeStrings = mstEdges.map(e => `(${e.u.toLowerCase()},${e.v.toLowerCase()})`).join(', ');
    let totalWeightFormula = mstEdges.map(e => e.w).join(' + ');

    let half = Math.ceil(mstEdges.length / 2);
    let kruskalFinalTableLines = [];
    kruskalFinalTableLines.push("| **Cạnh** | **Trọng số** | **Cạnh** | **Trọng số** |");
    kruskalFinalTableLines.push("| :---: | :---: | :---: | :---: |");

    for (let i = 0; i < half; i++) {
        let e1 = mstEdges[i];
        let e2 = mstEdges[half + i];
        let c1 = e1.u.toLowerCase() + e1.v.toLowerCase();
        let w1 = e1.w;
        let c2 = e2 ? (e2.u.toLowerCase() + e2.v.toLowerCase()) : "";
        let w2 = e2 ? e2.w : "";
        kruskalFinalTableLines.push(`| ${c1} | ${w1} | ${c2} | ${w2} |`);
    }
    kruskalFinalTableLines.push(`| **Tổng** | **T = ${totalWeight}** | | |`);

    let kruskalTitle = isMinKruskal ? "cây khung nhỏ nhất" : "cây khung lớn nhất";

    let htmlKruskalStepTable = `<table style="border-collapse: collapse; width: 100%; margin: 1.5rem 0; font-family: inherit; font-size: 0.9rem; text-align: left;">`;
    htmlKruskalStepTable += `<thead><tr style="border-bottom: 2px solid var(--glass-border); background: rgba(255,255,255,0.02);">`;
    htmlKruskalStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">Cạnh (E_T)</th>`;
    htmlKruskalStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">Trọng số</th>`;
    htmlKruskalStepTable += `<th style="padding: 10px; font-weight: bold; color: var(--accent-blue);">Ghi chú (Trạng thái)</th>`;
    htmlKruskalStepTable += `</tr></thead><tbody>`;

    kruskalSteps.forEach(step => {
        let cellColor = step.selected ? 'var(--accent-green)' : 'var(--accent-red)';
        htmlKruskalStepTable += `<tr style="border-bottom: 1px solid var(--glass-border);">`;
        htmlKruskalStepTable += `<td style="padding: 10px; font-weight: bold;">(${step.u.toLowerCase()}, ${step.v.toLowerCase()})</td>`;
        htmlKruskalStepTable += `<td style="padding: 10px; font-family: 'Times New Roman', Times, serif;">${step.w}</td>`;
        htmlKruskalStepTable += `<td style="padding: 10px; color: ${cellColor}; font-weight: 500;">${step.reason}</td>`;
        htmlKruskalStepTable += `</tr>`;
    });
    htmlKruskalStepTable += `</tbody></table>`;

    let kruskalSortNote = isMinKruskal
        ? "*(Ghi chú: Lấy cạnh sắp xếp từ BÉ lên LỚN)*"
        : "*(Ghi chú: Lấy cạnh sắp xếp từ LỚN xuống BÉ)*";

    let q3dMarkdown = `**d) Tìm ${kruskalTitle} (Thuật toán Kruskal):**\n\n`;
    q3dMarkdown += `*   **Bảng sắp xếp và chọn cạnh:**\n\n${kruskalTableLines.join("\n")}\n\n`;
    q3dMarkdown += `*   **Kết luận:**\n`;
    q3dMarkdown += `    Tổng trọng số của ${kruskalTitle} là:\n`;
    q3dMarkdown += `    $T = ${totalWeightFormula} = ${totalWeight}$\n\n`;
    q3dMarkdown += `    Các cạnh của cây khung gồm: ${mstEdgeStrings}`;

    let q3dHTML = `
        <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 2rem 0;">
        <p><strong>d) Tìm ${kruskalTitle} (Thuật toán Kruskal):</strong></p>
        <p style="margin-top: 0.5rem;"><strong>* Bảng sắp xếp và chọn cạnh:</strong></p>
        <div style="overflow-x: auto;">
            ${htmlKruskalStepTable}
        </div>
        
        <p><strong>* Kết luận:</strong></p>
        <ul style="padding-left: 1.5rem; line-height: 1.6;">
            <li style="margin-bottom: 0.5rem;">Tổng trọng số của ${kruskalTitle} là:<br>
                <span style="font-family: 'Times New Roman', Times, serif; font-size: 1.15rem; font-weight: bold; color: var(--accent-green); background: rgba(74, 222, 128, 0.05); padding: 0.25rem 0.5rem; border-radius: 0.25rem; display: inline-block; margin-top: 0.25rem;">
                    T = ${totalWeightFormula} = ${totalWeight}
                </span>
            </li>
            <li><span style="font-weight: bold; color: var(--accent-blue);">Các cạnh của cây khung gồm:</span> ${mstEdgeStrings}</li>
        </ul>
    `;

    // --- COMBINE EVERYTHING ---
    let markdown = `**BÀI LÀM**\n\n` + q3aMarkdown + `\n---\n\n` + q3bMarkdown + `\n---\n\n` + q3cMarkdown + `\n---\n\n` + q3dMarkdown;
    let htmlPreview = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p style="font-size: 1.1rem; color: var(--accent-blue); font-weight: bold; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">Bài 3: Thuật toán Đồ thị</p>
            ${q3aHTML}
            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;">
            ${q3bHTML}
            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;">
            ${q3cHTML}
            ${q3dHTML}
        </div>
    `;

    document.getElementById('uit-q3-raw-text').value = markdown;
    document.getElementById('uit-q3-preview-content').innerHTML = htmlPreview;
    document.getElementById('uit-q3-exam-card').style.display = 'block';

    q3Result.markdown = markdown;
    q3Result.html = htmlPreview;
}
