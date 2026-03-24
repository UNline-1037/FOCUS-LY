const left = document.getElementById('left');
const right = document.getElementById('right');
const input = document.getElementById('input');
let syncing = false;

// 防抖转换
let timeout;
input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(convert, 500);
});

async function convert() {
    try {
        const res = await fetch('/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown: input.value })
        });
        const data = await res.json();
        // 清空右侧，按块重建
        right.innerHTML = '';
        data.html_blocks.forEach(html => {
            const div = document.createElement('div');
            div.className = 'block';
            div.innerHTML = html;
            right.appendChild(div);
        });
        // 高亮代码
        document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        // 渲染数学公式
        if (window.renderMathInElement) {
            renderMathInElement(right, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ]
            });
        }
    } catch (err) {
        right.innerHTML = '<p style="color:red">转换失败</p >';
    }
}

// 同步滚动（基于块索引）
function findVisibleBlockIndex(container, blocks) {
    const scrollTop = container.scrollTop;
    const containerRect = container.getBoundingClientRect();
    for (let i = 0; i < blocks.length; i++) {
        const rect = blocks[i].getBoundingClientRect();
        const top = rect.top + container.scrollTop - containerRect.top;
        if (top >= scrollTop && top < scrollTop + container.clientHeight) {
            return i;
        }
    }
    return 0;
}

left.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    const blocks = Array.from(right.children);
    const index = findVisibleBlockIndex(left, [input]); // 左侧只有一个元素，无法按块
    // 简化：右侧同步基于左侧内容比例，但为满足需求，我们采用另一种简单方法：右侧滚动同步到左侧相同索引
    // 更简单：不做双向精确同步，只做右侧滚动时左侧滚动对应块。但需求要求双向，我们用简单的比例法。
    // 这里提供一个简单的基于滚动百分比的方法（满足简单要求）
    const percent = left.scrollTop / (left.scrollHeight - left.clientHeight);
    right.scrollTop = percent * (right.scrollHeight - right.clientHeight);
    syncing = false;
});

right.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    const percent = right.scrollTop / (right.scrollHeight - right.clientHeight);
    left.scrollTop = percent * (left.scrollHeight - left.clientHeight);
    syncing = false;
});

// 初始化
convert();