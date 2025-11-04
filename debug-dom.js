// Debug DOM状态
// 在浏览器Console中运行这段代码来检查DOM状态

console.log('=== DOM调试信息 ===');

// 检查主要元素
const app = document.getElementById('app');
const configWizard = document.getElementById('config-wizard');
const mainApp = document.getElementById('main-app');

console.log('1. #app 元素:', app);
console.log('   - 存在:', !!app);
console.log('   - 子元素数:', app ? app.children.length : 0);

console.log('\n2. #config-wizard 元素:', configWizard);
console.log('   - 存在:', !!configWizard);
console.log('   - 类名:', configWizard ? configWizard.className : 'N/A');
console.log('   - 是否hidden:', configWizard ? configWizard.classList.contains('hidden') : 'N/A');
console.log('   - display样式:', configWizard ? window.getComputedStyle(configWizard).display : 'N/A');

console.log('\n3. #main-app 元素:', mainApp);
console.log('   - 存在:', !!mainApp);
console.log('   - 类名:', mainApp ? mainApp.className : 'N/A');
console.log('   - 是否hidden:', mainApp ? mainApp.classList.contains('hidden') : 'N/A');
console.log('   - display样式:', mainApp ? window.getComputedStyle(mainApp).display : 'N/A');

// 检查body样式
console.log('\n4. Body样式:');
console.log('   - overflow:', window.getComputedStyle(document.body).overflow);
console.log('   - height:', window.getComputedStyle(document.body).height);
console.log('   - background:', window.getComputedStyle(document.body).background);

// 检查#app样式
if (app) {
    console.log('\n5. #app样式:');
    console.log('   - display:', window.getComputedStyle(app).display);
    console.log('   - height:', window.getComputedStyle(app).height);
    console.log('   - visibility:', window.getComputedStyle(app).visibility);
}

// 手动显示主应用
console.log('\n=== 尝试手动显示主应用 ===');
if (configWizard) {
    configWizard.classList.add('hidden');
    console.log('✅ 隐藏配置向导');
}
if (mainApp) {
    mainApp.classList.remove('hidden');
    console.log('✅ 显示主应用');
    console.log('主应用display:', window.getComputedStyle(mainApp).display);
}

console.log('\n=== 调试完成 ===');
console.log('如果主应用还是不显示，请检查CSS文件是否正确加载');
