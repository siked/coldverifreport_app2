# UserEnf 实施用户模型文档

## 概述

UserEnf 是实施用户模型，用于管理系统中的实施人员。实施人员可以关联多个公司，并具有独立的登录、注册和权限控制能力。

本文档描述 UserEnf 的数据结构、后台 API 接口（包含实施人员管理、分类查看、任务查看和任务标签更新）、以及相关注意事项和文件位置。

## 数据模型

### UserEnf 接口

```typescript
export interface UserEnf {
  _id?: string;         // MongoDB 文档 ID
  username: string;     // 用户名（唯一）
  password: string;     // 加密后的密码
  companies: string[];  // 公司 _id 数组，关联公司表，可以多选
  createdAt?: Date;     // 创建时间
}
```

### 字段说明

- **\_id**: MongoDB 自动生成的文档 ID，字符串格式。
- **username**: 用户名，必填，唯一，用于登录。
- **password**: 密码，必填，使用 bcrypt 加密存储，至少 6 位。
- **companies**: 关联的公司 ID 数组，可以为空，支持多选。
- **createdAt**: 创建时间，自动生成。

## API 接口

### 1. 登录接口

**路径**: `POST /api/user-enf/login`

**说明**:  
实施用户登录成功后，返回一个**永久 token（tokey）**，用于访问 `/api/user-enf/` 前缀下的接口。该 token **不设置过期时间**。

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

**字段说明**:
- **token**: 实施用户登录成功后返回的永久 token（tokey），用于后续接口的认证。

**错误响应**:
- `400`: 用户名或密码为空。
- `401`: 用户名或密码错误。
- `500`: 服务器错误。

---

### 2. 注册接口

**路径**: `POST /api/user-enf/register`

**说明**:  
用于创建新的实施用户账号。

**请求体**:
```json
{
  "username": "string",
  "password": "string",
  "companies": ["string"]  // 可选，公司 ID 数组
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

**错误响应**:
- `400`: 用户名或密码为空，或密码长度不足 6 位，或用户名已存在。
- `500`: 服务器错误。

---

### 3. 获取实施人员列表

**路径**: `GET /api/user-enf`

**说明**:  
获取所有实施人员列表，主要用于后台管理界面。

**响应**:
```json
{
  "userEnfs": [
    {
      "_id": "string",
      "username": "string",
      "companies": ["string"],
      "companiesInfo": [
        {
          "id": "string",
          "username": "string"
        }
      ],
      "createdAt": "string"
    }
  ]
}
```

**权限**: 需要登录（使用平台主账号权限控制）。

---

### 4. 创建实施人员

**路径**: `POST /api/user-enf`

**说明**:  
由后台管理员创建实施人员账号。

**请求体**:
```json
{
  "username": "string",
  "password": "string",
  "companies": ["string"]  // 可选
}
```

**响应**:
```json
{
  "userEnf": {
    "_id": "string",
    "username": "string",
    "companies": ["string"],
    "companiesInfo": [
      {
        "id": "string",
        "username": "string"
      }
    ]
  }
}
```

**权限**: 需要登录（管理员权限）。

---

### 5. 更新实施人员

**路径**: `PUT /api/user-enf`

**说明**:  
更新实施人员的基本信息和关联公司。

**请求体**:
```json
{
  "id": "string",
  "username": "string",      // 可选
  "password": "string",      // 可选，留空则不修改
  "companies": ["string"]    // 可选
}
```

**响应**:
```json
{
  "userEnf": {
    "_id": "string",
    "username": "string",
    "companies": ["string"],
    "companiesInfo": [
      {
        "id": "string",
        "username": "string"
      }
    ]
  }
}
```

**注意**:  
- 如果 `password` 为空字符串，则不更新密码。  
- 如果新的 `username` 已存在（且不是当前用户），返回错误。

**权限**: 需要登录（管理员权限）。

---

### 6. 删除实施人员

**路径**: `DELETE /api/user-enf?id={id}`

**说明**:  
删除指定实施人员。

**响应**:
```json
{
  "success": true
}
```

**权限**: 需要登录（管理员权限）。

---

### 7. 分类管理查看接口（实施人员）

> 对应提示任务第 2 条：在 `/api/user-enf/` 下新增分类管理查看接口。

**路径**: `GET /api/user-enf/categories`

**说明**:  
只允许查看**绑定实施人员包含当前登录实施用户（user-enf id）**的任务类型分类；在返回数据中增加分类路径，一直统计到公司类型分类（`company`）为止，例如：`"1/2/3"`。

**请求头**:
```http
Authorization: Bearer <token>
```

- `token`: 通过 `/api/user-enf/login` 获取的实施用户永久 token（tokey）。

**请求参数**: 无。

**响应**:
```json
{
  "categories": [
    {
      "_id": "string",
      "name": "string",
      "type": "string",          // 分类类型，例如 company、taskType 等
      "parentId": "string|null", // 上级分类 ID，最顶级公司分类为 null
      "pathIds": ["string"],     // 从公司分类到当前分类的 ID 列表
      "pathNames": ["string"],   // 从公司分类到当前分类的名称列表
      "path": "1/2/3"            // 以 ID 组成的路径示例
    }
  ]
}
```

**字段说明**:
- **categories**: 当前实施用户有权限查看的任务类型分类列表。
- **pathIds**: 按层级从公司分类开始到当前分类的 ID 数组。
- **pathNames**: 与 `pathIds` 一一对应的名称数组，便于前端展示完整路径。
- **path**: 使用 `/` 拼接的 ID 路径字符串，如 `"companyId/taskTypeId/subTypeId"`。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅返回绑定实施人员列表中包含当前 user-enf id 的任务类型分类。

---

### 8. 任务管理查看接口（实施人员）

> 对应提示任务第 3 条：在 `/api/user-enf/` 下新增任务管理查看接口。

**路径**: `GET /api/user-enf/tasks`

**说明**:  
通过**分类 ID** 获取该分类下的任务列表，只返回必要字段：`_id`、任务编号、任务名称、模版名称、任务标签列表。

**请求头**:
```http
Authorization: Bearer <token>
```

**请求参数（Query）**:
```text
categoryId: string   // 必填，任务类型分类的 ID
```

**响应**:
```json
{
  "tasks": [
    {
      "_id": "string",
      "taskNo": "string",        // 任务编号
      "taskName": "string",      // 任务名称
      "templateName": "string",  // 模版名称
      "tags": ["string"],        // 任务标签列表（仅返回 hidden=true 的标签）
      "deviceSnList": [          // 设备 SN 列表
        {
          "deviceId": "string",  // 设备 ID，例如 "001"
          "deviceSn": "string"   // 设备 SN，例如 "20261234567890"
        }
      ]
    }
  ]
}
```

**字段说明**:
- **taskNo**: 任务编号。
- **taskName**: 任务名称。
- **templateName**: 任务使用的模板名称。
- **tags**: 当前任务所绑定的标签数组（仅包含 `hidden = true` 的标签，用于实施端展示）。
- **deviceSnList**: 设备 SN 列表，对应任务模型中的 `deviceSnList?: { deviceId: string; deviceSn: string }[]` 字段，例如：`[{ "deviceId": "001", "deviceSn": "20261234567890" }]`。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅返回当前实施用户**有权限分类**下的任务（分类本身需满足第 7 节接口的权限约束）。

---

### 9. 任务标签更新接口（实施人员）

> 对应提示任务第 4 条：在 `/api/user-enf/` 下新增任务标签更新接口。

#### 9.1 获取任务标签和设备 SN 列表

**路径**: `GET /api/user-enf/task-tags`

**说明**:  
获取指定任务的标签列表和设备 SN 列表。

**请求头**:
```http
Authorization: Bearer <token>
```

**请求参数（Query）**:
```text
taskId: string   // 必填，任务 ID
```

**响应**:
```json
{
  "success": true,
  "task": {
    "_id": "string",
    "taskNo": "string",
    "taskName": "string",
    "templateName": "string",
    "tags": ["string"],
    "deviceSnList": [
      {
        "deviceId": "string",
        "deviceSn": "string"
      }
    ]
  }
}
```

**错误响应**:
- `400`: 参数缺失或格式错误（如 `taskId` 为空）。
- `401`: 未登录或 token 无效。
- `403`: 当前实施用户无权限访问该任务（不在有权限分类下）。
- `404`: 任务不存在。
- `500`: 服务器错误。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅允许获取当前实施用户**有权限分类**下的任务标签和设备 SN 列表。

---

#### 9.2 更新任务标签和设备 SN 列表

**路径**: `PUT /api/user-enf/task-tags`

**说明**:  
用于更新指定任务的标签列表和设备 SN 列表。

**请求头**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "taskId": "string",     // 必填，任务 ID
  "tags": ["string"],     // 必填，新的任务标签列表
  "deviceSnList": [      // 可选，设备 SN 列表
    {
      "deviceId": "string",
      "deviceSn": "string"
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "task": {
    "_id": "string",
    "taskNo": "string",
    "taskName": "string",
    "templateName": "string",
    "tags": ["string"],
    "deviceSnList": [
      {
        "deviceId": "string",
        "deviceSn": "string"
      }
    ]
  }
}
```

**字段说明**:
- **taskId**: 任务 ID，必填。
- **tags**: 任务标签列表，必填。本接口采用合并模式，只更新标签的 `value` 字段，不会覆盖其他字段（如 `hidden`、`description` 等）。
- **deviceSnList**: 设备 SN 列表，可选。如果提供，将完全替换原有的设备 SN 列表。每个元素必须包含 `deviceId`（字符串）和 `deviceSn`（字符串）字段。

**错误响应**:
- `400`: 参数缺失或格式错误（如 `taskId` 为空、`tags` 不是数组、`deviceSnList` 格式不正确等）。
- `401`: 未登录或 token 无效。
- `403`: 当前实施用户无权限操作该任务（不在有权限分类下）。
- `404`: 任务不存在。
- `500`: 服务器错误。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅允许更新当前实施用户**有权限分类**下的任务标签和设备 SN 列表。

---

### 10. 图片上传接口（实施人员）

**路径**: `POST /api/user-enf/upload/image`

**说明**:  
实施用户使用自己的永久 token，将图片上传到七牛云，接口会自动完成图片基础校验与压缩，并返回图片的公网访问地址。

**请求头**:
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

- `token`: 通过 `/api/user-enf/login` 获取的实施用户永久 token（tokey）。

**请求体（FormData）**:
```text
file: File   // 必填，图片文件，字段名固定为 file
```

**校验规则**:
- 仅支持图片类型：`image/jpeg`、`image/jpg`、`image/png`、`image/gif`、`image/webp`。  
- 单个文件大小不能超过 **10MB**。  
- 服务端会对图片进行压缩（最大约 500KB，部分格式如 GIF 直接跳过压缩），然后再上传到七牛云。  
- 图片在七牛上的路径形如：`images/{userEnfId}/{timestamp}-{uuid}.ext`。

**响应**:
```json
{
  "success": true,
  "url": "https://your-qiniu-domain.com/images/xxx/xxx.jpg"
}
```

**错误响应**:
- `400`: 未上传文件、文件类型不支持、文件过大等。  
- `401`: 未登录或 token 无效。  
- `500`: 服务器错误（如七牛上传失败等）。  

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。  
- 上传的文件会挂在当前实施用户（user-enf）的名下，用于路径归类。  

---

## 模型函数

### createUserEnf

创建新的实施用户。

```typescript
createUserEnf(
  username: string,
  password: string,
  companies: string[] = []
): Promise<UserEnf>
```

**参数**:
- `username`: 用户名。
- `password`: 明文密码（会自动加密）。
- `companies`: 关联的公司 ID 数组，默认为空数组。

**返回**: 创建的用户对象（包含 `_id`）。  
**异常**: 如果用户名已存在，抛出错误。

---

### findUserEnfByUsername

根据用户名查找实施用户。

```typescript
findUserEnfByUsername(username: string): Promise<UserEnf | null>
```

**参数**:
- `username`: 用户名。

**返回**: 用户对象或 `null`。

---

### verifyUserEnfPassword

验证密码是否正确。

```typescript
verifyUserEnfPassword(userEnf: UserEnf, password: string): Promise<boolean>
```

**参数**:
- `userEnf`: 用户对象。
- `password`: 明文密码。

**返回**: 密码是否正确。

---

### findUserEnfById

根据 ID 查找实施用户。

```typescript
findUserEnfById(userEnfId: string): Promise<UserEnf | null>
```

**参数**:
- `userEnfId`: 用户 ID。

**返回**: 用户对象或 `null`。

---

### getAllUserEnfs

获取所有实施用户列表。

```typescript
getAllUserEnfs(): Promise<UserEnf[]>
```

**返回**: 用户数组，按创建时间倒序排列。

---

### updateUserEnf

更新实施用户信息。

```typescript
updateUserEnf(
  userEnfId: string,
  updates: {
    username?: string;
    password?: string;
    companies?: string[];
  }
): Promise<boolean>
```

**参数**:
- `userEnfId`: 用户 ID。
- `updates`: 要更新的字段（可选）。

**返回**: 是否更新成功。  
**异常**: 如果新用户名已存在，抛出错误。

---

### deleteUserEnf

删除实施用户。

```typescript
deleteUserEnf(userEnfId: string): Promise<boolean>
```

**参数**:
- `userEnfId`: 用户 ID。

**返回**: 是否删除成功。

---

## 数据库集合

- **集合名**: `userEnfs`  
- **索引**: 建议在 `username` 字段上创建唯一索引。

---

## 前端页面

### 实施人员管理页面

**路径**: `/user-enf`

**功能**:
- 显示所有实施人员列表。
- 添加新的实施人员。
- 编辑现有实施人员。
- 删除实施人员。
- 显示每个实施人员关联的公司。

**访问**: 通过顶部导航栏的「实施人员」菜单项访问。

---

## 使用示例

### 创建实施用户

```typescript
import { createUserEnf } from '@/lib/models/UserEnf';

const userEnf = await createUserEnf(
  'zhangsan',
  'password123',
  ['company_id_1', 'company_id_2']
);
```

### 登录验证

```typescript
import { findUserEnfByUsername, verifyUserEnfPassword } from '@/lib/models/UserEnf';

const userEnf = await findUserEnfByUsername('zhangsan');
if (userEnf) {
  const isValid = await verifyUserEnfPassword(userEnf, 'password123');
  if (isValid) {
    // 登录成功
  }
}
```

### 更新用户信息

```typescript
import { updateUserEnf } from '@/lib/models/UserEnf';

await updateUserEnf('user_id', {
  username: 'new_username',
  companies: ['company_id_1', 'company_id_3']
});
```

---

## 注意事项

1. **密码安全**: 所有密码都使用 bcrypt 加密存储，加密强度为 10。  
2. **用户名唯一性**: 系统会检查用户名是否已存在，确保唯一性。  
3. **公司关联**: 实施人员可以关联多个公司，通过 `companies` 数组存储公司 ID。  
4. **权限控制**:  
   - `/api/user-enf` 相关接口通常由后台管理员使用，需平台登录权限。  
   - `/api/user-enf/` 下的接口通过实施用户 token 进行认证。  
5. **数据验证**:  
   - 用户名和密码不能为空。  
   - 密码长度至少为 6 位。  
   - 更新时，如果密码为空字符串，则不更新密码字段。  
6. **实施用户 token（tokey）**:  
   - `/api/user-enf/login` 登录成功后返回的 token 永不过期。  
   - `/api/user-enf/` 下的接口通过请求头 `Authorization: Bearer <token>` 进行认证和权限校验。  
7. **分类与任务权限**:  
   - 分类查看、任务查看与任务标签更新接口，均只对与当前实施用户绑定的分类、任务生效。  

---

## 相关文件

- 模型文件: `lib/models/UserEnf.ts`  
- 登录 API: `app/api/user-enf/login/route.ts`  
- 注册 API: `app/api/user-enf/register/route.ts`  
- 管理 API: `app/api/user-enf/route.ts`  
- 实施人员管理页面: `app/user-enf/page.tsx`  
- 导航菜单: `components/Navbar.tsx`  

