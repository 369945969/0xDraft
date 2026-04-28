/**
 * 工具函数模块
 * 提供通用工具函数、数据处理和辅助方法
 */

const Utils = {
    // 生成唯一ID
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // 深拷贝对象
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化日期时间
    formatDateTime(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 相对时间
    relativeTime(date) {
        const now = Date.now();
        const diff = now - new Date(date).getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return Utils.formatDateTime(date);
    },

    // 本地存储操作
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage clear error:', e);
                return false;
            }
        }
    },

    // 导出数据为文件下载
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 复制文本到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (e) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    // 验证数据
    validate: {
        isEmpty(value) {
            return value === null || value === undefined || value === '';
        },

        isEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        minLength(value, min) {
            return value && value.length >= min;
        },

        maxLength(value, max) {
            return value && value.length <= max;
        }
    },

    // 随机颜色生成
    randomColor() {
        const colors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
            '#f97316', '#eab308', '#22c55e', '#14b8a6',
            '#06b6d4', '#3b82f6', '#a855f7', '#d946ef'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Agent类型配置
    agentTypes: {
        architect: {
            name: '架构师',
            icon: 'layout',
            color: '#6366f1',
            specialty: '负责系统架构设计、模块划分和技术选型'
        },
        pm: {
            name: '产品经理',
            icon: 'clipboard-list',
            color: '#8b5cf6',
            specialty: '负责功能描述、需求分析和用户故事编写'
        },
        designer: {
            name: '设计师',
            icon: 'palette',
            color: '#ec4899',
            specialty: '负责UI/UX设计、交互体验和视觉规范'
        },
        developer: {
            name: '开发者',
            icon: 'code',
            color: '#22c55e',
            specialty: '负责技术实现细节、数据库设计和API规范'
        },
        writer: {
            name: '技术写作',
            icon: 'file-text',
            color: '#06b6d4',
            specialty: '负责文档撰写、格式规范和内容审核'
        },
        reviewer: {
            name: '评审',
            icon: 'check-circle',
            color: '#f59e0b',
            specialty: '负责审视验证文档质量、一致性和完整性'
        }
    },

    // 获取Agent类型配置
    getAgentTypeConfig(type) {
        return Utils.agentTypes[type] || Utils.agentTypes.writer;
    },

    // 文档章节模板
    chapterTemplates: [
        { number: 1, title: '产品概述', agent: 'pm' },
        { number: 2, title: '用户角色与需求分析', agent: 'pm' },
        { number: 3, title: '系统架构设计', agent: 'architect' },
        { number: 4, title: '功能模块设计', agent: 'architect' },
        { number: 5, title: '数据库设计', agent: 'developer' },
        { number: 6, title: '接口设计', agent: 'developer' },
        { number: 7, title: '原型设计', agent: 'designer' },
        { number: 8, title: '非功能性需求', agent: 'architect' },
        { number: 9, title: '项目规划', agent: 'pm' }
    ],

    // 状态映射
    statusLabels: {
        backlog: '待认领',
        in_progress: '进行中',
        review: '待审视',
        done: '已完成',
        published: '已发布'
    },

    // 状态颜色
    statusColors: {
        backlog: '#555577',
        in_progress: '#f59e0b',
        review: '#8b5cf6',
        done: '#10b981',
        published: '#22d3ee'
    },

    // 优先级配置
    priorityLabels: {
        P0: '紧急重要',
        P1: '重要',
        P2: '一般'
    },

    // 分析需求文本
    analyzeRequirement(text) {
        // 提取关键词和模块
        const modules = [];
        const patterns = [
            /(?:功能|模块|系统|平台|应用):?\s*([^。\n]+)/gi,
            /(\w+(?:管理|系统|平台|工具|模块))/gi,
            /需要\s*(\w+)/gi
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const module = match[1].trim();
                if (module.length > 2 && module.length < 20 && !modules.includes(module)) {
                    modules.push(module);
                }
            }
        });

        // 限制模块数量
        const uniqueModules = [...new Set(modules)].slice(0, 8);

        // 生成章节建议
        const chapters = Utils.deepClone(Utils.chapterTemplates);

        // 根据内容调整章节
        if (text.includes('数据库') || text.includes('存储')) {
            chapters.push({ number: 10, title: '数据存储方案', agent: 'developer' });
        }
        if (text.includes('移动') || text.includes('APP') || text.includes('小程序')) {
            chapters.push({ number: 11, title: '移动端设计', agent: 'designer' });
        }
        if (text.includes('安全') || text.includes('权限')) {
            chapters.push({ number: 12, title: '安全方案设计', agent: 'architect' });
        }

        // 提取技术栈建议
        const techStack = [];
        const techPatterns = {
            '前端': /React|Vue|Angular|jQuery|HTML5|CSS3/gi,
            '后端': /Node\.js|Python|Java|Go|\.NET|Spring/gi,
            '数据库': /MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch/gi,
            '云服务': /AWS|Azure|阿里云|腾讯云|Kubernetes|Docker/gi,
            'AI/ML': /TensorFlow|PyTorch|Machine Learning|NLP/gi
        };

        Object.entries(techPatterns).forEach(([category, pattern]) => {
            const matches = text.match(pattern);
            if (matches) {
                techStack.push(...new Set(matches.map(m => m.toUpperCase())));
            }
        });

        return {
            modules: uniqueModules,
            chapters: chapters,
            techStack: [...new Set(techStack)].slice(0, 6),
            summary: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        };
    },

    // 模拟Agent生成内容
    async generateContent(task, agent) {
        // 模拟AI思考和生成过程
        const thinkingTime = 1000 + Math.random() * 2000;
        const generatingTime = 2000 + Math.random() * 3000;

        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        // 根据任务和Agent类型生成不同内容
        const contentTemplates = {
            1: `# ${task.title}\n\n## 1.1 项目背景\n\n本项目旨在开发一套完整的系统解决方案，满足现代企业数字化转型的需求。\n\n## 1.2 项目目标\n\n- 实现核心业务流程的数字化管理\n- 提供高效的数据分析和决策支持\n- 提升用户体验和系统可用性\n\n## 1.3 项目范围\n\n本项目涵盖需求分析、系统设计、开发实施、测试验收等全生命周期。`,
            2: `# ${task.title}\n\n## 2.1 用户角色分析\n\n| 角色 | 描述 | 主要需求 |\n|------|------|----------|\n| 管理员 | 系统维护者 | 权限管理、系统配置 |\n| 普通用户 | 业务操作者 | 日常业务处理 |\n| 访客 | 外部用户 | 信息查询 |\n\n## 2.2 功能需求\n\n### 2.2.1 核心功能\n\n1. 用户管理功能\n2. 数据管理功能\n3. 查询统计功能\n4. 报表导出功能`,
            3: `# ${task.title}\n\n## 3.1 系统架构概述\n\n本系统采用分层架构设计，包括表现层、业务层、数据层三个主要层次。\n\n## 3.2 技术架构\n\n\`\`\`\n┌─────────────────┐\n│   表现层 (UI)    │\n├─────────────────┤\n│   业务层 (API)   │\n├─────────────────┤\n│   数据层 (Data)  │\n└─────────────────┘\n\`\`\`\n\n## 3.3 技术选型\n\n- **前端框架**: React 18\n- **后端框架**: Node.js + Express\n- **数据库**: PostgreSQL + Redis\n- **缓存**: Redis Cluster\n- **容器化**: Docker + Kubernetes`,
            4: `# ${task.title}\n\n## 4.1 模块划分\n\n系统划分为以下核心模块：\n\n### 4.1.1 用户模块\n\n负责用户注册、登录、权限管理等基础功能。\n\n### 4.1.2 业务模块\n\n实现核心业务流程的处理逻辑。\n\n### 4.1.3 数据模块\n\n提供数据存储、查询、统计分析功能。`,
            5: `# ${task.title}\n\n## 5.1 数据库选型\n\n本系统采用关系型数据库PostgreSQL作为主要数据存储方案。\n\n## 5.2 核心表结构\n\n### 5.2.1 用户表 (users)\n\n| 字段名 | 类型 | 说明 |\n|--------|------|------|\n| id | BIGINT | 主键ID |\n| username | VARCHAR(50) | 用户名 |\n| email | VARCHAR(100) | 邮箱 |\n| password | VARCHAR(255) | 密码Hash |\n| created_at | TIMESTAMP | 创建时间 |`,
            6: `# ${task.title}\n\n## 6.1 API设计规范\n\n本系统采用RESTful API设计规范。\n\n## 6.2 接口列表\n\n### 用户接口\n\n| 方法 | 路径 | 说明 |\n|------|------|------|\n| POST | /api/users | 创建用户 |\n| GET | /api/users/:id | 获取用户信息 |\n| PUT | /api/users/:id | 更新用户 |\n| DELETE | /api/users/:id | 删除用户 |`,
            7: `# ${task.title}\n\n## 7.1 设计原则\n\n- 简洁直观：界面设计简洁，操作直观易懂\n- 一致性：保持整体风格和交互方式的一致\n- 可用性：确保功能易于理解和使用\n\n## 7.2 视觉规范\n\n### 颜色规范\n\n- 主色调：#6366F1\n- 辅助色：#8B5CF6\n- 强调色：#22D3EE`,
            8: `# ${task.title}\n\n## 8.1 性能需求\n\n- 系统响应时间 < 200ms\n- 支持1000并发用户\n- 数据处理能力 > 10000 TPS\n\n## 8.2 安全需求\n\n- 数据加密传输 (HTTPS)\n- 敏感数据加密存储\n- 完善的权限控制机制\n\n## 8.3 可用性需求\n\n- 系统可用性 > 99.9%\n- 支持7x24小时运行\n- 故障恢复时间 < 30分钟`,
            9: `# ${task.title}\n\n## 9.1 项目阶段划分\n\n| 阶段 | 时间 | 主要交付物 |\n|------|------|------------|\n| 需求分析 | 2周 | 需求规格说明书 |\n| 系统设计 | 3周 | 设计文档 |\n| 开发实施 | 8周 | 可运行系统 |\n| 测试验收 | 3周 | 测试报告 |\n\n## 9.2 资源配置\n\n- 项目经理：1人\n- 开发人员：4人\n- 测试人员：2人\n- UI设计：1人`
        };

        return contentTemplates[task.chapterNumber] || `# ${task.title}\n\n本章节内容由 ${agent.name} 负责编写。\n\n## 内容概要\n\n详细的功能说明和技术实现细节。`;
    },

    // 随机等待
    randomDelay(min = 500, max = 2000) {
        return new Promise(resolve => {
            setTimeout(resolve, min + Math.random() * (max - min));
        });
    }
};

// 导出到全局
window.Utils = Utils;
