import ProCard from '@ant-design/pro-card';
import React from 'react';
import LeftPanel from './LeftPanel';
import { RightPanel } from './RightPanel';

const Permission: React.FC = () => {
  return (
    <ProCard split="vertical" style={{ height: '100%' }}>
      <ProCard colSpan="380px" ghost>
        <LeftPanel />
      </ProCard>
      <RightPanel />
    </ProCard>
  );
};

export default Permission;
