
query 接口可以用于处理数据查询和元数据查询。
请求方式：POST
请求头：application/json
请求路径： http://119.45.195.118:18080/rest/v2/query

参数说明:
参数名称	参数类型	是否必填	参数描述
sql	string	是	
row_limit	integer	否	一次查询能返回的结果集的最大行数。
如果不设置该参数，将使用配置文件的 rest_query_default_row_size_limit 作为默认值。
当返回结果集的行数超出限制时，将返回状态码 411。

响应参数:
参数名称	参数类型	参数描述
expressions	array	用于数据查询时结果集列名的数组，用于元数据查询时为null
column_names	array	用于元数据查询结果集列名数组，用于数据查询时为null
timestamps	array	时间戳列，用于元数据查询时为null
values	array	二维数组，第一维与结果集列名数组的长度相同，第二维数组代表结果集的一列

请求示例如下所示：
提示:为了避免OOM问题，不推荐使用select * from root.xx.** 这种查找方式。

请求示例 表达式查询:
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"SELECT temperature, humidity FROM root.cvdd.dev_2026000009  WHERE time >= 1735689600000 AND time <= 1735789600000;"}' http://119.45.195.118:18080/rest/v2/query
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