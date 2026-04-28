/**
 * 组件模块
 * 定义UI组件的创建和渲染方法
 */

const Components = {
    // ==================== 项目管理组件 ====================

    renderProjectSelector() {
        const project = Store.getCurrentProject();
        const selector = document.getElementById('projectSelectorBtn');
        if (!selector) return;

        selector.innerHTML = `
            <div class="project-selector-info">
                <span class="project-selector-label">当前项目</span>
                <span class="project-selector-name">${project ? project.name : '未选择项目'}</span>
            </div>
            <i data-lucide="chevron-down"></i>
        `;
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        selector.onclick = () => this.showProjectSwitchModal();
    },

    showProjectSwitchModal() {
        const projects = Store.get('projects') || [];
        const currentProject = Store.getCurrentProject();

        const bodyHtml = `
            <div class="project-switch-list">
                ${projects.map(p => `
                    <div class="project-switch-item ${currentProject && p.id === currentProject.id ? 'active' : ''}" data-project-id="${p.id}">
                        <div class="project-switch-info">
                            <div class="project-switch-name">${p.name}</div>
                            <div class="project-switch-desc">${p.description || '无描述'}</div>
                            <div class="project-switch-meta">
                                <span>创建于: ${new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        ${currentProject && p.id === currentProject.id ? '<i data-lucide="check" style="color:var(--accent-green); width:18px; height:18px;"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" id="closeSwitchModal">取消</button>
            <button class="btn btn-primary" id="openNewProjectModal">
                <i data-lucide="plus"></i> 新建项目
            </button>
        `;

        const modal = this.showModal({
            title: '切换项目',
            body: bodyHtml,
            footer: footerHtml
        });

        // 绑定点击事件
        document.querySelectorAll('.project-switch-item').forEach(item => {
            item.onclick = () => {
                const pid = item.dataset.projectId;
                Store.switchProject(pid);
                modal.close();
                this.showToast(`已切换到项目: ${Store.getCurrentProject().name}`, 'success');
                // 页面可能需要刷新或重新渲染，由各页面监听Store变化处理
            };
        });

        document.getElementById('closeSwitchModal').onclick = () => modal.close();
        document.getElementById('openNewProjectModal').onclick = () => {
            modal.close();
            this.showNewProjectModal();
        };
    },

    showNewProjectModal() {
        const groups = Store.get('agentGroups') || [];
        
        const bodyHtml = `
            <div class="form-group">
                <label class="form-label">项目名称</label>
                <input type="text" class="form-input" id="newProjName" placeholder="例如：智能物流管理系统">
            </div>
            <div class="form-group">
                <label class="form-label">项目描述</label>
                <textarea class="form-textarea" id="newProjDesc" rows="3" placeholder="简述项目的核心目标和范围..."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">绑定 Agent 组</label>
                <select class="form-select" id="newProjGroup">
                    ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
                </select>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" id="cancelNewProj">取消</button>
            <button class="btn btn-primary" id="saveNewProj">创建项目</button>
        `;

        const modal = this.showModal({
            title: '创建新项目',
            body: bodyHtml,
            footer: footerHtml
        });

        document.getElementById('cancelNewProj').onclick = () => modal.close();
        document.getElementById('saveNewProj').onclick = () => {
            const name = document.getElementById('newProjName').value.trim();
            const desc = document.getElementById('newProjDesc').value.trim();
            const gid = document.getElementById('newProjGroup').value;
            
            if (!name) return this.showToast('请输入项目名称', 'warning');
            
            const newProj = Store.createProject(name, desc, gid);
            modal.close();
            this.showToast(`项目「${newProj.name}」已创建`, 'success');
        };
    },

    // ==================== Toast 通知 ====================

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconMap[type] || 'info'}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">
                <i data-lucide="x"></i>
            </button>
        `;

        container.appendChild(toast);
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // 关闭按钮
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        // 自动消失
        if (duration > 0) {
            setTimeout(() => {
                this.hideToast(toast);
            }, duration);
        }

        return toast;
    },

    hideToast(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 250);
    },

    // ==================== Modal 模态框 ====================

    showModal(options) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const footer = document.getElementById('modalFooter');

        // 设置内容
        title.textContent = options.title || '提示';
        body.innerHTML = options.body || '';
        footer.innerHTML = options.footer || '';

        // 渲染图标
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // 显示模态框
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 关闭处理
        const closeModal = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (options.onClose) options.onClose();
        };

        // 绑定关闭事件
        document.getElementById('modalClose').onclick = closeModal;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return { close: closeModal };
    },

    hideModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    // ==================== 确认对话框 ====================

    showConfirm(message, onConfirm, onCancel) {
        return this.showModal({
            title: '确认操作',
            body: `<div class="confirm-message">${message}</div>`,
            footer: `
                <button class="btn btn-secondary" id="confirmCancel">取消</button>
                <button class="btn btn-primary" id="confirmOk">确定</button>
            `,
            onClose: onCancel
        });
    },

    // ==================== 任务卡片 ====================

    createTaskCard(task) {
        const agent = Store.getAgent(task.assignedAgentId);
        const agentConfig = agent ? Utils.getAgentTypeConfig(agent.type) : null;

        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.taskId = task.id;
        card.draggable = true;

        card.innerHTML = `
            <div class="task-card-header">
                <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                <div style="display:flex;gap:6px;align-items:center;">
                    ${task.status === 'in_progress' ? '<span class="task-status-badge in_progress">执行中</span>' : ''}
                    ${task.status === 'review' ? '<span class="task-status-badge review">待审</span>' : ''}
                    <a href="task-detail.html?id=${task.id}" class="task-action-btn" title="查看详情" style="opacity:0.6;width:22px;height:22px;" onclick="event.stopPropagation();">
                        <i data-lucide="external-link" style="width:12px;height:12px;"></i>
                    </a>
                </div>
            </div>
            <a href="task-detail.html?id=${task.id}" class="task-title" style="text-decoration:none;color:inherit;display:block;" onclick="event.stopPropagation();">
                ${task.chapterNumber}. ${task.title}
            </a>
            <div class="task-meta">
                <span class="task-meta-item">
                    <i data-lucide="clock"></i>
                    ${task.estimatedHours}h
                </span>
                ${agent ? `
                    <span class="task-meta-item">
                        <i data-lucide="user"></i>
                        ${agent.name}
                    </span>
                ` : ''}
            </div>
            ${agent ? `
                <div class="task-agent">
                    <div class="agent-avatar-sm" style="background: ${agent.avatarColor}">
                        ${agent.name.charAt(0)}
                    </div>
                    <span class="agent-name">${agent.name}</span>
                </div>
            ` : `
                <div class="task-agent">
                    <div class="agent-avatar-sm" style="background: var(--text-muted)">
                        <i data-lucide="user-x" style="width: 12px; height: 12px;"></i>
                    </div>
                    <span class="agent-name">未分配</span>
                </div>
            `}
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
                <span class="progress-text">${task.progress}%</span>
            </div>
            <div class="task-card-actions">
                <button class="task-action-btn execute" title="执行任务" ${task.status === 'in_progress' ? 'disabled' : ''}>
                    <i data-lucide="play"></i>
                </button>
                <button class="task-action-btn edit" title="编辑">
                    <i data-lucide="edit-2"></i>
                </button>
                <button class="task-action-btn delete" title="删除">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // 绑定事件
        card.querySelector('.execute').onclick = (e) => {
            e.stopPropagation();
            if (!window.App) return;
            window.App.executeTask(task.id);
        };

        card.querySelector('.edit').onclick = (e) => {
            e.stopPropagation();
            if (!window.App) return;
            window.App.editTask(task.id);
        };

        card.querySelector('.delete').onclick = (e) => {
            e.stopPropagation();
            if (!window.App) return;
            window.App.deleteTask(task.id);
        };

        return card;
    },

    // ==================== Agent卡片 ====================

    createAgentCard(agent) {
        const config = Utils.getAgentTypeConfig(agent.type);

        const card = document.createElement('div');
        card.className = 'agent-card';
        card.dataset.agentId = agent.id;

        card.innerHTML = `
            <div class="agent-card-header">
                <a href="agent-detail.html?id=${agent.id}" style="text-decoration:none;color:inherit;">
                    <div class="agent-avatar" style="background: ${agent.avatarColor}">
                        <i data-lucide="${config.icon}"></i>
                    </div>
                </a>
                <div class="agent-info">
                    <a href="agent-detail.html?id=${agent.id}" style="text-decoration:none;color:inherit;">
                        <div class="agent-name">${agent.name}</div>
                    </a>
                    <div class="agent-type">${config.name}</div>
                </div>
                <div class="agent-status ${agent.status}">
                    <span class="status-dot"></span>
                    ${agent.status === 'online' ? '在线' : agent.status === 'busy' ? '忙碌' : '离线'}
                </div>
            </div>
            <div class="agent-specialty">
                <div class="specialty-label">专长领域</div>
                <div class="specialty-text">${agent.specialty}</div>
            </div>
            <div class="agent-stats">
                <div class="agent-stat">
                    <div class="stat-value">${agent.taskCount}</div>
                    <div class="stat-label">当前任务</div>
                </div>
                <div class="agent-stat">
                    <div class="stat-value">${Utils.chapterTemplates.filter(c => c.agent === agent.type).length}</div>
                    <div class="stat-label">可做章节</div>
                </div>
            </div>
            <div class="agent-card-actions">
                <a href="agent-detail.html?id=${agent.id}" class="btn btn-secondary btn-sm" style="flex:1;justify-content:center;">
                    <i data-lucide="user"></i> 详情
                </a>
                <button class="btn btn-secondary btn-sm edit-agent" style="flex:1;">
                    <i data-lucide="edit-2"></i> 编辑
                </button>
                <button class="btn btn-danger btn-sm delete-agent" style="flex:1;">
                    <i data-lucide="trash-2"></i> 删除
                </button>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // 绑定事件
        card.querySelector('.edit-agent').onclick = () => {
            if (window.App) window.App.editAgent(agent.id);
        };

        card.querySelector('.delete-agent').onclick = () => {
            if (window.App) window.App.deleteAgent(agent.id);
        };

        return card;
    },

    // ==================== 分析结果渲染 ====================

    renderAnalysisResult(result) {
        const container = document.getElementById('analysisResult');

        if (!result) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i data-lucide="clipboard-list"></i>
                    </div>
                    <p>输入需求后点击"分析需求"按钮</p>
                    <p class="empty-hint">系统将自动提取关键模块并建议文档结构</p>
                </div>
            `;
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
            return;
        }

        // 获取对应的Agent
        const getAgentForChapter = (agentType) => {
            const agent = Store.getAgents().find(a => a.type === agentType);
            return agent || { name: '待分配', avatarColor: '#555577' };
        };

        container.innerHTML = `
            <div class="analysis-modules">
                <h4><i data-lucide="cube"></i> 识别模块</h4>
                <div class="module-list">
                    ${result.modules.map(m => `
                        <span class="module-tag">
                            <i data-lucide="check"></i>
                            ${m}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="analysis-chapters">
                <h4><i data-lucide="file-text"></i> 建议章节</h4>
                <div class="chapter-list">
                    ${result.chapters.map(ch => {
                        const agent = getAgentForChapter(ch.agent);
                        const realAgent = Store.getAgents().find(a => a.type === ch.agent);
                        return `
                            <div class="chapter-item">
                                <span class="chapter-number">${ch.number}</span>
                                <span class="chapter-title">${ch.title}</span>
                                <a href="${realAgent ? 'agent-detail.html?id=' + realAgent.id : '#'}" class="chapter-agent" style="text-decoration:none;color:inherit;${realAgent ? '' : 'pointer-events:none;'}">
                                    <span class="agent-avatar-sm" style="background: ${agent.avatarColor}">
                                        ${agent.name.charAt(0)}
                                    </span>
                                    ${agent.name}
                                </a>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            ${result.techStack.length > 0 ? `
                <div class="analysis-tech">
                    <h4><i data-lucide="cpu"></i> 技术栈建议</h4>
                    <div class="tech-tags">
                        ${result.techStack.map(t => `
                            <span class="tech-tag">${t}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    // ==================== 添加/编辑任务表单 ====================

    getTaskFormHTML(task = null) {
        const agents = Store.getAgents();
        const isEdit = !!task;

        return `
            <form id="taskForm">
                <div class="form-group">
                    <label class="form-label">章节编号</label>
                    <input type="number" class="form-input" name="chapterNumber"
                           value="${task?.chapterNumber || ''}" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">章节标题</label>
                    <input type="text" class="form-input" name="title"
                           value="${task?.title || ''}" placeholder="例如：产品概述" required>
                </div>
                <div class="form-group">
                    <label class="form-label">章节描述</label>
                    <textarea class="form-textarea" name="description"
                              placeholder="简要描述本章内容...">${task?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">负责Agent</label>
                    <select class="form-select" name="assignedAgentId">
                        <option value="">-- 选择Agent --</option>
                        ${agents.map(a => `
                            <option value="${a.id}" ${task?.assignedAgentId === a.id ? 'selected' : ''}>
                                ${a.name} (${Utils.getAgentTypeConfig(a.type).name})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">优先级</label>
                    <select class="form-select" name="priority">
                        <option value="P0" ${task?.priority === 'P0' ? 'selected' : ''}>P0 - 紧急重要</option>
                        <option value="P1" ${task?.priority === 'P1' || !task ? 'selected' : ''}>P1 - 重要</option>
                        <option value="P2" ${task?.priority === 'P2' ? 'selected' : ''}>P2 - 一般</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">预估工时 (小时)</label>
                    <input type="number" class="form-input" name="estimatedHours"
                           value="${task?.estimatedHours || 2}" min="0.5" step="0.5">
                </div>
            </form>
        `;
    },

    // ==================== 添加/编辑Agent表单 ====================

    getAgentFormHTML(agent = null) {
        const isEdit = !!agent;
        const agentTypes = Object.entries(Utils.agentTypes);

        return `
            <form id="agentForm">
                <div class="form-group">
                    <label class="form-label">Agent名称</label>
                    <input type="text" class="form-input" name="name"
                           value="${agent?.name || ''}" placeholder="例如：架构师小智" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Agent类型</label>
                    <select class="form-select" name="type" ${isEdit ? 'disabled' : ''}>
                        ${agentTypes.map(([key, config]) => `
                            <option value="${key}" ${agent?.type === key ? 'selected' : ''}>
                                ${config.name}
                            </option>
                        `).join('')}
                    </select>
                    ${isEdit ? '<input type="hidden" name="type" value="' + agent.type + '">' : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">专长描述</label>
                    <textarea class="form-textarea" name="specialty"
                              placeholder="描述该Agent的专长领域..." required>${agent?.specialty || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">头像颜色</label>
                    <div class="color-picker">
                        ${['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'].map(color => `
                            <label class="color-option">
                                <input type="radio" name="avatarColor" value="${color}"
                                       ${agent?.avatarColor === color || (!agent && color === '#6366f1') ? 'checked' : ''}>
                                <span class="color-swatch" style="background: ${color}"></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </form>
        `;
    },

    // ==================== 执行日志面板 ====================

    showExecutionPanel() {
        const panel = document.getElementById('executionPanel');
        panel.classList.add('active');
    },

    hideExecutionPanel() {
        const panel = document.getElementById('executionPanel');
        panel.classList.remove('active');
    },

    addExecutionLog(log) {
        const content = document.getElementById('executionContent');
        const agent = Store.getAgent(log.agentId);

        const entry = document.createElement('div');
        entry.className = 'log-entry';

        entry.innerHTML = `
            <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
            <span class="log-agent">${agent?.name || '系统'}</span>
            <span class="log-action ${log.action}">${this.getActionLabel(log.action)}</span>
            <span class="log-message">${log.message}</span>
        `;

        content.appendChild(entry);
        content.scrollTop = content.scrollHeight;
    },

    getActionLabel(action) {
        const labels = {
            thinking: '思考中',
            generating: '生成中',
            reviewing: '审视中',
            complete: '完成',
            error: '错误'
        };
        return labels[action] || action;
    },

    clearExecutionLogs() {
        const content = document.getElementById('executionContent');
        content.innerHTML = '';
    }
};

// 导出到全局
window.Components = Components;
