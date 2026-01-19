/**
 * Electron 主进程入口文件
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initializeIpcHandlers } from './ipc';
import { kafkaConsumerService } from './services/KafkaConsumerService';

// 全局窗口引用
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'DevKit - Kafka Client',
    frame: true,
    backgroundColor: '#f5f7fa',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // 开发环境禁用sandbox，避免一些兼容性问题
    },
    show: false, // 等待ready-to-show事件再显示
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：加载Vite开发服务器
    // 尝试从环境变量获取端口，默认5173
    const vitePort = process.env.VITE_PORT || '5173';
    const viteUrl = `http://localhost:${vitePort}`;
    console.log('Loading Vite dev server from:', viteUrl);

    // 尝试加载，如果失败则尝试其他端口
    const tryLoadUrl = async (url: string, ports: string[] = []): Promise<void> => {
      try {
        await mainWindow!.loadURL(url);
        console.log('Successfully loaded:', url);
      } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        if (ports.length > 0) {
          const nextPort = ports.shift()!;
          const nextUrl = `http://localhost:${nextPort}`;
          console.log('Trying alternative port:', nextUrl);
          await tryLoadUrl(nextUrl, ports);
        } else {
          console.error('Failed to load Vite dev server on any port');
          throw error;
        }
      }
    };

    // 尝试默认端口，如果失败则尝试 5174, 5175, 5176
    const alternativePorts = ['5174', '5175', '5176'];
    tryLoadUrl(viteUrl, alternativePorts).catch((error) => {
      console.error('All port attempts failed:', error);
    });

    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的文件
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    console.log('Loading renderer from:', rendererPath);
    mainWindow.loadFile(rendererPath);

    // 生产环境也打开 DevTools 便于调试
    mainWindow.webContents.openDevTools();
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 设置消费者服务的窗口引用
  kafkaConsumerService.setMainWindow(mainWindow);

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    kafkaConsumerService.setMainWindow(null);
    mainWindow = null;
  });
}

/**
 * 应用初始化
 */
async function initialize(): Promise<void> {
  try {
    await app.whenReady();

    // 初始化 IPC 处理器
    initializeIpcHandlers();

    // 创建主窗口
    createWindow();

    // macOS 特殊处理：点击dock图标重新创建窗口
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
}

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 启动应用
initialize();

// 导出mainWindow供IPC使用
export { mainWindow };
