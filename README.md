# PvZ2-Gardendless-GitHubLevels

[English](#english) | [中文](#中文)

---

## English

Levels in this repository are fetched by the **GitHub Level Window** in *PvZ2: Gardendless*.

### Repository Structure

**Level folders at the root must be named after their authors.** Repository maintenance files (`scripts/`, `tests/`, `.github/`, and `levels-index.json`) are separate from level submissions.

Each author must place their levels (files or subfolders) **inside a folder named after themselves**. Do **not** put level files directly in the root directory.
```
.
├── AuthorA/
│ ├── level1.json
│ └── level2.json
├── AuthorB/
│ ├── level1.json
│ └── SubFolder/
│ └── level3.json
└── ...
```
### Automatic level index

The static Pages build also emits `/api/github-levels/catalog.json` for the official website's level browser. It contains localized names/descriptions, authors, stage, available starting-sun/wave/seed information, original paths, byte sizes and Git blob SHAs; the client tree/raw endpoints remain unchanged. The browser fetches a single catalog, then the selected level on demand. `scripts/level-text.mjs` contains official `MultiLanguage.LevelName` text from game 0.16.15 for resolving built-in name keys. This is static build output, with no Functions, Workers or R2 bindings.

After a push to `main`, the **Generate levels index** GitHub Actions workflow generates and commits `levels-index.json` when its contents change. Maintainers can also run it manually from the Actions tab. Do not edit the generated index by hand.

The index contains `version: 1`, a `levels` list (`path`, byte `size`, and `sha256`), and an `invalid` list (`path` and `reason`). Only tracked JSON files are scanned; the index excludes itself. Invalid JSON/UTF-8, non-level files, symlinks, and files exceeding the basic validation limits are excluded and reported. This checks format and structure, not gameplay.

Run locally with Node.js 24:

```sh
node --test tests/build-levels-index.test.mjs
node scripts/build-levels-index.mjs
```

Consumers should read the index and level files from the same pinned Git commit and verify the listed hashes. Adding this index does not automatically enable incremental downloads in existing clients or mirrors.

### Uploading Levels

You can upload your levels via **Pull Request**.

Level posting rules:
1. Only levels playable in Gardendless is accepted. Any other files are NOT accepted. Levels that are not normally loaded in Gardendless is NOT accepted.
2. Uploaded levels shall NOT lag too much thus making them not playable on most devices. Nor can they be unable to be cleared without cheating.
3. Uploaded levels must be based on vanilla Gardendless. Levels requiring MODs or datapacks are not accepted.
4. Levels shall only be posted into a folder of a specific author. Level files shall contain author names.
5. Levels must be playable in any difficulties. Differences under different difficulties is optional, but if they DO exist, every difficulties should be different.

---

## How to Contribute

1. Fork this repository.
2. Add, modify or remove level JSON files.
3. Pull Request / Submit a Pull Request.
4. ⚠️Think twice before changing the name of your folders, or the game will forget all the levels in the folder.

---

## Level Format

Levels are JSON files. Refer to existing examples for the format.

---

### When Updates Happen

Level updates are synced automatically **every 30 minuites**. To see the latest levels, please **restart the game** after those times and open the **GitHub Level Window**. If the window was already opened before the sync, restarting the game is required to refresh the data.

---

## 中文

本仓库中的关卡会被 *PvZ2: Gardendless* 中的 **GitHub 关卡窗口** 获取。

### 仓库结构

**根目录中的关卡文件夹应以关卡作者名字命名。** `scripts/`、`tests/`、`.github/` 和 `levels-index.json` 是仓库维护文件，不属于关卡投稿。

每位作者必须把关卡（文件或子文件夹）**放进以自己名字命名的文件夹里**。**不要**把关卡文件直接放在根目录。
```
.
├── 作者A/
│ ├── level1.json
│ └── level2.json
├── 作者B/
│ ├── level1.json
│ └── 子文件夹/
│ └── level3.json
└── ...
```
### 自动关卡清单

每次推送到 `main` 后，GitHub Actions 的 **Generate levels index** 工作流会生成 `levels-index.json`，内容有变化才自动提交。维护者也可以在 Actions 页面手动运行。请勿手动修改生成的清单。

清单包含 `version: 1`、有效关卡列表 `levels`（`path`、字节数 `size`、`sha256`）以及无效文件列表 `invalid`（`path`、`reason`）。仅扫描 Git 已跟踪的 JSON，排除清单自身；无效 JSON/UTF-8、非关卡文件、符号链接以及超出基础校验限制的文件会被排除并记录原因。基础格式检查不代表游戏可玩性验证。

本地使用 Node.js 24 执行：

```sh
node --test tests/build-levels-index.test.mjs
node scripts/build-levels-index.mjs
```

读取方应从同一个固定 Git 提交获取清单和关卡，并核对清单哈希。增加此清单不会自动开启现有客户端或镜像的增量下载。

### 上传关卡

你可以通过 **Pull Request** 上传关卡。

关卡投稿须知：
1. 只能上传Gardendless关卡，不可上传关卡之外的文件，不可上传Gardendless无法正常运行的关卡。
2. 不可上传过于卡顿以至于大部分设备无法正常运行的关卡，关卡不可无解。
3. 关卡必须基于Gardendless原版，不可上传必须加载模组/数据包才能正常游玩的关卡。
4. 关卡只能上传至作者自己的文件夹内，不可上传至文件夹外，关卡文件内必须含作者署名。
5. 关卡必须在所有难度下可正常游玩，可以没有难度区分，但需要避免动态池只写一个难度不管其他难度的情况。

---

## 如何提交

1. Fork 本仓库；
2. 添加/修改/删除关卡 JSON 文件；
3. 提交 Pull Request；
4. ⚠️在更改文件夹名字前请郑重考虑，否则游戏将会遗忘文件夹内所有的关卡。

---

## 关卡格式

关卡为 JSON 文件，具体格式参考现有示例。

---

### 更新时机

关卡的更新是定时的，**每半小时**会自动同步一次。因此，请在这些时间点**之后**重启游戏，并打开 **GitHub 关卡窗口**，才能看到最新的关卡内容。如果在同步之前已经打开了窗口，需要重启游戏才能刷新数据。
