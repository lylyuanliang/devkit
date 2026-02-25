# 样式迁移映射文档

## KafkaToolComponent 内联样式到 Tailwind CSS 映射

### 颜色映射

#### 深色模式
- containerBg: #111827 → `bg-slate-950`
- headerBg: #1f2937 → `bg-gray-800`
- sidebarBg: #1f2937 → `bg-gray-800`
- cardBg: #273142 → `bg-slate-800`
- textPrimary: #f3f4f6 → `text-gray-100`
- textSecondary: #d1d5db → `text-gray-300`
- border: #374151 → `border-gray-700`
- accent: #3b82f6 → `text-blue-500`
- inputBg: #1f2937 → `bg-gray-800`
- inputBorder: #374151 → `border-gray-700`
- topicCardBg: #1e3a5f → `bg-blue-900`
- topicCardBorder: #1e4d7b → `border-blue-800`
- emptyBg: #0f172a → `bg-slate-950`
- emptyBorder: #1e3a5f → `border-blue-900`
- emptyText: #60a5fa → `text-blue-400`
- hoverBg: #374151 → `hover:bg-gray-700`

#### 浅色模式
- containerBg: #f9fafb → `bg-gray-50`
- headerBg: #ffffff → `bg-white`
- sidebarBg: #f3f4f6 → `bg-gray-100`
- cardBg: #ffffff → `bg-white`
- textPrimary: #111827 → `text-gray-900`
- textSecondary: #6b7280 → `text-gray-500`
- border: #e5e7eb → `border-gray-200`
- accent: #2563eb → `text-blue-600`
- inputBg: #ffffff → `bg-white`
- inputBorder: #d1d5db → `border-gray-300`
- topicCardBg: #f0f9ff → `bg-blue-50`
- topicCardBorder: #bfdbfe → `border-blue-200`
- emptyBg: #eff6ff → `bg-blue-50`
- emptyBorder: #bfdbfe → `border-blue-200`
- emptyText: #1e40af → `text-blue-800`
- hoverBg: #f0f0f0 → `hover:bg-gray-100`

### 组件样式映射

#### Container
```
内联: { width: '100%', height: '100%', backgroundColor, display: 'flex', flexDirection: 'column', transition }
Tailwind: w-full h-full bg-slate-950 dark:bg-gray-50 flex flex-col transition-colors
```

#### Header
```
内联: { backgroundColor, borderBottom, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
Tailwind: bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center
```

#### Title
```
内联: { fontSize: '24px', fontWeight: 'bold', margin: 0, color }
Tailwind: text-2xl font-bold text-gray-900 dark:text-gray-100
```

#### Sidebar
```
内联: { width: '200px', backgroundColor, borderRight, overflowY: 'auto' }
Tailwind: w-48 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto
```

#### Nav Item
```
内联: { display: 'block', width: '100%', padding: '12px 16px', border: 'none', backgroundColor: 'transparent', color, cursor: 'pointer', fontSize: '14px', fontWeight: 500, borderLeft: '3px solid transparent' }
Tailwind: block w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer border-l-4 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
```

#### Nav Item Active
```
内联: { backgroundColor, color, borderLeftColor }
Tailwind: bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400
```

#### Card
```
内联: { backgroundColor, border: '1px solid', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }
Tailwind: bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-4
```

#### Input
```
内联: { width: '100%', padding: '8px 12px', border: '1px solid', borderRadius: '6px', fontSize: '14px', backgroundColor, color }
Tailwind: w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
```

#### Button
```
内联: { padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor, color, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }
Tailwind: px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed
```

#### Button Disabled
```
内联: { opacity: 0.5, cursor: 'not-allowed' }
Tailwind: disabled:opacity-50 disabled:cursor-not-allowed
```

#### Empty Message
```
内联: { padding: '24px', textAlign: 'center', color, backgroundColor, borderRadius: '8px', border: '1px dashed' }
Tailwind: p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700
```

#### Topic Grid
```
内联: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }
Tailwind: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
```

#### Topic Card
```
内联: { backgroundColor, border: '1px solid', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }
Tailwind: bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 cursor-pointer hover:shadow-md hover:scale-105 transition-all
```

### 间距映射

- 8px → `p-2` / `m-2`
- 12px → `p-3` / `m-3`
- 16px → `p-4` / `m-4`
- 24px → `p-6` / `m-6`
- 32px → `p-8` / `m-8`

### 圆角映射

- 6px → `rounded-md`
- 8px → `rounded-lg`
- 50% → `rounded-full`

### 字体大小映射

- 12px → `text-xs`
- 14px → `text-sm`
- 16px → `text-base`
- 20px → `text-lg`
- 24px → `text-2xl`

### 字体权重映射

- 400 → `font-normal`
- 500 → `font-medium`
- 600 → `font-semibold`
- 700 → `font-bold`

### 边框映射

- 1px solid → `border border-gray-200`
- 1px dashed → `border-2 border-dashed`
- 3px solid → `border-l-4` (for left border)

### 阴影映射

- 0 1px 3px rgba(0,0,0,0.1) → `shadow-sm`
- 0 4px 6px rgba(0,0,0,0.1) → `shadow-md`
- 0 10px 15px rgba(0,0,0,0.1) → `shadow-lg`

### 过渡映射

- transition: 'all 0.2s' → `transition-all`
- transition: 'background-color 0.2s' → `transition-colors`
- transition: 'opacity 0.2s' → `transition-opacity`

## 实现策略

1. **第一阶段**: 替换基础样式对象（container, header, sidebar, card, input, button）
2. **第二阶段**: 替换视图特定样式（clusters, topics, consumer-groups, produce）
3. **第三阶段**: 移除 createThemeStyles 函数，使用 Tailwind 的 dark: 前缀
4. **第四阶段**: 测试所有视图和主题切换
