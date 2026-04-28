/**
 * 主应用模块
 * 应用程序的主要逻辑和初始化
 */

class App {
    constructor() {
        this.currentTab = 'analysis';
        this.isExecuting = false;
    }

    // 初始化应用
    init() {
        // 初始化Markdown
        Markdown.init();

        // 初始化看板
        Kanban.init();

        // 绑定事件
        this.bindEvents();

        // 渲染初始状态
        this.renderAgents();

        // 更新最后更新时间
        this.updateLastUpdate();

        // 初始化Lucide图标
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        console.log('Multi-Agent Team 看板系统已初始化');
    }

    // 绑定事件
    bindEvents() {
        // Tab切换
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // 需求分析按钮
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeRequirement();
        });

        document.getElementById('loadSampleBtn').addEventListener('click', () => {
            this.loadSampleRequirement();
        });

        document.getElementById('clearInputBtn').addEventListener('click', () => {
            this.clearRequirementInput();
        });

        document.getElementById('requirementInput').addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = e.target.value.length;
        });

        document.getElementById('createTasksBtn').addEventListener('click', () => {
            this.createTasksFromAnalysis();
        });

        // 看板按钮
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskModal();
        });

        document.getElementById('filterBtn').addEventListener('click', () => {
            this.showFilterModal();
        });

        // Agent管理按钮
        document.getElementById('addAgentBtn').addEventListener('click', () => {
            this.showAddAgentModal();
        });

        // 预览按钮
        document.getElementById('copyMarkdownBtn').addEventListener('click', () => {
            Markdown.copyToClipboard();
        });

        document.getElementById('exportMdBtn').addEventListener('click', () => {
            this.exportMarkdown();
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // 执行日志面板
        document.getElementById('executionClose').addEventListener('click', () => {
            Components.hideExecutionPanel();
        });

        // Footer按钮
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.confirmClearData();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            this.importData();
        });

        // 监听状态变化
        Store.subscribe('agents', () => {
            this.renderAgents();
        });

        Store.subscribe('tasks', () => {
            Markdown.updatePreview();
        });
    }

    // Tab切换
    switchTab(tabName) {
        // 更新Tab指示器
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 移动指示器
        const activeTab = document.querySelector(`.tab-item[data-tab="${tabName}"]`);
        if (activeTab) {
            const indicator = document.querySelector('.tab-indicator');
            indicator.style.left = activeTab.offsetLeft + 'px';
            indicator.style.width = activeTab.offsetWidth + 'px';
        }

        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });

        this.currentTab = tabName;

        // Tab特定操作
        if (tabName === 'preview') {
            Markdown.updatePreview();
        }
    }

    // ==================== 需求分析 ====================

    loadSampleRequirement() {
        const sample = `我们需要开发一个企业内部知识管理系统，主要功能包括：

文档管理：
1. 文档的上传、下载、版本管理
2. 支持多种文件格式（Word、PDF、PPT、Markdown）
3. 文档分类和标签系统

搜索功能：
1. 全文搜索引擎
2. 智能推荐功能
3. 搜索结果高亮显示

协作功能：
1. 团队协作编辑
2. 评论和批注功能
3. 版本对比

权限管理：
1. 基于角色的访问控制
2. 组织架构集成
3. 操作日志审计

系统要求：
- 支持移动端访问
- 数据安全加密存储
- 高可用部署架构`;

        document.getElementById('requirementInput').value = sample;
        document.getElementById('charCount').textContent = sample.length;
    }

    clearRequirementInput() {
        document.getElementById('requirementInput').value = '';
        document.getElementById('charCount').textContent = '0';
        Store.setAnalysisResult(null);
        Components.renderAnalysisResult(null);
        document.getElementById('resultActions').style.display = 'none';
    }

    async analyzeRequirement() {
        const input = document.getElementById('requirementInput').value.trim();

        if (!input) {
            Components.showToast('请输入需求描述', 'warning');
            return;
        }

        const statusEl = document.getElementById('analysisStatus');
        const statusDot = statusEl.querySelector('.status-dot');
        const statusText = statusEl.querySelector('.status-text');

        // 显示加载状态
        statusDot.className = 'status-dot loading';
        statusText.textContent = '正在分析...';

        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('analyzeBtn').innerHTML = '<span class="spinner"></span> 分析中';

        try {
            // 模拟AI分析延迟
            await Utils.randomDelay(1500, 3000);

            // 执行分析
            const result = Utils.analyzeRequirement(input);

            // 保存结果
            Store.setAnalysisResult(result);

            // 渲染结果
            Components.renderAnalysisResult(result);

            // 更新状态
            statusDot.className = 'status-dot success';
            statusText.textContent = '分析完成';
            document.getElementById('resultActions').style.display = 'flex';

            Components.showToast('需求分析完成', 'success');

        } catch (error) {
            console.error('分析失败:', error);
            statusDot.className = 'status-dot error';
            statusText.textContent = '分析失败';
            Components.showToast('分析过程出现错误', 'error');
        } finally {
            document.getElementById('analyzeBtn').disabled = false;
            document.getElementById('analyzeBtn').innerHTML = `
                <i data-lucide="cpu"></i>
                <span>分析需求</span>
            `;
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
    }

    createTasksFromAnalysis() {
        const result = Store.getAnalysisResult();
        if (!result) {
            Components.showToast('请先执行需求分析', 'warning');
            return;
        }

        // 确认对话框
        Components.showModal({
            title: '确认创建任务',
            body: `<p style="text-align: center;">将为您创建 ${result.chapters.length} 个章节任务</p>`,
            footer: `
                <button class="btn btn-secondary" id="cancelCreate">取消</button>
                <button class="btn btn-primary" id="confirmCreate">确认创建</button>
            `
        });

        document.getElementById('cancelCreate').onclick = () => Components.hideModal();
        document.getElementById('confirmCreate').onclick = () => {
            Components.hideModal();

            // 创建任务
            const tasks = result.chapters.map(chapter => {
                // 找到对应的Agent
                const agent = Store.getAgents().find(a => a.type === chapter.agent);

                return {
                    chapterNumber: chapter.number,
                    title: chapter.title,
                    description: `${chapter.title}章节内容`,
                    status: 'backlog',
                    priority: chapter.number <= 3 ? 'P0' : chapter.number <= 6 ? 'P1' : 'P2',
                    assignedAgentId: agent?.id || null,
                    estimatedHours: 2,
                    progress: 0
                };
            });

            Store.addTasks(tasks);

            // 切换到看板视图
            this.switchTab('kanban');

            Components.showToast(`已创建 ${tasks.length} 个任务`, 'success');
            this.updateLastUpdate();
        };
    }

    // ==================== 看板操作 ====================

    showAddTaskModal(status = 'backlog') {
        Components.showModal({
            title: '添加任务',
            body: Components.getTaskFormHTML(),
            footer: `
                <button class="btn btn-secondary" id="cancelTask">取消</button>
                <button class="btn btn-primary" id="saveTask">添加</button>
            `
        });

        document.getElementById('cancelTask').onclick = () => Components.hideModal();
        document.getElementById('saveTask').onclick = () => {
            this.saveTaskFromForm(status);
        };
    }

    saveTaskFromForm(status = 'backlog') {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);

        const taskData = {
            chapterNumber: parseInt(formData.get('chapterNumber')),
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            assignedAgentId: formData.get('assignedAgentId') || null,
            priority: formData.get('priority'),
            estimatedHours: parseFloat(formData.get('estimatedHours')) || 2,
            status: status
        };

        if (!taskData.title) {
            Components.showToast('请输入章节标题', 'warning');
            return;
        }

        Store.addTask(taskData);
        Components.hideModal();
        Components.showToast('任务添加成功', 'success');
        this.updateLastUpdate();
    }

    editTask(taskId) {
        const task = Store.getTask(taskId);
        if (!task) return;

        Components.showModal({
            title: '编辑任务',
            body: Components.getTaskFormHTML(task),
            footer: `
                <button class="btn btn-secondary" id="cancelEdit">取消</button>
                <button class="btn btn-primary" id="updateTask">保存</button>
            `
        });

        document.getElementById('cancelEdit').onclick = () => Components.hideModal();
        document.getElementById('updateTask').onclick = () => {
            const form = document.getElementById('taskForm');
            const formData = new FormData(form);

            const updateData = {
                chapterNumber: parseInt(formData.get('chapterNumber')),
                title: formData.get('title').trim(),
                description: formData.get('description').trim(),
                assignedAgentId: formData.get('assignedAgentId') || null,
                priority: formData.get('priority'),
                estimatedHours: parseFloat(formData.get('estimatedHours')) || 2
            };

            Store.updateTask(taskId, updateData);
            Components.hideModal();
            Components.showToast('任务已更新', 'success');
            this.updateLastUpdate();
        };
    }

    deleteTask(taskId) {
        Components.showModal({
            title: '删除任务',
            body: '<p style="text-align: center;">确定要删除这个任务吗？此操作不可撤销。</p>',
            footer: `
                <button class="btn btn-secondary" id="cancelDelete">取消</button>
                <button class="btn btn-danger" id="confirmDelete">删除</button>
            `
        });

        document.getElementById('cancelDelete').onclick = () => Components.hideModal();
        document.getElementById('confirmDelete').onclick = () => {
            Store.deleteTask(taskId);
            Components.hideModal();
            Components.showToast('任务已删除', 'success');
            this.updateLastUpdate();
        };
    }

    async executeTask(taskId) {
        if (this.isExecuting) {
            Components.showToast('有任务正在执行中', 'warning');
            return;
        }

        const task = Store.getTask(taskId);
        if (!task) return;

        // 确认执行
        Components.showModal({
            title: '执行任务',
            body: `<p style="text-align: center;">开始执行「${task.title}」</p>`,
            footer: `
                <button class="btn btn-secondary" id="cancelExecute">取消</button>
                <button class="btn btn-primary" id="startExecute">开始</button>
            `
        });

        document.getElementById('cancelExecute').onclick = () => Components.hideModal();
        document.getElementById('startExecute').onclick = () => {
            Components.hideModal();
            this.runTaskExecution(task);
        };
    }

    async runTaskExecution(task) {
        this.isExecuting = true;
        const agent = Store.getAgent(task.assignedAgentId);

        // 移动到进行中
        Store.moveTask(task.id, 'in_progress');

        // 显示执行面板
        Components.showExecutionPanel();
        Components.clearExecutionLogs();

        // 添加日志：开始
        Components.addExecutionLog({
            agentId: task.assignedAgentId,
            action: 'thinking',
            message: `${agent?.name || '系统'} 开始分析「${task.title}」...`
        });

        try {
            // 思考阶段
            await Utils.randomDelay(1000, 2000);
            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'thinking',
                message: '正在分析需求和设计方向...'
            });

            // 生成阶段
            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'generating',
                message: '开始生成文档内容...'
            });

            // 更新进度
            Store.updateTaskProgress(task.id, 30);

            await Utils.randomDelay(1500, 2500);
            Store.updateTaskProgress(task.id, 60);

            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'generating',
                message: '内容生成中...'
            });

            await Utils.randomDelay(1500, 2500);
            Store.updateTaskProgress(task.id, 90);

            // 生成内容
            const content = await Utils.generateContent(task, agent);
            Store.updateTaskContent(task.id, content);

            // 审视阶段
            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'reviewing',
                message: '内容自审中...'
            });

            await Utils.randomDelay(800, 1500);

            // 完成
            Store.updateTaskProgress(task.id, 100);
            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'complete',
                message: '任务完成！内容已生成。'
            });

            // 移动到待审视
            Store.moveTask(task.id, 'review');

            Components.showToast('任务执行完成，已提交审核', 'success');

        } catch (error) {
            console.error('执行失败:', error);
            Components.addExecutionLog({
                agentId: task.assignedAgentId,
                action: 'error',
                message: '执行过程出现错误: ' + error.message
            });
            Components.showToast('任务执行失败', 'error');
        } finally {
            this.isExecuting = false;
            this.updateLastUpdate();

            // 3秒后自动关闭日志面板
            setTimeout(() => {
                Components.hideExecutionPanel();
            }, 3000);
        }
    }

    showFilterModal() {
        Components.showModal({
            title: '筛选任务',
            body: `
                <div class="form-group">
                    <label class="form-label">按Agent筛选</label>
                    <select class="form-select" id="filterAgent">
                        <option value="">全部Agent</option>
                        ${Store.getAgents().map(a => `
                            <option value="${a.id}">${a.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">按优先级筛选</label>
                    <select class="form-select" id="filterPriority">
                        <option value="">全部优先级</option>
                        <option value="P0">P0 - 紧急重要</option>
                        <option value="P1">P1 - 重要</option>
                        <option value="P2">P2 - 一般</option>
                    </select>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" id="resetFilter">重置</button>
                <button class="btn btn-primary" id="applyFilter">应用</button>
            `
        });

        document.getElementById('resetFilter').onclick = () => Components.hideModal();
        document.getElementById('applyFilter').onclick = () => {
            Components.hideModal();
            Components.showToast('筛选功能开发中', 'info');
        };
    }

    // ==================== Agent管理 ====================

    renderAgents() {
        const grid = document.getElementById('agentsGrid');
        if (!grid) return;
        const agents = Store.getAgents();

        grid.innerHTML = '';
        agents.forEach(agent => {
            const card = Components.createAgentCard(agent);
            grid.appendChild(card);
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    }

    showAddAgentModal() {
        Components.showModal({
            title: '添加Agent',
            body: Components.getAgentFormHTML(),
            footer: `
                <button class="btn btn-secondary" id="cancelAddAgent">取消</button>
                <button class="btn btn-primary" id="saveAgent">添加</button>
            `
        });

        document.getElementById('cancelAddAgent').onclick = () => Components.hideModal();
        document.getElementById('saveAgent').onclick = () => {
            this.saveAgentFromForm();
        };
    }

    saveAgentFromForm() {
        const form = document.getElementById('agentForm');
        const formData = new FormData(form);

        const agentData = {
            name: formData.get('name').trim(),
            type: formData.get('type'),
            specialty: formData.get('specialty').trim(),
            avatarColor: formData.get('avatarColor') || Utils.randomColor()
        };

        if (!agentData.name || !agentData.specialty) {
            Components.showToast('请填写完整信息', 'warning');
            return;
        }

        Store.addAgent(agentData);
        Components.hideModal();
        Components.showToast('Agent添加成功', 'success');
    }

    editAgent(agentId) {
        const agent = Store.getAgent(agentId);
        if (!agent) return;

        Components.showModal({
            title: '编辑Agent',
            body: Components.getAgentFormHTML(agent),
            footer: `
                <button class="btn btn-secondary" id="cancelEditAgent">取消</button>
                <button class="btn btn-primary" id="updateAgent">保存</button>
            `
        });

        document.getElementById('cancelEditAgent').onclick = () => Components.hideModal();
        document.getElementById('updateAgent').onclick = () => {
            const form = document.getElementById('agentForm');
            const formData = new FormData(form);

            const updateData = {
                name: formData.get('name').trim(),
                specialty: formData.get('specialty').trim(),
                avatarColor: formData.get('avatarColor')
            };

            Store.updateAgent(agentId, updateData);
            Components.hideModal();
            Components.showToast('Agent已更新', 'success');
        };
    }

    deleteAgent(agentId) {
        const agent = Store.getAgent(agentId);
        if (!agent) return;

        Components.showModal({
            title: '删除Agent',
            body: `<p style="text-align: center;">确定要删除「${agent.name}」吗？<br>该Agent的任务将被取消分配。</p>`,
            footer: `
                <button class="btn btn-secondary" id="cancelDeleteAgent">取消</button>
                <button class="btn btn-danger" id="confirmDeleteAgent">删除</button>
            `
        });

        document.getElementById('cancelDeleteAgent').onclick = () => Components.hideModal();
        document.getElementById('confirmDeleteAgent').onclick = () => {
            Store.deleteAgent(agentId);
            Components.hideModal();
            Components.showToast('Agent已删除', 'success');
        };
    }

    // ==================== 导出功能 ====================

    exportMarkdown() {
        const content = Markdown.exportMarkdown();
        const filename = `${Store.get('project.name')}_${Utils.formatDateTime(Date.now()).replace(/[:\s]/g, '-')}.md`;
        Utils.downloadFile(content, filename, 'text/markdown');
        Components.showToast('Markdown文件已导出', 'success');
    }

    exportPDF() {
        Components.showToast('PDF导出功能开发中', 'info');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // ==================== 数据管理 ====================

    confirmClearData() {
        Components.showModal({
            title: '清除所有数据',
            body: '<p style="text-align: center; color: var(--accent-red);">警告：此操作将删除所有任务和Agent数据！<br>此操作不可撤销。</p>',
            footer: `
                <button class="btn btn-secondary" id="cancelClear">取消</button>
                <button class="btn btn-danger" id="confirmClear">确认清除</button>
            `
        });

        document.getElementById('cancelClear').onclick = () => Components.hideModal();
        document.getElementById('confirmClear').onclick = () => {
            Store.clearAll();
            Components.hideModal();
            Components.showToast('所有数据已清除', 'success');
            Kanban.render();
            this.renderAgents();
        };
    }

    exportData() {
        const data = Store.exportData();
        const content = JSON.stringify(data, null, 2);
        const filename = `agent_board_backup_${Utils.formatDateTime(Date.now()).replace(/[:\s]/g, '-')}.json`;
        Utils.downloadFile(content, filename, 'application/json');
        Components.showToast('数据已导出', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (data.project && data.tasks) {
                    Store.importData(data);
                    Components.showToast('数据导入成功', 'success');
                    Kanban.render();
                    this.renderAgents();
                } else {
                    Components.showToast('数据格式无效', 'error');
                }
            } catch (error) {
                console.error('导入失败:', error);
                Components.showToast('导入失败：' + error.message, 'error');
            }
        };

        input.click();
    }

    // ==================== 工具方法 ====================

    updateLastUpdate() {
        const el = document.getElementById('lastUpdate');
        if (el) {
            el.textContent = `最后更新: ${Utils.relativeTime(Date.now())}`;
        }
    }
}

// 创建全局App实例
window.App = new App();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();

    // 初始化Tab指示器位置
    const activeTab = document.querySelector('.tab-item.active');
    const indicator = document.querySelector('.tab-indicator');
    if (activeTab && indicator) {
        indicator.style.left = activeTab.offsetLeft + 'px';
        indicator.style.width = activeTab.offsetWidth + 'px';
    }
});
