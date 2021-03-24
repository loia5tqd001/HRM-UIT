import React, { useEffect, useState } from 'react';
import { BadgeProps, Radio, Select, Space, Tag, Typography } from 'antd';
import { Button, Badge } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import ProList from '@ant-design/pro-list';
import styles from './index.less';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'umi';

type TableListItem = {
  createdAtRange?: number[];
  createdAt: number;
  code: string;
};

type DetailListProps = {
  ip: string;
};

const DetailList: React.FC<DetailListProps> = (props) => {
  const { ip } = props;
  const [tableListDataSource, setTableListDataSource] = useState<TableListItem[]>([]);

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '时间点',
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: '代码',
      key: 'code',
      width: 80,
      dataIndex: 'code',
      valueType: 'code',
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      valueType: 'option',
      render: () => [<a key="a">预警</a>],
    },
  ];

  useEffect(() => {
    const source = [];
    for (let i = 0; i < 15; i += 1) {
      source.push({
        createdAt: Date.now() - Math.floor(Math.random() * 10000),
        code: `const getData = async params => {
          const data = await getData(params);
          return { list: data.data, ...data };
        };`,
        key: i,
      });
    }

    setTableListDataSource(source);
  }, [ip]);

  const [activekey, setActiveKey] = useState<React.Key>('tab1');

  const renderBadge = (count: number, active = false) => {
    return (
      <Badge
        count={count}
        style={{
          marginTop: -2,
          marginLeft: 4,
          color: active ? '#1890FF' : '#999',
          backgroundColor: active ? '#E6F7FF' : '#eee',
        }}
      />
    );
  };

  return (
    <ProTable<TableListItem>
      columns={columns}
      dataSource={tableListDataSource}
      pagination={{
        pageSize: 3,
        showSizeChanger: false,
      }}
      rowKey="key"
      // toolBarRender={false}
      search={false}
      toolbar={{
        // filter: (
        //   <LightFilter>
        //     <ProFormDatePicker name="startdate" label="响应日期" />
        //   </LightFilter>
        // ),
        menu: {
          type: 'tab',
          activeKey: activekey,
          items: [
            {
              key: 'tab1',
              label: <span>Permissions{renderBadge(99, activekey === 'tab1')}</span>,
            },
            {
              key: 'tab2',
              label: <span>Members{renderBadge(30, activekey === 'tab2')}</span>,
            },
          ],
          onChange: (key) => {
            setActiveKey(key as string);
          },
        },
        actions: [
          <Button key="primary" type="primary">
            Edit
          </Button>,
          <Button key="primary" type="primary">
            Delete
          </Button>,
        ],
      }}
    />
  );
};

type statusType = BadgeProps['status'];

const valueEnum: statusType[] = ['success', 'error', 'processing', 'default'];

export type IpListItem = {
  ip?: string;
  mem?: number | string;
  status: statusType;
};

const ipListDataSource: IpListItem[] = [];

for (let i = 0; i < 10; i += 1) {
  ipListDataSource.push({
    ip: `106.14.98.1${i}4`,
    mem: 20,
    status: valueEnum[Math.floor(Math.random() * 10) % 4],
  });
}

type IPListProps = {
  ip: string;
  onChange: (id: string) => void;
};

const IPList: React.FC<IPListProps> = (props) => {
  const { onChange, ip } = props;

  const columns: ProColumns<IpListItem>[] = [
    {
      title: 'Role name',
      key: 'ip',
      dataIndex: 'ip',
      render: (_, item) => {
        return <Badge status={item.status} text={item.ip} />;
      },
    },
    {
      title: 'Members',
      key: 'mem',
      dataIndex: 'mem',
      valueType: {
        type: 'percent',
        precision: 0,
      },
    },
  ];

  return (
    <ProTable<IpListItem>
      columns={columns}
      request={(params, sorter, filter) => {
        // 表单搜索项会从 params 传入，传递给后端接口。
        console.log(params, sorter, filter);
        return Promise.resolve({
          data: ipListDataSource,
          success: true,
        });
      }}
      rowKey="ip"
      rowClassName={(record) => {
        return record.ip === ip ? styles['split-row-select-active'] : '';
      }}
      toolbar={{
        title: 'Roles',
        actions: [
          <Button type="primary" key="primary" onClick={() => {}}>
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ],
      }}
      options={false}
      pagination={false}
      search={false}
      onRow={(record) => {
        return {
          onClick: () => {
            if (record.ip) {
              onChange(record.ip);
            }
          },
        };
      }}
    />
  );
};

const PermissionsTab: React.FC = () => {
  const [value, setValue] = React.useState(1);
  const [vallue, setVallue] = useState('0.0.0.0');

  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const columns: ProColumns<IpListItem>[] = [
    {
      title: 'Section',
      key: 'ip',
      dataIndex: 'ip',
      render: (_, item) => {
        return <Badge status={item.status} text={item.ip} />;
      },
    },
    {
      title: 'Permission',
      key: 'mem',
      dataIndex: 'mem',
      valueType: {
        type: 'percent',
        precision: 0,
      },
      render: (_, item) => {
        return (
          <Select
            defaultValue="no_acsess"
            style={{ width: 120 }}
            onChange={(values) => console.log(values)}
          >
            <Select.Option value="no_acsess">No access</Select.Option>
            <Select.Option value="view_only">View only</Select.Option>
            <Select.Option value="view_and_edit">View and edit</Select.Option>
          </Select>
        );
      },
    },
  ];

  return (
    <ProCard split="vertical">
      <Space direction="horizontal" style={{ marginBottom: 10 }}>
        <Typography.Text style={{ marginRight: 10 }}>
          Users of this role can access information of:
        </Typography.Text>
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={1}>All employees</Radio>
          <Radio value={2}>Direct & Indirect reports</Radio>
          <Radio value={3}>Direct reports</Radio>
        </Radio.Group>
      </Space>
      <ProTable<IpListItem>
        columns={columns}
        request={(params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          console.log(params, sorter, filter);
          return Promise.resolve({
            data: ipListDataSource,
            success: true,
          });
        }}
        rowKey="ip"
        rowClassName={(record) => {
          return record.ip === vallue ? styles['split-row-select-active'] : '';
        }}
        toolBarRender={false}
        options={false}
        pagination={false}
        search={false}
        onRow={(record) => {
          return {
            onClick: () => {
              if (record.ip) {
                onChange(record.ip);
              }
            },
          };
        }}
      />
    </ProCard>
  );
};

const MembersTab: React.FC = () => {
  function onChange(value) {
    console.log(`selected ${value}`);
  }

  function onBlur() {
    console.log('blur');
  }

  function onFocus() {
    console.log('focus');
  }

  function onSearch(val) {
    console.log('search:', val);
  }

  const dataSource = [
    {
      id: '1',
      name: 'Name1',
      image:
        'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
      desc: 'Description',
    },
    {
      id: '2',
      name: 'Name1',
      image:
        'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
      desc: 'Description',
    },
    {
      id: '3',
      name: 'Name1',
      image:
        'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
      desc: 'Description',
    },
    {
      id: '4',
      name: 'Name1',
      image:
        'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
      desc: 'Description',
    },
  ];

  return (
    <ProCard split="vertical">
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder="Add a member"
        optionFilterProp="children"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onSearch={onSearch}
        filterOption={(input, option) =>
          option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Select.Option value="jack">Jack</Select.Option>
        <Select.Option value="lucy">Lucy</Select.Option>
        <Select.Option value="tom">Tom</Select.Option>
      </Select>
      <ProList<typeof dataSource[number]>
        rowKey="id"
        dataSource={dataSource}
        // showActions="always"
        editable={{
          onChange: (e) => console.log(e),
        }}
        metas={{
          title: {
            dataIndex: 'name',
          },
          avatar: {
            dataIndex: 'image',
          },
          description: {
            dataIndex: 'desc',
          },
          subTitle: {
            render: () => {
              return (
                <Space size={0}>
                  <Tag color="#5BD8A6">Admin</Tag>
                </Space>
              );
            },
          },
          actions: {
            render: (text, row, index, action) => [
              <a
                onClick={() => {
                  action.startEditable(row.id);
                }}
                key="link"
              >
                Remove
              </a>,
            ],
          },
        }}
      />
    </ProCard>
  );
};

const Permission: React.FC = () => {
  const [ip, setIp] = useState('0.0.0.0');
  const [tab, setTab] = useState('tab1');

  return (
    <ProCard split="vertical">
      <ProCard colSpan="380px" ghost>
        <IPList onChange={(cIp) => setIp(cIp)} ip={ip} />
      </ProCard>
      <ProCard
        title={ip}
        subTitle=". Description of role"
        extra={[
          <Space>
            <Button key="primary" type="primary">
              Edit
            </Button>
            <Button key="primary" type="primary">
              Delete
            </Button>
          </Space>,
        ]}
        tabs={{
          activeKey: tab,
          onChange: (key) => {
            setTab(key);
          },
        }}
      >
        <ProCard.TabPane key="tab1" tab="Permissions">
          <PermissionsTab />
        </ProCard.TabPane>
        <ProCard.TabPane key="tab2" tab="Members">
          <MembersTab />
        </ProCard.TabPane>
      </ProCard>
    </ProCard>
  );
};

export default Permission;
