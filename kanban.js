/**
 * 看板模块
 * 处理看板视图的渲染和拖拽交互
 */

const Kanban = {
    // 列定义
    columns: ['backlog', 'in_progress', 'review', 'done', 'published'],

    // 初始化看板
    init() {
        this.bindEvents();
        this.render();
    },

    // 绑定事件
    bindEvents() {
        // 拖拽开始
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.add('dragging');
                Store.set('kanban.draggedTask', e.target.dataset.taskId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        // 拖拽结束
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                document.querySelectorAll('.kanban-column').forEach(col => {
                    col.classList.remove('drag-over');
                });
            }
        });

        // 拖拽经过列
        document.querySelectorAll('.column-content').forEach(content => {
            content.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                content.closest('.kanban-column').classList.add('drag-over');
            });

            content.addEventListener('dragleave', (e) => {
                if (!content.contains(e.relatedTarget)) {
                    content.closest('.kanban-column').classList.remove('drag-over');
                }
            });

            // 放下
            content.addEventListener('drop', (e) => {
                e.preventDefault();
                const column = content.closest('.kanban-column');
                column.classList.remove('drag-over');

                const taskId = Store.get('kanban.draggedTask');
                const newStatus = content.dataset.status;

                if (taskId && newStatus) {
                    const task = Store.getTask(taskId);
                    if (task && task.status !== newStatus) {
                        // 特殊状态转换验证
                        if (newStatus === 'in_progress' && task.assignedAgentId) {
                            Store.moveTask(taskId, newStatus);
                            Components.showToast(`任务已移动到"${Utils.statusLabels[newStatus]}"`, 'success');
                        } else if (newStatus === 'review' && task.progress >= 100) {
                            Store.moveTask(taskId, newStatus);
                            Components.showToast(`任务已提交审核`, 'success');
                        } else if (newStatus === 'done' && task.status === 'review') {
                            Store.moveTask(taskId, newStatus);
                            Components.showToast(`任务已完成`, 'success');
                        } else if (newStatus === 'published') {
                            Components.showModal({
                                title: '确认发布',
                                body: `<p style="text-align: center;">确定要发布这章内容吗？</p>`,
                                footer: `
                                    <button class="btn btn-secondary" id="cancelPublish">取消</button>
                                    <button class="btn btn-primary" id="confirmPublish">确定</button>
                                `
                            });
                            document.getElementById('cancelPublish').onclick = () => Components.hideModal();
                            document.getElementById('confirmPublish').onclick = () => {
                                Store.moveTask(taskId, newStatus);
                                Components.hideModal();
                                Components.showToast(`章节已发布`, 'success');
                                Markdown.updatePreview();
                            };
                        } else if (['backlog', 'in_progress', 'done', 'published'].includes(newStatus)) {
                            Store.moveTask(taskId, newStatus);
                            Components.showToast(`任务已移动到"${Utils.statusLabels[newStatus]}"`, 'success');
                        } else {
                            Components.showToast('请先完成内容编写', 'warning');
                        }
                    }
                }
            });
        });

        // 添加任务按钮
        document.querySelectorAll('.column-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const status = btn.dataset.status;
                if (window.App) {
                    window.App.showAddTaskModal(status);
                }
            });
        });

        // 监听任务变化
        Store.subscribe('tasks', () => {
            this.render();
        });
    },

    // 渲染看板
    render() {
        this.columns.forEach(status => {
            const content = document.querySelector(`.column-content[data-status="${status}"]`);
            const tasks = Store.getTasksByStatus(status);

            // 更新计数
            const countEl = document.getElementById(`${status}Count`);
            if (countEl) {
                countEl.textContent = tasks.length;
            }
        });

        // 更新总任务数
        const totalCount = Store.getTasks().length;
        const totalCountEl = document.getElementById('totalTaskCount');
        if (totalCountEl) {
            totalCountEl.textContent = totalCount;
        }

        // 渲染每个列的任务
        this.renderColumns();
    },

    // 渲染所有列
    renderColumns() {
        this.columns.forEach(status => {
            const content = document.querySelector(`.column-content[data-status="${status}"]`);
            const tasks = Store.getTasksByStatus(status);

            if (tasks.length === 0) {
                content.innerHTML = `
                    <div class="column-empty">
                        <i data-lucide="inbox"></i>
                        <p>暂无任务</p>
                    </div>
                `;
            } else {
                content.innerHTML = '';
                tasks.forEach(task => {
                    const card = Components.createTaskCard(task);
                    content.appendChild(card);
                });
            }
        });

        // 重新初始化Lucide图标
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    // 渲染单个列
    renderColumn(status) {
        const content = document.querySelector(`.column-content[data-status="${status}"]`);
        const tasks = Store.getTasksByStatus(status);

        if (tasks.length === 0) {
            content.innerHTML = `
                <div class="column-empty">
                    <i data-lucide="inbox"></i>
                    <p>暂无任务</p>
                </div>
            `;
        } else {
            content.innerHTML = '';
            tasks.forEach(task => {
                const card = Components.createTaskCard(task);
                content.appendChild(card);
            });
        }

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    // 高亮显示任务
    highlightTask(taskId) {
        // 移除其他高亮
        document.querySelectorAll('.task-card.highlighted').forEach(card => {
            card.classList.remove('highlighted');
        });

        // 添加高亮
        const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        if (card) {
            card.classList.add('highlighted');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    // 获取下一个状态
    getNextStatus(currentStatus) {
        const statusOrder = ['backlog', 'in_progress', 'review', 'done', 'published'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        if (currentIndex < statusOrder.length - 1) {
            return statusOrder[currentIndex + 1];
        }
        return currentStatus;
    },

    // 获取状态标签
    getStatusLabel(status) {
        return Utils.statusLabels[status] || status;
    }
};

// 导出到全局
window.Kanban = Kanban;
