## API 接口

### 登录接口

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

### 分类管理查看接口（实施人员）

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

---

### 任务管理查看接口（实施人员）

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
      "tags": ["string"]         // 任务标签列表
    }
  ]
}
```

**字段说明**:
- **taskNo**: 任务编号。
- **taskName**: 任务名称。
- **templateName**: 任务使用的模板名称。
- **tags**: 当前任务所绑定的标签数组。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅返回当前实施用户**有权限分类**下的任务（分类本身需满足第 7 节接口的权限约束）。

---

### 9. 任务标签更新接口（实施人员）

> 对应提示任务第 4 条：在 `/api/user-enf/` 下新增任务标签更新接口。

**路径**: `PUT /api/user-enf/task-tags`

**说明**:  
用于更新指定任务的标签列表。

**请求头**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "taskId": "string",     // 必填，任务 ID
  "tags": ["string"]      // 必填，新的任务标签列表
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
    "tags": ["string"]
  }
}
```

**错误响应**:
- `400`: 参数缺失或格式错误（如 `taskId` 为空）。
- `401`: 未登录或 token 无效。
- `403`: 当前实施用户无权限操作该任务（不在有权限分类下）。
- `404`: 任务不存在。
- `500`: 服务器错误。

**权限**:
- 需要使用实施用户 token（`Authorization: Bearer <token>`）。
- 仅允许更新当前实施用户**有权限分类**下的任务标签。

---