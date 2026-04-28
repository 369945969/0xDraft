/**
 * Markdown处理模块
 * 负责Markdown解析和大纲生成
 */

const Markdown = {
    // 初始化marked配置
    init() {
        if (typeof marked === 'undefined') {
            console.warn('Marked.js not loaded');
            return;
        }

        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            highlight: function(code, lang) {
                // 简单的语法高亮
                if (lang === 'javascript' || lang === 'js') {
                    return this.highlightJS(code, 'javascript');
                }
                return code;
            }
        });

        // 自定义渲染器
        const renderer = new marked.Renderer();

        // 自定义代码块渲染
        renderer.code = (code, language) => {
            const lang = language || 'plaintext';
            const highlighted = this.highlightCode(code, lang);
            return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
        };

        // 自定义标题渲染
        renderer.heading = (text, level) => {
            const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
            return `<h${level} id="${slug}">${text}</h${level}>`;
        };

        marked.use({ renderer });
    },

    // 简单的代码高亮
    highlightCode(code, lang) {
        // 基础语法高亮
        let result = this.escapeHtml(code);

        // 注释
        result = result.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
        result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

        // 字符串
        result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="string">$1</span>');

        // 关键字
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined'];
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'g');
            result = result.replace(regex, '<span class="keyword">$1</span>');
        });

        // 数字
        result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

        // 装饰样式
        result = `<span class="code-line">${result.replace(/\n/g, '</span>\n<span class="code-line">')}</span>`;

        return result;
    },

    // HTML转义
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    // 解析Markdown
    parse(markdown) {
        if (typeof marked === 'undefined') {
            return '<p>Marked.js not loaded</p>';
        }
        try {
            return marked.parse(markdown);
        } catch (e) {
            console.error('Markdown parse error:', e);
            return '<p>解析错误</p>';
        }
    },

    // 提取大纲
    extractOutline(markdown) {
        const outline = [];
        const lines = markdown.split('\n');
        const headingRegex = /^(#{1,6})\s+(.+)$/;

        lines.forEach(line => {
            const match = line.match(headingRegex);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                outline.push({
                    level,
                    text,
                    id: text.toLowerCase().replace(/[^\w]+/g, '-')
                });
            }
        });

        return outline;
    },

    // 渲染Markdown到DOM
    render(markdown, container) {
        const html = this.parse(markdown);
        container.innerHTML = html;
    },

    // 渲染大纲
    renderOutline(outline, container, onItemClick) {
        container.innerHTML = '';

        outline.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'outline-item';
            div.style.paddingLeft = `${12 + (item.level - 1) * 12}px`;
            div.dataset.id = item.id;

            div.innerHTML = `
                <span class="outline-check">
                    <i data-lucide="circle"></i>
                </span>
                <span class="outline-number">${index + 1}</span>
                <span>${item.text}</span>
            `;

            div.addEventListener('click', () => {
                // 高亮当前项
                container.querySelectorAll('.outline-item').forEach(el => {
                    el.classList.remove('active');
                });
                div.classList.add('active');

                // 滚动到对应位置
                const target = document.getElementById(item.id);
                if (target) {
                    const body = document.getElementById('markdownBody');
                    body.scrollTo({
                        top: target.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }

                if (onItemClick) onItemClick(item);
            });

            container.appendChild(div);
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    // 更新文档预览
    updatePreview() {
        const tasks = Store.getTasks()
            .filter(task => task.status === 'done' || task.status === 'published' || task.content)
            .sort((a, b) => a.chapterNumber - b.chapterNumber);

        const markdownBody = document.getElementById('markdownBody');
        const outlineList = document.getElementById('outlineList');

        if (tasks.length === 0) {
            markdownBody.innerHTML = `
                <div class="empty-preview">
                    <i data-lucide="file-text"></i>
                    <p>暂无文档内容</p>
                    <p class="hint">在看板中完成任务后，文档内容将自动生成</p>
                </div>
            `;
            outlineList.innerHTML = '';
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
            return;
        }

        // 生成完整文档
        let fullDocument = `# ${Store.get('project.name')}\n\n`;
        fullDocument += `> 文档版本: 1.0  \n`;
        fullDocument += `> 生成时间: ${Utils.formatDateTime(Date.now())}  \n`;
        fullDocument += `> 项目描述: ${Store.get('project.description')}\n\n`;
        fullDocument += `---\n\n`;

        tasks.forEach(task => {
            if (task.content) {
                fullDocument += task.content + '\n\n';
                fullDocument += `<div style="text-align:right;margin-top:-12px;margin-bottom:8px;"><a href="task-detail.html?id=${task.id}" style="font-size:12px;color:var(--accent-blue);text-decoration:none;">查看任务详情 →</a></div>\n\n`;
                fullDocument += '---\n\n';
            }
        });

        // 渲染Markdown
        this.render(fullDocument, markdownBody);

        // 提取并渲染大纲
        const outline = this.extractOutline(fullDocument);
        this.renderOutline(outline, outlineList);

        // 更新状态
        const previewStatus = document.getElementById('previewStatus');
        const publishedCount = tasks.filter(t => t.status === 'published').length;
        if (publishedCount === tasks.length && tasks.length > 0) {
            previewStatus.textContent = '已完成';
            previewStatus.classList.add('published');
        } else {
            previewStatus.textContent = `进行中 (${tasks.length}章节)`;
            previewStatus.classList.remove('published');
        }
    },

    // 导出为Markdown文本
    exportMarkdown() {
        return Store.generateFullDocument();
    },

    // 导出为HTML
    exportHTML() {
        const markdown = Store.generateFullDocument();
        const html = this.parse(markdown);

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Store.get('project.name')}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 16px; }
        h2 { color: #6366f1; margin-top: 32px; }
        h3 { color: #8b5cf6; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #6366f1; margin: 16px 0; padding-left: 16px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f9f9f9; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    },

    // 复制到剪贴板
    async copyToClipboard() {
        const markdown = this.exportMarkdown();
        const success = await Utils.copyToClipboard(markdown);
        if (success) {
            Components.showToast('已复制到剪贴板', 'success');
        } else {
            Components.showToast('复制失败', 'error');
        }
    }
};

// 导出到全局
window.Markdown = Markdown;
