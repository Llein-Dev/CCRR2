// ================= GRAPH SYSTEM MODULE =================
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

let graph = {
    nodes: [],
    edges: [],
    type: 'undirected'
};

let currentMode = 'vertex'; // vertex, edge, delete
let selectedNode = null;
let dragNode = null;

let lastCanvasWidth = canvas.width;
let lastCanvasHeight = canvas.height;

function resizeCanvas() {
    const container = canvas.parentElement;
    if (!container) return;
    const newWidth = container.clientWidth;
    const isMobile = window.innerWidth <= 768;
    const newHeight = isMobile ? 350 : 500;
    
    if (graph.nodes.length > 0 && lastCanvasWidth > 0 && lastCanvasHeight > 0) {
        const scaleX = newWidth / lastCanvasWidth;
        const scaleY = newHeight / lastCanvasHeight;
        graph.nodes.forEach(n => {
            n.x = n.x * scaleX;
            n.y = n.y * scaleY;
            n.x = Math.max(16, Math.min(newWidth - 16, n.x));
            n.y = Math.max(16, Math.min(newHeight - 16, n.y));
        });
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    lastCanvasWidth = newWidth;
    lastCanvasHeight = newHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setGraphMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.graph-ctrl .btn').forEach(b => b.classList.remove('btn-primary'));
    const clickedBtn = document.getElementById(`btn-mode-${mode}`);
    if (clickedBtn) {
        clickedBtn.classList.add('btn-primary');
    }
}

function changeGraphType() {
    graph.type = document.getElementById('graph-type').value;
    drawGraph();
}

function clearGraph() {
    graph.nodes = [];
    graph.edges = [];
    updateNodeSelects();
    drawGraph();
    document.getElementById('graph-output').innerText = "Đã xóa toàn bộ đồ thị.";
}

function loadQuestion3Preset() {
    loadGraphPreset(2);
}

function loadGraphPreset(num) {
    graph.type = 'undirected';
    document.getElementById('graph-type').value = 'undirected';
    
    const w = canvas.width;
    const h = canvas.height;
    
    graph.nodes = [
        { id: 'A', x: w * 0.45, y: h * 0.15 },
        { id: 'B', x: w * 0.65, y: h * 0.15 },
        { id: 'C', x: w * 0.25, y: h * 0.45 },
        { id: 'D', x: w * 0.45, y: h * 0.45 },
        { id: 'E', x: w * 0.65, y: h * 0.45 },
        { id: 'F', x: w * 0.80, y: h * 0.45 },
        { id: 'G', x: w * 0.25, y: h * 0.80 },
        { id: 'H', x: w * 0.45, y: h * 0.80 },
        { id: 'I', x: w * 0.65, y: h * 0.80 },
        { id: 'J', x: w * 0.80, y: h * 0.80 }
    ];

    if (num === 1) {
        // Đề 1 Edges & Weights
        graph.edges = [
            { u: 'A', v: 'B', w: 4 },
            { u: 'A', v: 'C', w: 2 },
            { u: 'A', v: 'E', w: 1 },
            { u: 'A', v: 'G', w: 10 },
            { u: 'B', v: 'G', w: 3 },
            { u: 'B', v: 'F', w: 8 },
            { u: 'B', v: 'J', w: 5 },
            { u: 'C', v: 'D', w: 1 },
            { u: 'C', v: 'G', w: 2 },
            { u: 'C', v: 'H', w: 20 },
            { u: 'D', v: 'E', w: 28 },
            { u: 'D', v: 'H', w: 6 },
            { u: 'D', v: 'I', w: 3 },
            { u: 'E', v: 'I', w: 1 },
            { u: 'E', v: 'J', w: 3 },
            { u: 'F', v: 'J', w: 2 },
            { u: 'G', v: 'H', w: 12 },
            { u: 'H', v: 'I', w: 1 },
            { u: 'I', v: 'J', w: 30 }
        ];
        
        updateNodeSelects();
        document.getElementById('start-node-select').value = 'D'; // Dijkstra starts at D in Đề 1
        loadGraphPresetText(1);
        
        document.getElementById('graph-output').innerText = "Đã nạp Đồ thị Đề thi số 1.\n- 10 đỉnh.\n- 19 cạnh.\n- Đỉnh gốc Dijkstra mặc định: D.";
    } else {
        // Đề 2 Edges & Weights
        graph.edges = [
            { u: 'A', v: 'B', w: 3 },
            { u: 'A', v: 'C', w: 1 },
            { u: 'A', v: 'E', w: 1 },
            { u: 'B', v: 'G', w: 8 },
            { u: 'A', v: 'J', w: 30 },
            { u: 'B', v: 'F', w: 10 },
            { u: 'B', v: 'J', w: 6 },
            { u: 'C', v: 'D', w: 2 },
            { u: 'C', v: 'G', w: 1 },
            { u: 'C', v: 'H', w: 24 },
            { u: 'D', v: 'E', w: 4 },
            { u: 'D', v: 'H', w: 5 },
            { u: 'D', v: 'I', w: 2 },
            { u: 'E', v: 'I', w: 9 },
            { u: 'E', v: 'J', w: 30 },
            { u: 'F', v: 'J', w: 3 },
            { u: 'G', v: 'H', w: 18 },
            { u: 'H', v: 'I', w: 1 },
            { u: 'I', v: 'J', w: 40 }
        ];
        
        updateNodeSelects();
        document.getElementById('start-node-select').value = 'E'; // Dijkstra starts at E in Đề 2
        loadGraphPresetText(2);
        
        document.getElementById('graph-output').innerText = "Đã nạp Đồ thị Đề thi số 2.\n- 10 đỉnh.\n- 19 cạnh.\n- Đỉnh gốc Dijkstra mặc định: E.";
    }

    drawGraph();
}

function loadGraphPresetText(num) {
    const txtArea = document.getElementById('graph-text-input');
    if (txtArea) {
        if (num === 1) {
            txtArea.value = "A-B: 4, A-C: 2, A-E: 1, A-G: 10, B-G: 3, B-F: 8, B-J: 5, C-D: 1, C-G: 2, C-H: 20, D-E: 28, D-H: 6, D-I: 3, E-I: 1, E-J: 3, F-J: 2, G-H: 12, H-I: 1, I-J: 30";
        } else {
            txtArea.value = "A-B: 3, A-C: 1, A-E: 1, B-G: 8, A-J: 30, B-F: 10, B-J: 6, C-D: 2, C-G: 1, C-H: 24, D-E: 4, D-H: 5, D-I: 2, E-I: 9, E-J: 30, F-J: 3, G-H: 18, H-I: 1, I-J: 40";
        }
    }
}

function parseGraphFromText() {
    const inputEl = document.getElementById('graph-text-input');
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) {
        alert("Vui lòng nhập danh sách cạnh trước!");
        return;
    }

    const regex = /([a-zA-Z0-9_]+)[\s,\-–—→:]+([a-zA-Z0-9_]+)[\s,\-–—→:]+(-?\d+)/g;
    let match;
    const parsedEdges = [];
    const parsedNodesSet = new Set();

    while ((match = regex.exec(text)) !== null) {
        const u = match[1].toUpperCase();
        const v = match[2].toUpperCase();
        const w = parseInt(match[3]);
        if (u !== v && !isNaN(w)) {
            parsedEdges.push({ u, v, w });
            parsedNodesSet.add(u);
            parsedNodesSet.add(v);
        }
    }

    if (parsedEdges.length === 0) {
        alert("Không nhận diện được cạnh nào! Vui lòng kiểm tra lại định dạng (ví dụ: A-B: 4, A-C: 2).");
        return;
    }

    graph.edges = parsedEdges;
    graph.nodes = [];

    const uniqueNodes = Array.from(parsedNodesSet).sort();
    const numNodes = uniqueNodes.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.38;

    uniqueNodes.forEach((nodeId, index) => {
        const angle = (2 * Math.PI * index) / numNodes - Math.PI / 2;
        graph.nodes.push({
            id: nodeId,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    });

    updateNodeSelects();
    
    if (graph.nodes.length > 0) {
        const startSelect = document.getElementById('start-node-select');
        if (startSelect) {
            if (!startSelect.value || !uniqueNodes.includes(startSelect.value)) {
                startSelect.value = uniqueNodes[0];
            }
        }
    }

    drawGraph();

    const outBox = document.getElementById('graph-output');
    if (outBox) {
        outBox.innerText = `Nạp đồ thị thành công từ văn bản:\n- Đã nạp ${uniqueNodes.length} đỉnh: ${uniqueNodes.join(', ')}\n- Đã nạp ${parsedEdges.length} cạnh.`;
    }
}

function updateNodeSelects() {
    const startSelect = document.getElementById('start-node-select');
    if (!startSelect) return;
    const currentVal = startSelect.value;
    startSelect.innerHTML = '';
    graph.nodes.forEach(n => {
        startSelect.innerHTML += `<option value="${n.id}">${n.id}</option>`;
    });
    if(currentVal && graph.nodes.some(n=>n.id === currentVal)) {
        startSelect.value = currentVal;
    }
}

// --- TOUCH AND MOUSE CANVAS INTERACTION LOGIC ---
function handleStart(x, y) {
    let clickedNode = graph.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 20);

    if (currentMode === 'vertex') {
        if (!clickedNode) {
            let label = String.fromCharCode(65 + graph.nodes.length);
            if(graph.nodes.some(n=>n.id === label)) label += graph.nodes.length;
            graph.nodes.push({ id: label, x, y });
            updateNodeSelects();
        } else {
            dragNode = clickedNode;
        }
    } else if (currentMode === 'edge') {
        if (clickedNode) {
            if (!selectedNode) {
                selectedNode = clickedNode;
            } else {
                if (selectedNode !== clickedNode) {
                    let weightStr = prompt("Nhập trọng số cho cạnh này:", "1");
                    let weight = parseInt(weightStr);
                    if (!isNaN(weight)) {
                        graph.edges = graph.edges.filter(edge => !(edge.u === selectedNode.id && edge.v === clickedNode.id));
                        graph.edges.push({ u: selectedNode.id, v: clickedNode.id, w: weight });
                    }
                }
                selectedNode = null;
            }
        } else {
            selectedNode = null;
        }
    } else if (currentMode === 'delete') {
        if (clickedNode) {
            graph.nodes = graph.nodes.filter(n => n !== clickedNode);
            graph.edges = graph.edges.filter(edge => edge.u !== clickedNode.id && edge.v !== clickedNode.id);
            updateNodeSelects();
        } else {
            graph.edges = graph.edges.filter(edge => {
                let n1 = graph.nodes.find(n => n.id === edge.u);
                let n2 = graph.nodes.find(n => n.id === edge.v);
                if(!n1 || !n2) return false;
                let dist = distToSegment({x, y}, n1, n2);
                return dist > 8; // threshold
            });
        }
    }
    drawGraph();
}

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleStart(x, y);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleStart(x, y);
});

canvas.addEventListener('mousemove', e => {
    if (currentMode === 'vertex' && dragNode) {
        const rect = canvas.getBoundingClientRect();
        dragNode.x = e.clientX - rect.left;
        dragNode.y = e.clientY - rect.top;
        drawGraph();
    }
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (currentMode === 'vertex' && dragNode) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        dragNode.x = touch.clientX - rect.left;
        dragNode.y = touch.clientY - rect.top;
        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => { dragNode = null; });
canvas.addEventListener('touchend', () => { dragNode = null; });

function distToSegment(p, v, w) {
    let l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// --- GRAPHICS RENDERING SUB-ROUTINE ---
let highlightedEdges = [];
let highlightedNodes = [];

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw links
    graph.edges.forEach(edge => {
        let n1 = graph.nodes.find(n => n.id === edge.u);
        let n2 = graph.nodes.find(n => n.id === edge.v);
        if (!n1 || !n2) return;

        let isHighlighted = highlightedEdges.some(he => 
            (he.u === edge.u && he.v === edge.v) || 
            (graph.type === 'undirected' && he.u === edge.v && he.v === edge.u)
        );

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        
        ctx.strokeStyle = isHighlighted ? '#f43f5e' : '#cbd5e1';
        ctx.lineWidth = isHighlighted ? 4 : 2;
        ctx.stroke();

        // Draw directed arrowhead markers if configured
        if (graph.type === 'directed') {
            let angle = Math.atan2(n2.y - n1.y, n2.x - n1.x);
            let arrowX = n2.x - 22 * Math.cos(angle);
            let arrowY = n2.y - 22 * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI/6), arrowY - 10 * Math.sin(angle - Math.PI/6));
            ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI/6), arrowY - 10 * Math.sin(angle + Math.PI/6));
            ctx.closePath();
            ctx.fillStyle = isHighlighted ? '#f43f5e' : '#94a3b8';
            ctx.fill();
        }

        // Render metrics text elements along graph vectors (high contrast blue for light mode)
        let midX = (n1.x + n2.x) / 2;
        let midY = (n1.y + n2.y) / 2;
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 13px sans-serif';
        ctx.shadowBlur = 0;
        ctx.fillText(edge.w, midX, midY - 4);
    });

    // Draw computational nodes
    graph.nodes.forEach(n => {
        let isSel = (selectedNode && selectedNode.id === n.id);
        let isHigh = highlightedNodes.includes(n.id);

        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, 2 * Math.PI);
        
        if (isSel) ctx.fillStyle = '#e11d48';
        else if (isHigh) ctx.fillStyle = '#10b981';
        else ctx.fillStyle = '#1e293b';
        
        ctx.fill();
        ctx.strokeStyle = isHigh || isSel ? '#fff' : '#0284c7';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.id, n.x, n.y);
    });
}

// ================= CORE GRAPH ALGORITHMS SUITE =================
function isGraphConnected() {
    if (graph.nodes.length === 0) return true;
    let visited = new Set();
    let startNode = graph.nodes[0].id;
    let queue = [startNode];
    visited.add(startNode);
    
    while(queue.length > 0) {
        let u = queue.shift();
        let neighbors = graph.edges.filter(e => e.u === u).map(e => e.v);
        // Treat as undirected for connectivity
        neighbors = [...neighbors, ...graph.edges.filter(e => e.v === u).map(e => e.u)];
        neighbors.forEach(v => {
            if(!visited.has(v)) {
                visited.add(v);
                queue.push(v);
            }
        });
    }
    return visited.size === graph.nodes.length;
}

function checkGraphProperties(outBox) {
    let res = `=== Thuộc tính Đồ thị từ Canvas ===\n`;
    res += `• Số đỉnh: ${graph.nodes.length}\n`;
    res += `• Số cạnh: ${graph.edges.length}\n`;

    let degrees = {};
    graph.nodes.forEach(n => degrees[n.id] = { in: 0, out: 0, total: 0 });
    
    graph.edges.forEach(e => {
        if(degrees[e.u] && degrees[e.v]) {
            degrees[e.u].out++;
            degrees[e.v].in++;
            degrees[e.u].total++;
            degrees[e.v].total++;
        }
    });

    let maxEdgesPossible = (graph.nodes.length * (graph.nodes.length - 1)) / (graph.type === 'undirected' ? 2 : 1);
    let isComplete = (graph.edges.length === maxEdgesPossible);
    res += `• Đồ thị đầy đủ: ${isComplete ? "CÓ" : "KHÔNG"}\n`;

    res += `• Phân tích bậc của các đỉnh:\n`;
    graph.nodes.forEach(n => {
        if(graph.type === 'undirected') {
            res += `  - Đỉnh ${n.id}: Bậc = ${degrees[n.id].total}\n`;
        } else {
            res += `  - Đỉnh ${n.id}: Bậc vào = ${degrees[n.id].in}, Bậc ra = ${degrees[n.id].out}\n`;
        }
    });

    outBox.innerText = res;
}

