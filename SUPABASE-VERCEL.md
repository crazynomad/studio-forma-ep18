# Studio Forma：Supabase + Vercel

目标架构：Vercel 运行 Next.js 和 Payload 后台；Supabase Postgres 保存文章、草稿、版本及后台用户；Supabase Storage 保存图片。后台登录仍由 Payload 管理。

## 当前进度（2026-11-05）

- Vercel Hobby 项目已创建并关联：`crazynomads-projects/studio-forma-greentrain`。
- 目标域名已由 Vercel 确认：`studio-forma-greentrain.vercel.app`，尚未部署。
- 原本地数据库和图片保留；完整备份位于 `.local/backups/`，入口为 `.local/latest-backup.json`。
- 已恢复独立的本地迁移副本，CMS 表移入 `payload` schema，原数据库未修改。
- 迁移副本已更换默认后台密码、隐藏演示重置页并清理首页的演示登录信息；原 5 篇文章及发布/草稿状态保留。
- Supabase 项目创建、云端导入、图片上传、Vercel 部署及线上验收仍待完成。

本地演练验证：文章及历史版本的 5 张表逐行一致；新后台密码可登录，旧默认密码被拒绝；匿名用户看不到草稿及重置页；Supabase S3 模式可生成正确的媒体路径。`pnpm typecheck`、修改文件的 ESLint、生产构建均通过，本地 `/blog` 返回 200，`/preview/reset` 返回 404。

`.local/`、环境文件、备份和本地图片均排除出 Vercel 上传包。不要将任何密码或数据库备份提交到 Git。

## 云端环境变量

| 变量 | 配置 |
| --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | `Studio Forma` |
| `NEXT_PUBLIC_LANG` | `en` |
| `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SERVER_URL` | 最终 HTTPS 网站地址 |
| `DATABASE_URL` | Supabase pooler 连接串；迁移使用 session pooler，运行时可用 transaction pooler |
| `DATABASE_SCHEMA` | `payload`，不加入 Supabase Data API exposed schemas |
| `DATABASE_POOL_MAX` | `3`，每个函数实例的连接上限 |
| `PAYLOAD_SECRET` / `PREVIEW_SECRET` | 分别生成随机值；不得复用演示配置 |
| `STORAGE_PROVIDER` | `s3` |
| `S3_BUCKET` | 独立的公开图片 bucket |
| `S3_ENDPOINT` | Supabase 提供的 S3 endpoint |
| `S3_REGION` | Supabase 项目的实际区域 |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Storage S3 凭证，只放服务端环境变量 |
| `BUCKET_PREFIX` | `payload_cms` |
| `NEXT_PUBLIC_STORAGE_URL` | `https://<ref>.supabase.co/storage/v1/object/public/<bucket>` |

不启用 SMTP 时，重置密码邮件和表单邮件不会送达。SMTP 配置见 `.env.example`，不要将示例占位值上传到云端。

## 迁移与验收

1. 使用备份恢复到新的空数据库，再将 `public` schema 改名为 `payload`。只导出 `payload`，不覆盖 Supabase 的 `auth`、`storage`、`public` 等系统 schema。
2. 三个媒体集合的现有记录补上 `prefix` 和 `_objectkey` 字段。对象路径分别是 `payload_cms/media/`、`payload_cms/seo-media/`、`payload_cms/gallery-media/`；保留原文件名、衍生尺寸及关联 ID。
3. HTML 中的外链图片也下载、校验并上传到 `payload_cms/external/`，再更新迁移副本中的引用。
4. 为新项目导入前确认目标 `payload` schema 为空；按事务恢复，核对每张表行数、文章状态以及图片哈希。
5. 将敏感变量写入 Vercel 的 encrypted 环境变量，部署后验证首页、博客、图片、后台登录、草稿预览、发布及重新编辑。确认默认密码失效、匿名用户看不到草稿、`/preview/reset` 返回 404。

原模板的公开重置接口已停用；需要重置时，必须明确从本地执行管理命令。

## 免费方案边界

[Supabase Free](https://supabase.com/pricing) 当前含每项目 500 MB 数据库、1 GB Storage，免费项目存在闲置暂停机制。本次准备了 25 个 CMS 图片文件和 4 个 HTML 外链图片文件，共约 2.3 MB，适合先用免费额度体验。

[Vercel Hobby](https://vercel.com/docs/plans/hobby) 适合个人非商业用途。此流程不启用付费升级、额外数据库分支或付费插件。
