# Studio Forma · EP18 上线演示版

用于绿皮火车 EP18 的个人学习演示：Next.js + Payload CMS，目标组合为 Vercel Hobby + Supabase Free。

来源：[buildlabs-io/payload-cms](https://github.com/buildlabs-io/payload-cms)，保留原 MIT 许可。基于节目本地修订 `b02d1ed744dcfdd36b8970862257d9309a67f7cf`，增加 Supabase 集成变量 `POSTGRES_URL` 的服务端兼容。

## 当前验证状态

**2026-11-06 已完成官方 MCP + Git 自动部署，并通过 15 项云端业务检查。** [查看演示网站](https://studio-forma-greentrain.vercel.app)。文章、草稿和新上传图片在重新部署后仍保留，匿名用户不能读草稿或创建管理员。完整条件和步骤见 [部署说明](SUPABASE-VERCEL.md)。

Vercel Hobby 只用于符合条件的个人非商业演示，不能据此承诺工作室经营永久免费。免费资源、用途与闲置规则以平台当前计划为准。

## 准备

需要 Node.js 24、pnpm 10。

```bash
pnpm install --frozen-lockfile
pnpm typecheck
```

配置名称与占位说明见 `.env.example`，真实值在自己的运行环境设置。Supabase 官方 Vercel 集成提供 `POSTGRES_URL`，本版可直接使用，无需把数据库密码复制到聊天。额外的 Payload、预览和图片存储配置按部署说明单独处理。

已有文章和图片先备份、在副本迁移；不要对已有数据运行 `pnpm seed` 或 `pnpm reset`。公网重置入口已关闭；生产后台不使用上游默认演示密码。注册、授权、敏感值输入和最终设备检查由本人完成。

上游演示站、源码和本地验证不是本仓库的云端上线证明。项目不包含原本地环境文件、数据库、账号凭据或制作素材。
