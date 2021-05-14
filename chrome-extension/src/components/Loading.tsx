import React from 'react';
import {Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 14 }} spin />;
export default () => <Spin indicator={antIcon} />