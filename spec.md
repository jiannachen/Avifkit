# Avifkit Landing Page SEO Spec

> 供 Claude Code 生成新工具页时参考。Avifkit 是纯静态客户端图片格式转换工具，无 AI 功能，无服务端处理。

---

## 一、产品定位

- **核心卖点**：客户端本地处理，文件不上传服务器，100% 隐私
- **技术栈**：静态页面，WebAssembly + Canvas API，无后端
- **用户意图**：transactional（直接来用工具），不是 informational
- **差异化**：隐私安全 + 无限制（无文件大小限制、无水印、无注册）

---

## 二、关键词策略

### 页面与关键词对应关系
每个工具页对应一个转换方向，不混用：

| 页面 | 主关键词 | 典型长尾变体 |
|------|----------|-------------|
| /avif-to-jpg | avif to jpg | convert avif to jpeg, avif to jpg online free, open avif as jpg |
| /avif-to-png | avif to png | avif to png converter, avif transparent to png, avif to png online |
| /avif-to-webp | avif to webp | convert avif to webp, avif to webp free, avif webp converter |
| / (首页) | avif converter | avif file converter, convert avif online, avif to jpg png webp |

### 关键词使用原则
- 主关键词出现位置：H1、第一段、meta title、meta description
- 正文使用变体，不刻意重复主词
- 同一个表达不超过 3 次
- **格式转换类页面的核心长尾变体方向**：
  - 平台场景：on Windows / on Mac / on iPhone / on Android
  - 动作变体：convert / open / view / change / transform
  - 修饰变体：free / online / without software / in browser / no upload
  - 问题变体：how to open avif / why can't I open avif / what is avif

---

## 三、内容结构

### H1
- 直接描述转换方向
- ✅ `Convert AVIF to JPG Online Free`
- ❌ `AVIF to JPG Converter Tool`

### 第一段
- 80-120 字
- 覆盖：转换方向 + 核心卖点（隐私/速度/免费）+ 无需注册
- 自然带入 1-2 个长尾变体

### How It Works（必须有）
- 3 步：Upload → Select Format → Download
- 强调客户端处理：`Your files never leave your browser`
- 覆盖 how-to 类搜索词

### 核心卖点模块（必须有）
必须覆盖以下三个差异化点，每个配具体说明：
1. **Privacy**：客户端处理，文件不上传，举例说明技术原理
2. **Speed**：零上传时间，WebAssembly 加速
3. **No restrictions**：无文件大小限制、无水印、无注册

### 平台兼容性说明（推荐）
格式转换工具用户经常搜索平台相关问题，加一段覆盖：
- Windows 10/11 如何打开 AVIF
- Mac 是否原生支持
- iPhone/iOS 兼容性
- 各浏览器支持情况

这段内容天然覆盖大量长尾词，技术上零成本。

### FAQ
- **最少 5 个，建议 8 个**
- 问题类型覆盖：
  - 格式对比类（Is AVIF better than JPG/WebP/PNG?）
  - 平台兼容类（How to open AVIF on Windows/iPhone?）
  - 隐私安全类（Is it safe to convert private photos?）
  - 质量损失类（Does converting lose quality?）
  - 透明度类（Does it support transparency/alpha channel?）
  - 使用限制类（Is there a file size limit?）
  - 速度类（How fast is the conversion?）
  - 格式说明类（What is AVIF format?）

---

## 四、Schema 规范

### 必须包含
1. **WebApplication** — 每个工具页必须
2. **FAQPage** — 所有落地页必须
3. **BreadcrumbList** — 所有落地页必须

### WebApplication 写法

```json
{
  "@type": "WebApplication",
  "name": "AVIF to JPG Converter",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "description": "Convert AVIF to JPG online free. Client-side processing, files never uploaded.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### FAQPage 写法

```javascript
// ✅ 正确：动态 map，全量输出
"mainEntity": faqItems.map((faq) => ({
  "@type": "Question",
  "name": faq.question,
  "acceptedAnswer": {
    "@type": "Answer",
    "text": faq.answer
  }
}))

// ❌ 错误：slice 截断或硬编码数组索引
```

### aggregateRating
- **禁止使用假数据**
- 没有真实用户评论系统前不加

### SoftwareApplication 可选替代
静态工具页也可以用 `SoftwareApplication` 替代 `WebApplication`，两者 Google 都接受，保持一致即可。

---

## 五、多语言规范

### 当前支持语言
EN / JA / ES / FR（见首页语言切换）

### canonical URL

```javascript
const canonicalUrl = locale === 'en'
  ? `${baseUrl}/[slug]`
  : `${baseUrl}/${locale}/[slug]`;
```

### hreflang alternates

```javascript
alternates: {
  canonical: canonicalUrl,
  languages: {
    'x-default': `${baseUrl}/[slug]`,
    'en': `${baseUrl}/[slug]`,
    'ja': `${baseUrl}/ja/[slug]`,
    'es': `${baseUrl}/es/[slug]`,
    'fr': `${baseUrl}/fr/[slug]`,
  }
}
```

---

## 六、Meta 规范

### Title 格式
```
[源格式] to [目标格式] Converter — Free, Online, No Upload | Avifkit
```
示例：`AVIF to JPG Converter — Free, Online, No Upload | Avifkit`

### Description
- 120-155 字符
- 必须包含：转换方向 + 隐私卖点 + 免费/无限制
- 示例：`Convert AVIF to JPG free in your browser. No file uploads, no size limits, no watermarks. 100% private client-side processing.`

---

## 七、Avifkit 特有的内容原则

### 强调客户端处理
每个页面必须在显眼位置说明文件不离开用户设备，这是最强差异化点：
- ✅ `Your files are converted locally in your browser — never uploaded to any server`
- 在 How It Works、FAQ、卖点模块至少各出现一次

### 不要过度技术化
用户不懂 WebAssembly，说清楚结果就好：
- ✅ `Converts instantly in your browser`
- ❌ `Powered by WebAssembly Canvas API pipeline`

### 格式科普内容要有但不要喧宾夺主
"What is AVIF" 类内容有助于覆盖信息类长尾词，但篇幅控制在一段以内，用户来这里是为了转换文件。

---

## 八、禁止事项

| 禁止 | 原因 |
|------|------|
| FAQ schema 用 slice 或硬编码数量 | Google 读不到被截断的内容 |
| aggregateRating 使用假数据 | Google 惩罚风险 |
| 声称支持实际不支持的格式 | 用户体验差，跳出率高影响排名 |
| 正文重复主关键词超过 3 次 | Google 判定为关键词堆砌 |
| 多语言页面缺少 hreflang | Google 无法识别语言版本关系 |
| 夸大隐私承诺（如"military-grade"等） | 信任风险 |

---

## 九、新工具页 Prompt 模板

```
参考 AVIFKIT_SPEC.md，为 [源格式] to [目标格式] 创建转换工具落地页。

主关键词: [avif to xxx]
支持语言: en / ja / es / fr
目标格式特性: [例如：支持透明度 / 有损压缩 / 更广泛兼容性]

要求:
- H1 直接描述转换方向
- 卖点模块覆盖隐私、速度、无限制三个点
- 加平台兼容性说明段落（Windows/Mac/iPhone）
- FAQ 至少 8 个，动态 map 进 schema
- 不加 aggregateRating
- hreflang 包含 en/ja/es/fr
```