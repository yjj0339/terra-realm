# 部署说明 · Terra Realm

纯静态站点（`index.html` + `css/` + `js/` + `preview/`），零构建、零外部依赖，直接由 GitHub Pages 托管。

- 仓库：https://github.com/yjj0339/terra-realm
- 在线地址：https://yjj0339.github.io/terra-realm/

## 仓库配置

| 项 | 值 |
| --- | --- |
| 账号 | yjj0339 |
| 仓库名 | terra-realm |
| 可见性 | public |
| 默认分支 | main |
| Pages 来源 | `main` 分支根目录（legacy 分支构建） |
| Jekyll | 已用根目录 `.nojekyll` 关闭预处理，`js/`、`css/` 原样发布 |

`.nojekyll` 是必需的：否则 GitHub Pages 会跑 Jekyll，下划线开头的目录与部分文件名可能被忽略，静态资源路径也可能被改写。

## 首次部署（已完成，留档备查）

```powershell
cd "D:\DSH AI\terraria"
git init -b main
git add -A
git status --short          # 确认没有 _v/ _verify/ _final/ _qa/ .tools/ node_modules/
git commit -m "Terra Realm: static HTML5 sandbox game"
gh repo create terra-realm --public --source . --remote origin --push
gh api -X POST repos/yjj0339/terra-realm/pages -f "source[branch]=main" -f "source[path]=/"
```

## 日常更新流程

改完游戏文件后，只要三步：

```powershell
cd "D:\DSH AI\terraria"
git add -A
git commit -m "描述这次改动"
git push origin main
```

推送到 `main` 后 GitHub Pages 自动重新构建。实测时间线：

| 阶段 | 耗时 |
| --- | --- |
| push 完成 → Pages 开始构建 | 5–15 秒 |
| 构建中（`status=building`）→ `status=built` | 约 30–40 秒 |
| `built` → 新内容真实可访问 | 再等 10–30 秒 |

`curl` 和浏览器返回的响应头是 `Cache-Control: max-age=600`，即边缘节点和浏览器都会缓存 **10 分钟**。所以刚推完如果看到旧内容，先确认构建状态已是 `built`，再用无痕窗口或 `Ctrl + F5` 强刷；普通刷新可能仍在吃旧缓存。

想确认线上到底是哪一版，直接比对 JS 大小或 ETag，比看页面可靠：

```powershell
curl.exe -sSI https://yjj0339.github.io/terra-realm/js/game.js | Select-String "Content-Length|ETag"
```

## 验证

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" https://yjj0339.github.io/terra-realm/
curl.exe -s -o NUL -w "%{http_code}`n" https://yjj0339.github.io/terra-realm/js/game.js
```

两条都返回 `200` 即视为部署正常。若 Pages 构建失败，用下面命令看最近一次构建状态：

```powershell
gh api repos/yjj0339/terra-realm/pages/builds/latest --jq '.status + " / " + (.error.message // "no error")'
```

## 常见问题

- **页面 404**：多半是 push 后构建还没跑完，等待 1 分钟再试，或检查 Pages 设置里的分支是否为 `main` / 根目录。
- **白屏但 200**：打开浏览器控制台看 `js/` 下哪个脚本 404，通常是文件没 `git add` 成功或大小写不一致（Linux 侧大小写敏感）。
- **改了代码线上没变**：`Ctrl + F5` 强刷；GitHub Pages CDN 有缓存，实在不行等 2 分钟。
