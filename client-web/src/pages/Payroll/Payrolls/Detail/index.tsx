import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';
import { useParams } from 'umi';

export const Detail: React.FC = (props) => {
  const { id } = useParams<any>();

  return <PageContainer>Payrolls Detail {id}</PageContainer>;
};

export default Detail;
