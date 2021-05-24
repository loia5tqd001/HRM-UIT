import { PageContainer } from '@ant-design/pro-layout';
import { Form } from 'antd';
import React from 'react';

export const Information: React.FC = () => {
  return (
    <PageContainer title={false}>
      <Form>
        <Form.Item></Form.Item>
        <Form.Item></Form.Item>
        <Form.Item></Form.Item>
        <Form.Item></Form.Item>
      </Form>
    </PageContainer>
  );
};

export default Information;
