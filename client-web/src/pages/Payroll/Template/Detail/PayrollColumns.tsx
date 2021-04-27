import { ArrowLeftOutlined, ArrowRightOutlined, MenuOutlined } from '@ant-design/icons';
import { Card, Form, Input, Popconfirm, Table, List, Avatar, Drawer, Menu, Button, Space, Typography } from 'antd';
// import 'antd/dist/antd.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import './index.css';
import { SplitPane } from 'react-collapse-pane';

const EditableContext = React.createContext(null);

const TableContext = React.createContext(null);

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editable ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const DragHandle = SortableHandle(({ index }) => (
  <Space>
    <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
    <Typography.Title level={3}>{index + 1}</Typography.Title>
  </Space>
));

// this.columns = [
//   {
//     title: "name",
//     dataIndex: "name",
//     width: "30%",
//     editable: true
//   },
//   {
//     title: "age",
//     dataIndex: "age"
//   },
//   {
//     title: "address",
//     dataIndex: "address"
//   },
// {
//   title: "operation",
//   dataIndex: "operation",
//   render: (_, record) =>
//     this.state.dataSource.length >= 1 ? (
//       <Popconfirm
//         title="Sure to delete?"
//         onConfirm={() => this.handleDelete(record.key)}
//       >
//         <a>Delete</a>
//       </Popconfirm>
//     ) : null
// }
// ];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    index: 0,
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    index: 1,
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    index: 2,
  },
];

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableList = SortableContainer((props) => <tbody {...props} />);

const DraggableBodyRow = ({ className, style, ...restProps }) => {
  const [form] = Form.useForm();
  const { dataSource } = useContext(TableContext);
  // function findIndex base on Table rowKey props and should always be a right array index
  const index = dataSource.findIndex((x) => x.index === restProps['data-row-key']);
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <SortableItem index={index} {...restProps} />
      </EditableContext.Provider>
    </Form>
  );
};

class SortableTable extends React.Component {
  state = {
    dataSource: data,
    count: 2,
  };

  columns = [
    {
      title: '#',
      dataIndex: 'sort',
      width: 30,
      className: 'drag-visible',
      render: (_, __, index) => <DragHandle index={index} />,
    },
    {
      title: 'Variable name',
      dataIndex: 'name',
      className: 'drag-visible',
      editable: true,
    },
    {
      title: 'Type',
      dataIndex: 'age',
      editable: true,
    },
    {
      title: 'Define',
      dataIndex: 'address',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) =>
        this.state.dataSource.length >= 1 ? (
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter((el) => !!el);
      console.log('Sorted items: ', newData);
      this.setState({ dataSource: newData });
    }
  };

  DraggableContainer = (props) => (
    <SortableList
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };
  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: '32',
      address: `London, Park Lane no. ${count}`,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  render() {
    const { dataSource } = this.state;

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
      <TableContext.Provider value={this.state}>
        <Table
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          rowKey="index"
          components={{
            body: {
              wrapper: this.DraggableContainer,
              row: DraggableBodyRow,
              cell: EditableCell,
            },
          }}
          rowClassName={() => 'editable-row'}
          bordered
        />
      </TableContext.Provider>
    );
  }
}

export const PayrollColumns: React.FC = () => {
  const data = [
    {
      title: 'Ant Design Title 1',
    },
    {
      title: 'Ant Design Title 2',
    },
    {
      title: 'Ant Design Title 3',
    },
    {
      title: 'Ant Design Title 4',
    },
  ];

  const [visible, setVisible] = useState(true);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };
  const [collapsed, setCollapse] = useState(false);

  const resizerCss = {
    height: '1px',
    background: 'rgba(0, 0, 0, 0.1)',
  };
  const resizerHoverCss = {
    height: '10px',
    marginTop: '-10px',
    backgroundImage:
      'radial-gradient(at center center,rgba(0,0,0,0.2) 0%,transparent 70%,transparent 100%)',
    backgroundSize: '100% 50px',
    backgroundPosition: '50% 0',
    backgroundRepeat: 'no-repeat',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* <Button onClick={() => setVisible(!visible)}>Toggle</Button> */}
      <Card title="Columns configuration" style={{ minHeight: '50vh' }}>
        {/* <SplitPane style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}> */}
        <SplitPane
          split="vertical"
          initialSizes={[800, 300]}
          minSizes={[50, 100]}
          collapseOptions={{
            beforeToggleButton: (
              <Button>
                <ArrowRightOutlined />
              </Button>
            ),
            afterToggleButton: (
              <Button>
                <ArrowLeftOutlined />
              </Button>
            ),
            collapseDirection: 'right',
          }}
          resizerOptions={{
            css: resizerCss,
            hoverCss: resizerHoverCss,
            grabberSize: '1rem',
          }}
          hooks={{
            onCollapse: (it) => setCollapse(!!it[1]),
            // onDragStarted: action('onDragStarted'),
            // onSaveSizes: action('onDragFinished'),
          }}
        >
          <div style={{ margin: '0 12px' }}>
            <SortableTable />
          </div>
          <List
            style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.3s' }}
            itemLayout="horizontal"
            dataSource={data}
            bordered
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title={<a href="https://ant.design">{item.title}</a>}
                  description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                />
              </List.Item>
            )}
          />
          {/* <div
            style={{
              width: visible ? 300 : 0,
              height: visible ? '100%' : 0,
              transition: 'width 0.5s, opacity 0.5s',
              opacity: visible ? 1 : 0,
              overflow: 'hidden',
            }}
          ></div> */}

          {/* <Drawer
            title="Basic Drawer"
            placement="right"
            closable={false}
            onClose={onClose}
            visible={visible}
            mask={false}
          >
            <List
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    }
                    title={<a href="https://ant.design">{item.title}</a>}
                    description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                  />
                </List.Item>
              )}
            />
          </Drawer> */}
          {/* <Menu></Menu> */}
        </SplitPane>
      </Card>
    </div>
  );
};
