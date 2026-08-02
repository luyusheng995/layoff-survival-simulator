export const PUBLIC_PLAY_URL = 'https://luyusheng995.github.io/layoff-survival-simulator/';

const LAUNCH_NOTES = [
  {
    version: 'v0.1.0',
    label: '公开试玩已上线',
    detail: 'GitHub Pages 版本已开放，桌面和移动端 smoke 均通过。'
  },
  {
    version: 'M24',
    label: '分享入口补齐',
    detail: '新增复制试玩链接和上线记录，方便把裁员体验发给同事。'
  }
];

export function getLaunchNotes() {
  return LAUNCH_NOTES.map((note) => ({ ...note }));
}

export function createLaunchShareText(url = PUBLIC_PLAY_URL) {
  return `大厂裁员生存模拟器：90 天裁员潮，每天 3 点精力，看看你能不能撑到年底。${url}`;
}
