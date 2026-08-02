# 大厂裁员生存模拟器

职场情绪向文字生存游戏。玩家扮演互联网大厂基层员工，在 90 天裁员潮中分配每日 3 点精力，在绩效、发量、尊严、存款之间挣扎，目标是撑到年终奖或反向晋升。

## 当前内容

- 5 类每日行动：加班干活、摸鱼划水、向上管理、抱团站队、副业赚钱
- 4 项核心数值：绩效分、发量值、尊严值、存款额
- 1 项隐藏数值：埋雷指数
- 200 条结构化事件：140 日常、40 危机、20 机遇
- 12 个结局
- 5 个激励视频广告点位
- 配置导出、发行前 smoke、release zip 打包流程

## 运行

线上试玩：

```text
https://luyusheng995.github.io/layoff-survival-simulator/
```

本地运行：

```bash
npm start
```

然后打开：

```text
http://127.0.0.1:4173/
```

## 验证

```bash
npm test
npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal
npm run playtest
npm run browser:smoke
npm run smoke
```

## 交付配置

```bash
npm run export:config
```

会生成：

- `dist/game-config.json`
- `docs/delivery/game-config.md`

## 发行归档

```bash
npm run release
```

会重新导出配置、执行 smoke，并生成：

- `release/layoff-survival-simulator-v0.1.0.zip`
- `release/layoff-survival-simulator-v0.1.0-manifest.json`
- `release/README.md`
