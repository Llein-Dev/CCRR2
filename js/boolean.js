// ================= BOOLEAN ALGEBRA MODULE =================
function initMintermSelectors() {
    const varsCount = parseInt(document.getElementById('bool-vars').value);
    const wrapper = document.getElementById('minterms-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    const total = 1 << varsCount;
    for(let i = 0; i < total; i++) {
        const bin = i.toString(2).padStart(varsCount, '0');
        wrapper.innerHTML += `
            <label class="minterm-item" for="mt-${bin}">
                <input type="checkbox" id="mt-${bin}" value="${bin}">
                <span>${bin} <span class="dec-val">(${i})</span></span>
            </label>
        `;
    }
}

function toggleInputMode() {
    const mode = document.getElementById('input-mode').value;
    document.getElementById('exam-string-input').style.display = mode === 'exam' ? 'flex' : 'none';
    document.getElementById('interactive-checkboxes').style.display = mode === 'interactive' ? 'flex' : 'none';
}

function solveBoolean() {
    const varsCount = parseInt(document.getElementById('bool-vars').value);
    const mode = document.getElementById('input-mode').value;
    const varLabels = varsCount === 4 ? ['x','y','z','t'] : (varsCount === 3 ? ['x','y','z'] : ['a','b','c','d','e']);
    
    let inactiveMinterms = new Set();
    let activeMinterms = [];

    if (mode === 'exam') {
        const rawStr = document.getElementById('f0-input').value;
        const terms = rawStr.replace(/[^01,\s]/g, '').split(/[\s,]+/);
        terms.forEach(t => {
            if(t.trim().length === varsCount) inactiveMinterms.add(t.trim());
        });
        
        const total = 1 << varsCount;
        for(let i=0; i<total; i++) {
            const bin = i.toString(2).padStart(varsCount, '0');
            if(!inactiveMinterms.has(bin)) {
                activeMinterms.push(bin);
            }
        }
    } else {
        const total = 1 << varsCount;
        for(let i=0; i<total; i++) {
            const bin = i.toString(2).padStart(varsCount, '0');
            const el = document.getElementById(`mt-${bin}`);
            if(el && el.checked) {
                activeMinterms.push(bin);
            } else {
                inactiveMinterms.add(bin);
            }
        }
    }

    if(activeMinterms.length === 0) {
        document.getElementById('pdnf-output').innerText = "f = 0 (Constant False)";
        document.getElementById('sop-output').innerText = "f = 0";
        document.getElementById('circuit-svg-container').innerHTML = "";
        document.getElementById('uit-exam-card').style.display = 'none';
        return;
    }

    // 1. Format PDNF Output
    let pdnfParts = activeMinterms.map(bin => {
        return '(' + bin.split('').map((bit, idx) => (bit === '1' ? '' : '~') + varLabels[idx]).join(' * ') + ')';
    });
    document.getElementById('pdnf-output').innerText = pdnfParts.join(' + \n');

    // 2. Perform Quine-McCluskey Simplification Engine
    const primeImplicants = runQuineMcCluskey(activeMinterms, varsCount);
    const minimalSOPs = runPetrickMethod(primeImplicants, activeMinterms, varLabels);

    if (minimalSOPs.length === 0) {
        document.getElementById('sop-output').innerText = "No solution found";
        document.getElementById('circuit-svg-container').innerHTML = "";
        document.getElementById('uit-exam-card').style.display = 'none';
        return;
    }

    // Print Minimal Formulas
    let sopText = minimalSOPs.map((combo, index) => `Option ${index + 1}: ${combo.text}`).join('\n');
    document.getElementById('sop-output').innerText = sopText;

    // 3. Render Digital Schematic Engine dynamically via SVG
    renderLogicCircuit(minimalSOPs[0].text, varLabels);

    // 4. Generate UIT Exam Answer Sheet Output
    if (varsCount === 4) {
        document.getElementById('uit-exam-card').style.display = 'block';
        generateUitExamAnswer(activeMinterms, inactiveMinterms, primeImplicants, minimalSOPs, 0);
        setTimeout(() => scrollToElement('uit-exam-card'), 100);
    } else {
        document.getElementById('uit-exam-card').style.display = 'none';
    }
}

// Helper to translate term (like '0-1-') to LaTeX style
function termToLaTeX(term, varLabels) {
    let parts = [];
    for(let i=0; i<term.length; i++) {
        if(term[i] === '1') {
            parts.push(varLabels[i]);
        } else if(term[i] === '0') {
            parts.push(`\\overline{${varLabels[i]}}`);
        }
    }
    return parts.length === 0 ? "1" : parts.join('');
}

// Helper to translate LaTeX style to HTML with overlines for preview
function latexToHTML(latex) {
    let clean = latex.replace(/\$/g, '');
    clean = clean.replace(/\\lor/g, ' ∨ ');
    return clean.replace(/\\overline\{([a-zA-Z0-9]+)\}/g, '<span style="text-decoration: overline; display: inline-block;">$1</span>');
}

// Helper to find essential prime implicants
function findEssentialPrimeImplicants(primes, minterms) {
    let essential = new Set();
    minterms.forEach(m => {
        let coveringPrimes = primes.filter(p => p.covers.includes(m));
        if (coveringPrimes.length === 1) {
            essential.add(coveringPrimes[0]);
        }
    });
    return Array.from(essential);
}

// Helper to generate Karnaugh map in Markdown
function generateKarnaughMapMarkdown(activeMintermsSet) {
    const colCoords = [
        { x: '1', y: '0' }, // x \bar{y}
        { x: '1', y: '1' }, // x y
        { x: '0', y: '1' }, // \bar{x} y
        { x: '0', y: '0' }  // \bar{x} \bar{y}
    ];

    const rowCoords = [
        { z: '1', t: '0', z_label: '**$z$**', t_label: '**$\\overline{t}$**' },
        { z: '1', t: '1', z_label: '**$z$**', t_label: '**$t$**' },
        { z: '0', t: '1', z_label: '**$\\overline{z}$**', t_label: '**$t$**' },
        { z: '0', t: '0', z_label: '**$\\overline{z}$**', t_label: '**$\\overline{t}$**' }
    ];

    let lines = [];
    lines.push(`| | $x$ | $x$ | $\\overline{x}$ | $\\overline{x}$ | |`);
    lines.push(`| :---: | :---: | :---: | :---: | :---: | :---: |`);

    for(let r = 0; r < 4; r++) {
        let row = rowCoords[r];
        let rowCells = [];
        rowCells.push(row.z_label);

        for(let c = 0; c < 4; c++) {
            let col = colCoords[c];
            let bin = col.x + col.y + row.z + row.t;
            if(activeMintermsSet.has(bin)) {
                rowCells.push('1');
            } else {
                rowCells.push(' ');
            }
        }

        rowCells.push(row.t_label);
        lines.push(`| ` + rowCells.join(' | ') + ` |`);
    }

    lines.push(`| | **$\\overline{y}$** | **$y$** | **$y$** | **$\\overline{y}$** | |`);
    return lines.join('\n');
}

// Helper to generate Karnaugh map in HTML
function generateKarnaughMapHTML(activeMintermsSet) {
    const colCoords = [
        { x: '1', y: '0' },
        { x: '1', y: '1' },
        { x: '0', y: '1' },
        { x: '0', y: '0' }
    ];

    const rowCoords = [
        { z: '1', t: '0', z_label: 'z', t_label: '<span style="text-decoration: overline;">t</span>' },
        { z: '1', t: '1', z_label: 'z', t_label: 't' },
        { z: '0', t: '1', z_label: '<span style="text-decoration: overline;">z</span>', t_label: 't' },
        { z: '0', t: '0', z_label: '<span style="text-decoration: overline;">z</span>', t_label: '<span style="text-decoration: overline;">t</span>' }
    ];

    let html = `<table style="border-collapse: collapse; margin: 1.5rem auto; text-align: center; font-family: inherit;">`;
    
    // Top header row
    html += `<tr>`;
    html += `<td style="border: none; padding: 8px;"></td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);">x</td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);">x</td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);"><span style="text-decoration: overline;">x</span></td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);"><span style="text-decoration: overline;">x</span></td>`;
    html += `<td style="border: none; padding: 8px;"></td>`;
    html += `</tr>`;

    // Middle rows
    for(let r = 0; r < 4; r++) {
        let row = rowCoords[r];
        html += `<tr>`;
        html += `<td style="border: none; padding: 8px 16px; font-weight: bold; color: var(--accent-purple); text-align: right;">${row.z_label}</td>`;
        for(let c = 0; c < 4; c++) {
            let col = colCoords[c];
            let bin = col.x + col.y + row.z + row.t;
            let hasOne = activeMintermsSet.has(bin);
            let val = hasOne ? '1' : '';
            html += `<td style="border: 2px solid var(--border); width: 45px; height: 45px; font-size: 1.2rem; font-weight: bold; color: ${hasOne ? 'var(--accent-green)' : 'transparent'}; background: ${hasOne ? 'rgba(74, 222, 128, 0.05)' : 'transparent'};">${val}</td>`;
        }
        html += `<td style="border: none; padding: 8px 16px; font-weight: bold; color: var(--accent-purple); text-align: left;">${row.t_label}</td>`;
        html += `</tr>`;
    }

    // Bottom header row
    html += `<tr>`;
    html += `<td style="border: none; padding: 8px;"></td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);"><span style="text-decoration: overline;">y</span></td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);">y</td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);">y</td>`;
    html += `<td style="border: none; padding: 8px; font-weight: bold; color: var(--accent-blue);"><span style="text-decoration: overline;">y</span></td>`;
    html += `<td style="border: none; padding: 8px;"></td>`;
    html += `</tr>`;

    html += `</table>`;
    return html;
}

function generateCircuitDescription(coverLaTex, circuitSVG) {
    let descMarkdown = `\n\n**c) Vẽ sơ đồ mạch logic:**\n${circuitSVG}`;
    return descMarkdown;
}

function generateCircuitDescriptionHTML(coverLaTex, circuitSVG) {
    let html = `<p style="margin-top: 1rem; margin-bottom: 0.5rem;"><strong>c) Vẽ sơ đồ mạch logic:</strong></p>`;
    html += `<div style="text-align: center; margin: 1rem 0;">${circuitSVG}</div>`;
    return html;
}

// Core dynamic content generation for UIT answer sheet format
function generateUitExamAnswer(activeMinterms, inactiveMinterms, primeImplicants, minimalSOPs, selectedOptionIndex) {
    if (!minimalSOPs || minimalSOPs.length === 0) return;
    
    let selectedCover = minimalSOPs[selectedOptionIndex];
    let activeMintermsSet = new Set(activeMinterms);
    let varLabels = ['x', 'y', 'z', 't'];
    let circuitSVG = renderLogicCircuit(selectedCover.text, varLabels);

    // Option selector buttons
    const selectorContainer = document.getElementById('option-selector-container');
    if (selectorContainer) {
        selectorContainer.innerHTML = '';
        if (minimalSOPs.length > 1) {
            let label = document.createElement('span');
            label.innerText = 'Phương án phủ: ';
            label.style.fontSize = '0.85rem';
            label.style.color = 'var(--muted)';
            label.style.marginRight = '0.5rem';
            selectorContainer.appendChild(label);
            
            minimalSOPs.forEach((opt, idx) => {
                let btn = document.createElement('button');
                btn.className = 'btn btn-sm';
                btn.style.padding = '0.2rem 0.6rem';
                btn.style.minHeight = '28px';
                btn.style.marginRight = '4px';
                
                if (idx === selectedOptionIndex) {
                    btn.classList.add('btn-primary');
                }
                
                btn.innerText = `PA ${idx + 1}`;
                btn.onclick = () => generateUitExamAnswer(activeMinterms, inactiveMinterms, primeImplicants, minimalSOPs, idx);
                selectorContainer.appendChild(btn);
            });
        }
    }

    // Part a calculations
    let activeStrList = activeMinterms.join(', ');
    let inactiveStrList = Array.from(inactiveMinterms).sort().join(', ');
    let termsLaTexList = activeMinterms.map(bin => termToLaTeX(bin, varLabels));
    let termsLaTexStr = termsLaTexList.map(t => `$${t}$`).join(', ');
    let pdnfStr = `$f = ` + termsLaTexList.join(' \\lor ') + `$`;

    // Part b calculations
    let kMapMarkdown = generateKarnaughMapMarkdown(activeMintermsSet);
    
    // Tế bào lớn
    let piLaTex = primeImplicants.map(pi => termToLaTeX(pi.term, varLabels));
    let piString = piLaTex.map(pi => `$${pi}$`).join(', ');

    // Tế bào lớn thiết yếu
    let essentialPrimes = findEssentialPrimeImplicants(primeImplicants, activeMinterms);
    let epiLaTex = essentialPrimes.map(pi => termToLaTeX(pi.term, varLabels));
    let epiString = epiLaTex.length > 0 ? epiLaTex.map(pi => `$${pi}$`).join(', ') : 'Không có';

    // Họ phủ tối tiểu
    let coverLaTex = selectedCover.primes.map(pi => termToLaTeX(pi.term, varLabels));
    let coverString = coverLaTex.map(pi => `$${pi}$`).join(', ');

    // Công thức đa thức tối tiểu
    let sopString = '$f = ' + coverLaTex.join(' \\lor ') + '$';

    // Build the Markdown String
    let markdown = `**BÀI LÀM**

**a) Dạng nối rời chính tắc của hàm f:**
*   Đề cho $f^{-1}(0) = \\{${inactiveStrList}\\}$.
*   Loại ${inactiveMinterms.size} chuỗi trên khỏi 16 chuỗi nhị phân, ta có các thể hiện làm cho $f=1$ là: \`${activeStrList}\`.
*   Các từ tối tiểu tương ứng: ${termsLaTexStr}.
*   Vậy biểu thức dạng nối rời chính tắc của $f$:
    ${pdnfStr}

**b) Tìm các công thức đa thức tối tiểu của hàm $f$:**
*   **Biểu đồ Karnaugh:**

${kMapMarkdown}

*   **Xác định các tế bào lớn:** ${piString}.
*   **Tế bào lớn thiết yếu:** ${epiString}.
*   **Họ phủ tối tiểu:** Chọn các tế bào đè kín số 1: ${coverString}.
*   **Các công thức đa thức tối tiểu của $f$ là:**
    ${sopString}.
${generateCircuitDescription(coverLaTex, circuitSVG)}`;

    document.getElementById('uit-raw-text').value = markdown;

    // Build the HTML Preview content
    let htmlPreview = `
        <div style="font-family: inherit; font-size: 0.95rem;">
            <p><strong>BÀI LÀM</strong></p>
            <br>
            <p><strong>a) Dạng nối rời chính tắc của hàm f:</strong></p>
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li style="margin-bottom: 0.25rem;">Đề cho f<sup>-1</sup>(0) = { ${inactiveStrList} }.</li>
                <li style="margin-bottom: 0.25rem;">Loại ${inactiveMinterms.size} chuỗi trên khỏi 16 chuỗi nhị phân, ta có các thể hiện làm cho f=1 là: <code>${activeStrList}</code>.</li>
                <li style="margin-bottom: 0.25rem;">Các từ tối tiểu tương ứng: ${latexToHTML(termsLaTexStr)}.</li>
                <li style="margin-bottom: 0.25rem;">Vậy biểu thức dạng nối rời chính tắc của f là:
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; margin-top: 0.25rem; padding: 0.25rem 0.5rem; background: var(--surface-2); border: 1px solid var(--border); border-radius: 0.25rem; width: fit-content;">${latexToHTML(pdnfStr)}</div>
                </li>
            </ul>
            
            <p><strong>b) Tìm các công thức đa thức tối tiểu của hàm f:</strong></p>
            <ul style="padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
                <li style="margin-bottom: 0.75rem;"><strong>Biểu đồ Karnaugh:</strong>
                    <div style="overflow-x: auto;">
                        ${generateKarnaughMapHTML(activeMintermsSet)}
                    </div>
                </li>
                <li style="margin-bottom: 0.5rem;"><strong>Xác định các tế bào lớn:</strong> <span style="font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; color: var(--accent-blue);">${latexToHTML(piString)}</span>.</li>
                <li style="margin-bottom: 0.5rem;"><strong>Tế bào lớn thiết yếu:</strong> <span style="font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; color: var(--accent-purple);">${latexToHTML(epiString)}</span>.</li>
                <li style="margin-bottom: 0.5rem;"><strong>Họ phủ tối tiểu:</strong> <span style="font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; color: var(--accent-green);">${latexToHTML(coverString)}</span>.</li>
                <li style="margin-bottom: 0.5rem;"><strong>Các công thức đa thức tối tiểu của f là:</strong>
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 1.15rem; margin-top: 0.25rem; padding: 0.25rem 0.5rem; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1); border-radius: 0.25rem; width: fit-content; color: var(--accent-green); font-weight: bold;">
                        ${latexToHTML(sopString)}
                    </div>
                </li>
            </ul>
            ${generateCircuitDescriptionHTML(coverLaTex, circuitSVG)}
        </div>
    `;
    
    document.getElementById('uit-preview-content').innerHTML = htmlPreview;
    q1Result.markdown = markdown;
    q1Result.html = htmlPreview;
}

function runQuineMcCluskey(minterms, varsCount) {
    let groups = {};
    minterms.forEach(m => {
        let ones = m.split('').filter(c => c==='1').length;
        if(!groups[ones]) groups[ones] = [];
        groups[ones].push({ term: m, combined: [m], used: false });
    });

    let allPrimes = new Set();
    let currentGroups = groups;
    
    while (Object.keys(currentGroups).length > 0) {
        let nextGroups = {};
        let combinedInRound = new Set();
        let keys = Object.keys(currentGroups).map(Number).sort((a,b)=>a-b);
        
        for(let i=0; i<keys.length-1; i++) {
            let g1 = currentGroups[keys[i]];
            let g2 = currentGroups[keys[i+1]];
            if(!g2) continue;

            g1.forEach(item1 => {
                g2.forEach(item2 => {
                    let diffIdx = -1;
                    let diffCount = 0;
                    for(let d=0; d<varsCount; d++) {
                        if(item1.term[d] !== item2.term[d]) {
                            diffCount++;
                            diffIdx = d;
                        }
                    }
                    if(diffCount === 1) {
                        item1.used = true;
                        item2.used = true;
                        let nextTerm = item1.term.substring(0, diffIdx) + '-' + item1.term.substring(diffIdx+1);
                        let nextCombined = [...new Set([...item1.combined, ...item2.combined])].sort();
                        
                        let ones = nextTerm.split('').filter(c => c==='1').length;
                        if(!nextGroups[ones]) nextGroups[ones] = [];
                        
                        if(!nextGroups[ones].some(x => x.term === nextTerm)) {
                            nextGroups[ones].push({ term: nextTerm, combined: nextCombined, used: false });
                        }
                    }
                });
            });
        }

        // Add unused elements from current columns to absolute prime set
        for(let g in currentGroups) {
            currentGroups[g].forEach(item => {
                if(!item.used) {
                    allPrimes.add(JSON.stringify({ term: item.term, covers: item.combined }));
                }
            });
        }
        currentGroups = nextGroups;
    }

    return Array.from(allPrimes).map(s => JSON.parse(s));
}

function runPetrickMethod(primes, minterms, varLabels) {
    if(primes.length === 0) return [];

    const mintermSet = new Set(minterms);

    // Map prime implicants to formula objects
    let primeFormulas = primes.map(p => {
        let s = "";
        for(let i=0; i<p.term.length; i++) {
            if(p.term[i] === '1') s += varLabels[i];
            else if(p.term[i] === '0') s += "~" + varLabels[i];
        }
        return { literal: s || "1", covers: p.covers, term: p.term };
    });

    // Step 1: Find essential prime implicants (the only PI covering some minterm)
    let mintermCoverage = {}; // minterm -> [PIs that cover it]
    minterms.forEach(m => { mintermCoverage[m] = []; });
    primeFormulas.forEach(pf => {
        pf.covers.forEach(m => {
            if(mintermCoverage[m]) mintermCoverage[m].push(pf);
        });
    });

    let essentials = new Set();
    minterms.forEach(m => {
        if(mintermCoverage[m] && mintermCoverage[m].length === 1) {
            essentials.add(mintermCoverage[m][0]);
        }
    });

    // Minterms covered by essentials
    let coveredByEssentials = new Set();
    essentials.forEach(pf => pf.covers.forEach(m => coveredByEssentials.add(m)));

    // Remaining minterms not yet covered
    let remainingMinterms = minterms.filter(m => !coveredByEssentials.has(m));

    // If all covered by essentials, return single solution
    if(remainingMinterms.length === 0) {
        let essArr = Array.from(essentials);
        let text = essArr.map(p => p.literal).sort().join(' + ');
        let cost = essArr.reduce((a,p) => a + p.literal.replace(/~/g,'').length, 0);
        return [{ text, cost, size: essArr.length, primes: essArr }];
    }

    // Step 2: For remaining minterms, filter candidate PIs (non-essential ones that cover at least one remaining minterm)
    const remainingSet = new Set(remainingMinterms);
    let candidatePIs = primeFormulas.filter(pf =>
        !essentials.has(pf) && pf.covers.some(m => remainingSet.has(m))
    );
    // Sort candidates by coverage count (descending) for better pruning
    candidatePIs.sort((a, b) =>
        b.covers.filter(m => remainingSet.has(m)).length -
        a.covers.filter(m => remainingSet.has(m)).length
    );

    // Step 3: Branch and bound search for minimal covers of remaining minterms
    const MAX_ITERS = 500000;
    let iterCount = 0;
    let bestCovers = [];
    let bestSize = Infinity;

    function backtrack(idx, chosen, covered) {
        if(iterCount++ > MAX_ITERS) return;
        if(covered.size === remainingMinterms.length) {
            // Valid cover found
            if(chosen.length <= bestSize) {
                if(chosen.length < bestSize) {
                    bestCovers = [];
                    bestSize = chosen.length;
                }
                let text = [...Array.from(essentials), ...chosen].map(p => p.literal).sort().join(' + ');
                if(!bestCovers.some(f => f.text === text)) {
                    let allPrimes = [...Array.from(essentials), ...chosen];
                    let cost = allPrimes.reduce((a,p) => a + p.literal.replace(/~/g,'').length, 0);
                    bestCovers.push({ text, cost, size: allPrimes.length, primes: allPrimes });
                }
            }
            return;
        }
        if(idx >= candidatePIs.length) return;
        if(chosen.length >= bestSize) return;
        
        let potentialExtra = new Set();
        for(let i = idx; i < candidatePIs.length; i++) {
            candidatePIs[i].covers.forEach(m => { if(remainingSet.has(m) && !covered.has(m)) potentialExtra.add(m); });
        }
        if(covered.size + potentialExtra.size < remainingMinterms.length) return;

        // Include candidatePIs[idx]
        let newCovered = new Set(covered);
        candidatePIs[idx].covers.forEach(m => { if(remainingSet.has(m)) newCovered.add(m); });
        backtrack(idx + 1, [...chosen, candidatePIs[idx]], newCovered);
        // Skip candidatePIs[idx]
        backtrack(idx + 1, chosen, covered);
    }

    backtrack(0, [], new Set());

    if(bestCovers.length === 0) {
        let greedyChosen = [...Array.from(essentials)];
        let covered = new Set(coveredByEssentials);
        let available = [...candidatePIs];
        while(covered.size < minterms.length && available.length > 0) {
            available.sort((a, b) => {
                let aNew = a.covers.filter(m => !covered.has(m)).length;
                let bNew = b.covers.filter(m => !covered.has(m)).length;
                return bNew - aNew;
            });
            let best = available.shift();
            greedyChosen.push(best);
            best.covers.forEach(m => covered.add(m));
        }
        let text = greedyChosen.map(p => p.literal).sort().join(' + ');
        let cost = greedyChosen.reduce((a,p) => a + p.literal.replace(/~/g,'').length, 0);
        return [{ text, cost, size: greedyChosen.length, primes: greedyChosen }];
    }

    bestCovers.sort((a,b) => (a.size !== b.size) ? a.size - b.size : a.cost - b.cost);
    let minSize = bestCovers[0].size;
    return bestCovers.filter(f => f.size === minSize);
}

function renderLogicCircuit(sopFormula, varLabels) {
    if(!sopFormula) return "";
    const container = document.getElementById('circuit-svg-container');
    
    let subProducts = sopFormula.split(' + ');
    let svgWidth = 600;
    let svgHeight = varLabels.length * 50 + subProducts.length * 65 + 100;
    
    let svg = `<svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;
    
    let inputX = 50;
    let labelYPositions = {};
    varLabels.forEach((label, idx) => {
        let y = 40 + idx * 40;
        labelYPositions[label] = y;
        svg += `<text x="${inputX - 20}" y="${y + 5}" font-family="sans-serif" font-weight="bold" fill="black">${label}</text>`;
        svg += `<line x1="${inputX}" y1="${y}" x2="${svgWidth - 150}" y2="${y}" stroke="#334155" stroke-width="2"/>`;
    });

    let gateX = 280;
    let andGateYPositions = [];
    subProducts.forEach((prod, pIdx) => {
        let gateY = 220 + pIdx * 65;
        andGateYPositions.push(gateY);

        svg += `<path d="M ${gateX} ${gateY-20} L ${gateX+25} ${gateY-20} A 20 20 0 0 1 ${gateX+25} ${gateY+20} L ${gateX} ${gateY+20} Z" fill="#93c5fd" stroke="#1e3a8a" stroke-width="2"/>`;
        svg += `<text x="${gateX+5}" y="${gateY+5}" font-family="sans-serif" font-size="10" fill="#1e3a8a" font-weight="bold">AND</text>`;
        
        let literals = prod.match(/~?[a-zA-Z]/g) || [];
        literals.forEach((lit, lIdx) => {
            let isNegated = lit.startsWith('~');
            let variable = isNegated ? lit.substring(1) : lit;
            let srcY = labelYPositions[variable];
            
            let inputY = gateY;
            if (literals.length > 1) {
                inputY = gateY - 12 + (lIdx * (24 / (literals.length - 1)));
            }
            
            if(srcY) {
                let connX = inputX + 30 + (pIdx * 35) + (lIdx * 8);
                svg += `<circle cx="${connX}" cy="${srcY}" r="3.5" fill="#0284c7"/>`;
                svg += `<line x1="${connX}" y1="${srcY}" x2="${connX}" y2="${inputY}" stroke="#0284c7" stroke-width="1.5"/>`;
                
                if (isNegated) {
                    svg += `<line x1="${connX}" y1="${inputY}" x2="${gateX - 32}" y2="${inputY}" stroke="#0284c7" stroke-width="1.5"/>`;
                    let notX = gateX - 20;
                    svg += `<polygon points="${notX-12},${inputY-6} ${notX-12},${inputY+6} ${notX-4},${inputY}" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.5"/>`;
                    svg += `<circle cx="${notX-2}" cy="${inputY}" r="2.5" fill="#ffffff" stroke="#0369a1" stroke-width="1.5"/>`;
                    svg += `<line x1="${notX}" y1="${inputY}" x2="${gateX}" y2="${inputY}" stroke="#0284c7" stroke-width="1.5"/>`;
                } else {
                    svg += `<line x1="${connX}" y1="${inputY}" x2="${gateX}" y2="${inputY}" stroke="#0284c7" stroke-width="1.5"/>`;
                }
            }
        });

        svg += `<line x1="${gateX+45}" y1="${gateY}" x2="${svgWidth-120}" y2="${gateY}" stroke="#1e3a8a" stroke-width="2"/>`;
    });

    if(subProducts.length > 1) {
        let orX = svgWidth - 95;
        let orY = 220 + (subProducts.length * 32.5) - 32.5;
        
        andGateYPositions.forEach(gY => {
            svg += `<line x1="${svgWidth-120}" y1="${gY}" x2="${orX}" y2="${orY}" stroke="#b91c1c" stroke-width="2"/>`;
        });

        svg += `<path d="M ${orX} ${orY-25} Q ${orX+15} ${orY-25} ${orX+35} ${orY} Q ${orX+15} ${orY+25} ${orX} ${orY+25} Q ${orX+10} ${orY} ${orX} ${orY-25} Z" fill="#fca5a5" stroke="#b91c1c" stroke-width="2"/>`;
        svg += `<text x="${orX+8}" y="${orY+4}" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="bold">OR</text>`;
        svg += `<line x1="${orX+35}" y1="${orY}" x2="${orX+70}" y2="${orY}" stroke="#b91c1c" stroke-width="2"/>`;
        svg += `<text x="${orX+75}" y="${orY+5}" font-family="sans-serif" font-weight="bold" fill="black">F</text>`;
    } else {
        svg += `<text x="${svgWidth-110}" y="${andGateYPositions[0]+5}" font-family="sans-serif" font-weight="bold" fill="black">F</text>`;
    }

    svg += `</svg>`;
    if (container) {
        container.innerHTML = svg;
    }
    return svg;
}

// Khởi tạo các minterm ngay khi nạp file JS
initMintermSelectors();
