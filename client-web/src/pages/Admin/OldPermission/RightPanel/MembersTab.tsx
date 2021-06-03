import ProCard from '@ant-design/pro-card';
import ProList from '@ant-design/pro-list';
import { Select, Space, Tag } from 'antd';

type Props = {};

export const MembersTab: React.FC<Props> = (props) => {
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

