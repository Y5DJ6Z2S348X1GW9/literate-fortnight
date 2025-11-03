/**
 * Service Worker Scope 修复验证脚本
 * 
 * 此脚本验证 Service Worker scope 路径修复是否正确
 * 运行方式: 在浏览器控制台中加载此脚本
 */

console.log('🔧 开始验证 Service Worker Scope 修复...\n');

// 测试 1: 检查 PathConfig
console.log('📋 测试 1: PathConfig 配置');
import('./js/config/PathConfig.js').then(({ pathConfig }) => {
    const config = pathConfig.getConfig();
    console.log('  Base Path:', config.basePath || '(root)');
    console.log('  检测方法:', config.detectionMethod);
    console.log('  路径有效:', config.isValid ? '✅' : '❌');
    
    // 测试 2: 检查 scope 格式
    console.log('\n📋 测试 2: Scope 格式验证');
    let swScope = pathConfig.getBasePath();
    if (!swScope || swScope === '') {
        swScope = '/';
    } else {
        swScope = swScope.endsWith('/') ? swScope : swScope + '/';
    }
    
    console.log('  计算的 Scope:', swScope);
    console.log('  尾部斜杠:', swScope.endsWith('/') ? '✅ 存在' : '❌ 缺失');
    
    // 测试 3: 尝试注册 Service Worker
    console.log('\n📋 测试 3: Service Worker 注册');
    const swPath = pathConfig.resolvePath('service-worker.js');
    console.log('  SW 路径:', swPath);
    console.log('  SW Scope:', swScope);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(swPath, { scope: swScope })
            .then(registration => {
                console.log('  ✅ 注册成功!');
                console.log('  实际 Scope:', registration.scope);
                console.log('  Active:', registration.active ? '是' : '否');
                
                // 验证 scope 格式
                if (registration.scope.endsWith('/')) {
                    console.log('  ✅ Scope 格式正确 (有尾部斜杠)');
                } else {
                    console.log('  ⚠️ Scope 格式异常 (缺少尾部斜杠)');
                }
            })
            .catch(error => {
                console.error('  ❌ 注册失败:', error.message);
                console.error('  错误详情:', error);
            });
    } else {
        console.log('  ⚠️ 浏览器不支持 Service Worker');
    }
    
    // 测试 4: 检查已注册的 Service Workers
    console.log('\n📋 测试 4: 已注册的 Service Workers');
    navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length === 0) {
            console.log('  没有已注册的 Service Workers');
        } else {
            console.log(`  找到 ${registrations.length} 个已注册的 Service Workers:`);
            registrations.forEach((reg, index) => {
                console.log(`  #${index + 1}:`);
                console.log('    Scope:', reg.scope);
                console.log('    格式:', reg.scope.endsWith('/') ? '✅ 正确' : '❌ 错误');
            });
        }
    });
    
    console.log('\n✅ 验证完成!');
    console.log('💡 提示: 如果看到任何 ❌ 标记，请检查相关配置');
});
