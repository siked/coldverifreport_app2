# APP版本管理接口文档

## 概述

APP版本管理功能用于管理系统中的APP版本信息，包括版本号、版本描述、下载地址和更新时间。提供完整的CRUD操作接口，以及一个公开的获取最新版本接口。

## 数据模型

### AppVersion 接口

```typescript
export interface AppVersion {
  _id?: string;              // MongoDB 文档 ID
  versionName: string;        // 版本号，如 "v1.0.1"
  versionDesc: string;         // 版本描述
  downloadUrl: string;        // 下载地址
  updateTime: string;         // 更新时间，格式：YYYY-MM-DD HH:mm:ss
  createdAt?: Date;           // 创建时间
  updatedAt?: Date;           // 更新时间
}
```

### 字段说明

- **\_id**: MongoDB 自动生成的文档 ID，字符串格式。
- **versionName**: 版本号，必填，例如 "v1.0.1"。
- **versionDesc**: 版本描述，必填，例如 "功能优化"。
- **downloadUrl**: 下载地址，必填，完整的URL，例如 "http://111.xx.xx.xx:8000/static/release/android_myapp.apk"。
- **updateTime**: 更新时间，**自动生成**，格式为 "YYYY-MM-DD HH:mm:ss"，在创建或更新版本时自动设置为当前时间，无需手动传入。
- **createdAt**: 创建时间，自动生成。
- **updatedAt**: 更新时间，自动生成。

## API 接口

### 获取最新版本（公开接口）

```bash
curl -X GET "http://localhost:3000/api/app-versions/latest"
```

### JavaScript 示例

```javascript
// 获取最新版本（公开接口）
async function getLatestVersion() {
  try {
    const response = await fetch('/api/app-versions/latest');
    if (response.ok) {
      const data = await response.json();
      console.log('最新版本:', data);
      return data;
    } else {
      console.error('获取最新版本失败');
    }
  } catch (error) {
    console.error('网络错误:', error);
  }
}

```

---
