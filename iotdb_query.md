



请求示例 表达式查询:
curl -H "Content-Type:application/json" -X POST --data '{"sql":"SELECT temperature, humidity FROM root.cvdd.dev_2026000009 LIMIT 1440"}' /api/iotdb/query
·
响应示例:
{
    "expressions": [
        "root.cvdd.dev_2026000009.temperature",
        "root.cvdd.dev_2026000009.humidity"
    ],
    "column_names": null,
    "data_types": [
        "DOUBLE",
        "DOUBLE"
    ],
    "timestamps": [
        1767196800000,
        1767196860000,
        1767196920000,
        1767196980000,
        1767197040000,
        1767197100000,
        1767197160000,
        1767197220000,
        1767197280000,
        1767197340000
    ],
    "values": [
        [
            2.6,
            3.5,
            2.1,
            2.2,
            2.5,
            2.1,
            3.0,
            2.7,
            4.0,
            2.6
        ],
        [
            63.5,
            58.9,
            57.7,
            55.7,
            59.0,
            67.5,
            69.8,
            53.9,
            52.5,
            58.4
        ]
    ]
}