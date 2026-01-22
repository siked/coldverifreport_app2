# GatewayDevice 接口文档

## 概述

本文档描述了 UserEnf 模型中 `gatewayDeviceSnList` 字段的相关接口和数据格式。

## 数据格式

`gatewayDeviceSnList` 字段的数据格式为：

```typescript
gatewayDeviceSnList?: {
  gatewaySn: string;
  deviceSnList: string[];
  remark?: string;  // 备注（可选）
  color?: string;   // 颜色（可选）
}[]
```

### 示例数据

```json
[
  {
    "gatewaySn": "W00001",
    "deviceSnList": ["SN001", "SN002", "SN003"],
    "remark": "主楼网关",
    "color": "#FF5733"
  },
  {
    "gatewaySn": "W00002",
    "deviceSnList": ["SN004", "SN005", "SN006"],
    "remark": "副楼网关",
    "color": "#33FF57"
  },
  {
    "gatewaySn": "W00003",
    "deviceSnList": ["SN007", "SN008"],
    "remark": "测试网关"
  }
]
```

## API 接口

### 获取自己的网关设备列表

**接口**: `GET /api/user-enf/gateway-devices`

**描述**: 获取当前登录用户的 `gatewayDeviceSnList` 字段

**认证**: 需要有效的用户 token

**请求头**:
```
Cookie: token=<user_token>
```

**响应示例**:
```json
{
  "gatewayDeviceSnList": [
    {
      "gatewaySn": "W00001",
      "deviceSnList": ["SN001", "SN002", "SN003"],
      "remark": "主楼网关",
      "color": "#FF5733"
    },
    {
      "gatewaySn": "W00002",
      "deviceSnList": ["SN004", "SN005", "SN006"],
      "remark": "副楼网关",
      "color": "#33FF57"
    }
  ]
}
```

### 更新自己的网关设备列表

**接口**: `PUT /api/user-enf/gateway-devices`

**描述**: 用户通过 token 更新自己的 `gatewayDeviceSnList` 字段，无需传递用户 ID

**认证**: 需要有效的用户 token

**请求头**:
```
Cookie: token=<user_token>
```

**请求体**:
```json
{
  "gatewayDeviceSnList": [
    {
      "gatewaySn": "W00001",
      "deviceSnList": ["SN001", "SN002", "SN003"],
      "remark": "主楼网关",
      "color": "#FF5733"
    },
    {
      "gatewaySn": "W00002",
      "deviceSnList": ["SN004", "SN005", "SN006"],
      "remark": "副楼网关",
      "color": "#33FF57"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true
}
```

## 数据验证

- `gatewaySn`: 字符串类型，必填，网关序列号
- `deviceSnList`: 字符串数组类型，必填，设备序列号列表
- `remark`: 字符串类型，可选，网关备注信息
- `color`: 字符串类型，可选，网关颜色标识（建议使用十六进制颜色值，如 #FF5733）

