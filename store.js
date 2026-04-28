/**
 * 状态管理模块
 * 使用发布-订阅模式管理应用状态
 */

const Store = {
    state: {
        // 项目管理
        projects: [],
        currentProjectId: null,
        
        // Agent分组
        agentGroups: [],
        
        // 全局数据 (通过当前项目ID隔离或全局共享)
        tasks: [],        // 包含 projectId 关联
        agents: [],       // 全局 Agent 池
        logs: [],         // 包含 projectId 关联
        analysisResult: null // 对应当前项目的分析缓存
    },

    subscribers: {},
    storageKey: 'agent_board_state_v2', // 升级版本以防冲突

    // 初始化：从本地存储加载或使用默认数据
    init() {
        const saved = Utils.storage.get(this.storageKey);
        if (saved) {
            this.state = { ...this.state, ...saved };
        } else {
            // 首次初始化默认数据
            this.setupDefaults();
        }

        // 监听存储变化（多标签页同步）
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                this.state = JSON.parse(e.newValue);
                this.notifyAll();
            }
        });
    },

    setupDefaults() {
        const defaultAgents = this.getDefaultAgents();
        const defaultGroupId = 'group_core';
        const defaultProjectId = 'project_default';
        
        this.state.agents = defaultAgents;
        this.state.agentGroups = [{
            id: defaultGroupId,
            name: '核心专家组',
            agentIds: defaultAgents.map(a => a.id)
        }];
        
        this.state.projects = [{
            id: defaultProjectId,
            name: '示例项目 - 智能协作平台',
            description: '这是一个演示多项目管理和 Agent 协作的默认项目。',
            groupId: defaultGroupId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }];
        
        this.state.currentProjectId = defaultProjectId;
        this.save();
    },

    // 获取默认Agent列表
    getDefaultAgents() {
        return [
            { id: 'agent_architect', name: '架构师小智', type: 'architect', specialty: '负责系统架构设计、模块划分和技术选型。', avatarColor: '#6366f1', status: 'online', taskCount: 0 },
            { id: 'agent_pm', name: '产品经理小慧', type: 'pm', specialty: '负责功能描述、需求分析和用户故事编写。', avatarColor: '#8b5cf6', status: 'online', taskCount: 0 },
            { id: 'agent_designer', name: '设计师小林', type: 'designer', specialty: '负责UI/UX设计、交互体验和视觉规范。', avatarColor: '#ec4899', status: 'online', taskCount: 0 },
            { id: 'agent_developer', name: '开发者小程', type: 'developer', specialty: '负责技术实现细节、数据库设计和API规范。', avatarColor: '#22c55e', status: 'online', taskCount: 0 },
            { id: 'agent_writer', name: '技术写作小文', type: 'writer', specialty: '负责文档撰写、格式规范和内容审核。', avatarColor: '#06b6d4', status: 'online', taskCount: 0 },
            { id: 'agent_reviewer', name: '评审专家老严', type: 'reviewer', specialty: '负责审视验证文档质量。', avatarColor: '#f59e0b', status: 'online', taskCount: 0 }
        ];
    },

    // 获取当前活动项目
    getCurrentProject() {
        return this.state.projects.find(p => p.id === this.state.currentProjectId) || this.state.projects[0];
    },

    // 切换项目
    switchProject(projectId) {
        if (this.state.projects.find(p => p.id === projectId)) {
            this.state.currentProjectId = projectId;
            this.save();
            this.notifyAll();
            return true;
        }
        return false;
    },

    // 创建项目
    createProject(name, description, groupId) {
        const newProject = {
            id: Utils.generateId(),
            name,
            description,
            groupId: groupId || this.state.agentGroups[0]?.id,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.state.projects.push(newProject);
        this.state.currentProjectId = newProject.id;
        this.save();
        this.notify('projects');
        this.notify('currentProjectId');
        return newProject;
    },

    // ==================== 状态核心方法 ====================
    get(key) {
        const keys = key.split('.');
        let value = this.state;
        for (const k of keys) { value = value?.[k]; }
        return value;
    },

    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let target = this.state;
        for (const k of keys) {
            if (!target[k]) target[k] = {};
            target = target[k];
        }
        target[lastKey] = value;
        this.save();
        this.notify(key);
    },

    save() {
        Utils.storage.set(this.storageKey, this.state);
    },

    subscribe(key, callback) {
        if (!this.subscribers[key]) { this.subscribers[key] = []; }
        this.subscribers[key].push(callback);
        return () => {
            this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
        };
    },

    notify(key) {
        const subscribers = this.subscribers[key] || [];
        const value = this.get(key);
        subscribers.forEach(callback => {
            try { callback(value, this.state); } catch (e) { console.error('Subscriber error:', e); }
        });
    },

    notifyAll() {
        Object.keys(this.subscribers).forEach(key => this.notify(key));
    },

    // ==================== 任务管理 (带隔离) ====================
    getTasks() { 
        return this.state.tasks.filter(t => t.projectId === this.state.currentProjectId); 
    },
    getTasksByStatus(status) { 
        return this.getTasks().filter(task => task.status === status); 
    },
    
    addTask(task) {
        const newTask = {
            id: Utils.generateId(),
            projectId: this.state.currentProjectId,
            chapterNumber: task.chapterNumber || (this.getTasks().length + 1),
            title: task.title,
            description: task.description || '',
            content: task.content || '',
            status: task.status || 'backlog',
            priority: task.priority || 'P1',
            assignedAgentId: task.assignedAgentId || null,
            progress: task.progress || 0,
            estimatedHours: task.estimatedHours || 2,
            actualHours: task.actualHours || 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.state.tasks.push(newTask);
        this.save();
        this.notify('tasks');
        return newTask;
    },

    updateTask(id, updates) {
        const index = this.state.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;
        this.state.tasks[index] = { ...this.state.tasks[index], ...updates, updatedAt: Date.now() };
        this.save();
        this.notify('tasks');
        return this.state.tasks[index];
    },

    // ==================== Agent管理 ====================
    getAgents() { return this.state.agents; },
    
    // 获取当前项目可用 Agent (所属组内的)
    getProjectAgents() {
        const project = this.getCurrentProject();
        if (!project) return [];
        const group = this.state.agentGroups.find(g => g.id === project.groupId);
        if (!group) return [];
        return this.state.agents.filter(a => group.agentIds.includes(a.id));
    },

    // ==================== 日志管理 (带隔离) ====================
    addLog(log) {
        const newLog = {
            id: Utils.generateId(),
            projectId: this.state.currentProjectId,
            taskId: log.taskId || null,
            agentId: log.agentId || null,
            action: log.action,
            message: log.message,
            timestamp: Date.now()
        };
        this.state.logs.push(newLog);
        this.notify('logs');
        return newLog;
    },

    getLogs() { 
        return this.state.logs.filter(l => l.projectId === this.state.currentProjectId); 
    },

    // ==================== UI 同步 ====================
    initProjectSync() {
        // 渲染项目选择器
        if (window.Components && Components.renderProjectSelector) {
            Components.renderProjectSelector();
        }

        // 同步面包屑
        const syncBreadcrumb = () => {
            const project = this.getCurrentProject();
            const breadcrumbProj = document.getElementById('breadcrumbProject');
            if (breadcrumbProj) {
                breadcrumbProj.textContent = project ? project.name : '未选择项目';
            }
        };
        syncBreadcrumb();

        // 订阅切换
        this.subscribe('currentProjectId', () => {
            if (window.Components && Components.renderProjectSelector) {
                Components.renderProjectSelector();
            }
            syncBreadcrumb();
            
            // 触发页面级重绘 (如果有对应的 render 函数)
            if (window.Kanban && Kanban.render) Kanban.render();
            if (window.App && window.App.renderAgents) window.App.renderAgents();
            
            // 如果在详情页，可能需要跳回列表页，因为项目变了
            const isDetailPage = window.location.pathname.includes('-detail.html');
            if (isDetailPage) {
                const basePage = window.location.pathname.includes('task-detail') ? 'kanban.html' : 'agents.html';
                window.location.href = basePage;
            } else {
                // 非详情页刷新当前页面内容
                // location.reload(); // 也可以选择不刷新，由页面内部监听
            }
        });
    },

    // ==================== 数据清理 ====================
    clearAll() {
        Utils.storage.remove(this.storageKey);
        this.setupDefaults();
        this.notifyAll();
    }
};

// 初始化Store
Store.init();
window.Store = Store;
