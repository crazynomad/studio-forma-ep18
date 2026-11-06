# Studio Forma：Supabase + Vercel

目标架构：Vercel 运行 Next.js 和 Payload 后台；Supabase Postgres 保存文章、草稿、版本及后台用户；Supabase Storage 保存图片。后台登录仍由 Payload 管理。

## 已完成的云端验收（2026-11-06）

[演示网站](https://studio-forma-greentrain.vercel.app) 已上线。Vercel Hobby + Supabase Free，个人学习演示；原本地实例保留。

- Vercel、Supabase 官方 MCP 均已实际调用。Vercel Git 推送自动构建成功，另由 MCP 再部署一次检验持久化。
- 独立 `payload` schema 共 80 张表，原 5 篇文章保留（4 已发布、1 草稿）；29 张演示图片已迁到 Supabase Storage，逐个校验一致。
- 15 项云端检查通过，覆盖前台、后台登录、错误密码、匿名隔离、存草稿、修改、发布及上传图片。认证 cookie 为 HttpOnly、Secure、SameSite=Lax。
- 新建草稿和图片后重新部署，再核对两者仍在且草稿仍私有；仅清理此次临时测试内容，原 5 篇文章保留。
- 未配置 SMTP；邮件发送、真实手机／跨网络尚未验证。该记录不是从全新空白项目自动生成同一套内容的验证。

## 跟做导航：准备 → 连接 → 部署 → 验收

1. **准备自己的源码和内容。** Fork / clone 本仓库，使用 Node 24 与锁文件安装依赖。此流程针对已有本地 Payload 网站上线；先备份自己的数据库和图片。源码库不包含演示后台账号、数据库备份或这 5 篇文章的私有数据库快照。不要对已有数据运行 `pnpm seed` / `pnpm reset`；从零建站需要另做新库初始化与内容创建。
2. **本人连接账号和免费服务。** 用 GitHub 登录 Vercel、授权自己的仓库；通过官方 Supabase Marketplace 集成创建 Free 项目、接受协议，只连 Production、保留 Sensitive、不启用收费数据库分支。本人授权 `https://mcp.vercel.com` 与 `https://mcp.supabase.com/mcp?project_ref=<自己的项目>&features=database,debugging,storage,docs`。Vercel 可能另要求所属团队授权。
3. **Agent 配置和迁移。** 使用下方变量名称表；官方集成自动注入数据库和 Storage 服务端凭据，不读取或复制其明文。独立生成 Payload / Preview 随机密钥，程序直接写平台。按迁移段落只导入自己的空 `payload` schema，保持对 anon / authenticated 不开放，并核对图片关联。Agent 运行类型检查、提交并推送，等待 Vercel 的实际部署状态 Ready。
4. **打开自己的网址验收。** 后台登录、存草稿、改内容、发布、上传图片；无痕窗口只见已发布内容，不能创建管理员或访问重置入口。再次部署后验证文章与上传图片仍在。本人补真实手机／不同网络检查。

可给 Agent 的任务：

```text
帮我把这个已有的 Payload 网站迁到我确认的 Vercel + Supabase Free 项目，优先使用官方 MCP。先核对账号、目标仓库和空数据库，保留原实例和备份。
凭据留在平台官方集成里，不读取、打印、截图或提交真实值。私有 CMS 表与公开图片分开，不能暴露草稿和后台身份。遇到收费项停下说明，不升级。
按照本文件核对 Node、数据库 CA、变量和 Storage，执行迁移后用 Git 部署。验证后台编辑发布、匿名权限及重部署持久化，给我网址和未验证项。
```

## 云端环境变量

| 变量 | 配置 |
| --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | `Studio Forma` |
| `NEXT_PUBLIC_LANG` | `en` |
| `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SERVER_URL` | 最终 HTTPS 网站地址 |
| `DATABASE_URL` / `POSTGRES_URL` | 显式 DATABASE_URL 优先；官方 Vercel 集成的 POSTGRES_URL 可直接用于服务端。迁移使用 session pooler，运行时连接方式需按实际配置核对 |
| `DATABASE_SCHEMA` | `payload`，不加入 Supabase Data API exposed schemas |
| `DATABASE_POOL_MAX` | `3`，每个函数实例的连接上限 |
| `PAYLOAD_SECRET` / `PREVIEW_SECRET` | 分别生成随机值；不得复用演示配置 |
| `STORAGE_PROVIDER` | `supabase`，复用官方集成注入的服务端变量 |
| `SUPABASE_STORAGE_BUCKET` | `studio-media`，专用于公开演示图片 |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | 官方 Marketplace 集成自动注入；只由服务端使用，不复制给 Agent |
| `BUCKET_PREFIX` | `payload_cms` |
| `NEXT_PUBLIC_STORAGE_URL` | `https://<ref>.supabase.co/storage/v1/object/public/<bucket>` |

不启用 SMTP 时，重置密码邮件和表单邮件不会送达。SMTP 配置见 `.env.example`，不要将示例占位值上传到云端。

## 数据库证书

官方集成注入的 Postgres URL 使用 TLS，但 Node 不自动信任 Supabase 的私有 CA。`src/lib/core/postgres-pool.ts` 为官方 Supabase 主机加载公开 CA，并保持证书链和主机名校验。证书来自项目 Database Settings 的 Download certificate，指纹 `807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa`。不要用 `rejectUnauthorized: false` 或 `NODE_TLS_REJECT_UNAUTHORIZED=0` 跳过验证。

## 图片初始化

`deployment-media/` 仅包含这套演示网站使用的 29 张公开展示图片及校验清单，不含数据库备份或账号。构建前 `scripts/bootstrap-storage.mjs` 使用平台注入的密钥创建图片 bucket 并上传；遇到已存在的对象跳过，不覆盖后台改过的文件，也不改已有私有 bucket 的权限。后台新上传图片由 Payload 的服务端适配器写入 Supabase Storage。原 S3 / Vercel Blob 接口仍可选。

## 迁移与验收

1. 使用备份恢复到新的空数据库，再将 `public` schema 改名为 `payload`。只导出 `payload`，不覆盖 Supabase 的 `auth`、`storage`、`public` 等系统 schema。
2. 三个媒体集合的现有记录补上 `prefix` 和 `_objectkey` 字段。对象路径分别是 `payload_cms/media/`、`payload_cms/seo-media/`、`payload_cms/gallery-media/`；保留原文件名、衍生尺寸及关联 ID。
3. HTML 中的外链图片也下载、校验并上传到 `payload_cms/external/`，再更新迁移副本中的引用。
4. 为新项目导入前确认目标 `payload` schema 为空；按事务恢复，核对每张表行数、文章状态以及图片哈希。
5. 将应用敏感变量写入 Vercel 的 Sensitive 环境变量，数据库／Storage 凭据优先由官方集成注入，部署后验证首页、博客、图片、后台登录、草稿预览、发布及重新编辑。确认默认密码失效、匿名用户看不到草稿、`/preview/reset` 返回 404。

原模板的公开重置接口已停用；需要重置时，必须明确从本地执行管理命令。

## 免费方案边界

[Supabase Free](https://supabase.com/pricing) 当前含每项目 500 MB 数据库、1 GB Storage，免费项目存在闲置暂停机制。本次准备了 25 个 CMS 图片文件和 4 个 HTML 外链图片文件，共约 2.3 MB，适合先用免费额度体验。

[Vercel Hobby](https://vercel.com/docs/plans/hobby) 适合个人非商业用途。此流程不启用付费升级、额外数据库分支或付费插件。
